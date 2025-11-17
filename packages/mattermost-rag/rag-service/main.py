"""FastAPI slash-command handler for Mattermost RAG integration."""

import os
from typing import Optional

import httpx
import structlog
from fastapi import FastAPI, BackgroundTasks, Form, HTTPException, Request
from fastapi.responses import JSONResponse

from rag_client import retrieve_and_synthesize

# Configure structured logging
structlog.configure(
    processors=[
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.stdlib.add_log_level,
        structlog.processors.JSONRenderer(),
    ]
)
logger = structlog.get_logger()

app = FastAPI(title="Mattermost RAG Service", version="1.0.0")

# Configuration
MM_SITE_URL = os.getenv("MM_SITE_URL", "http://mattermost:8065").rstrip("/")
MM_BOT_TOKEN = os.getenv("MM_BOT_TOKEN", "")
MM_SLASH_TOKEN = os.getenv("MM_SLASH_TOKEN", "")
MAX_CONCURRENT = int(os.getenv("MAX_CONCURRENT_REQUESTS", "10"))


# ---------- Mattermost API helpers ----------


async def mm_post_message(
    channel_id: str, message: str, root_id: Optional[str] = None
) -> dict:
    """Post a message to Mattermost as the bot."""
    url = f"{MM_SITE_URL}/api/v4/posts"
    headers = {"Authorization": f"Bearer {MM_BOT_TOKEN}"}
    payload = {"channel_id": channel_id, "message": message}
    if root_id:
        payload["root_id"] = root_id

    async with httpx.AsyncClient(timeout=20) as client:
        try:
            response = await client.post(url, json=payload, headers=headers)
            response.raise_for_status()
            logger.info("message_posted", channel_id=channel_id, root_id=root_id)
            return response.json()
        except httpx.HTTPError as e:
            logger.error("mm_post_failed", error=str(e), status=e.response.status_code if hasattr(e, 'response') else None)
            raise


async def mm_add_reaction(post_id: str, emoji_name: str):
    """Add reaction emoji to a post."""
    url = f"{MM_SITE_URL}/api/v4/reactions"
    headers = {"Authorization": f"Bearer {MM_BOT_TOKEN}"}
    payload = {"post_id": post_id, "emoji_name": emoji_name}

    async with httpx.AsyncClient(timeout=10) as client:
        try:
            response = await client.post(url, json=payload, headers=headers)
            response.raise_for_status()
            logger.info("reaction_added", post_id=post_id, emoji=emoji_name)
        except httpx.HTTPError as e:
            logger.warning("reaction_failed", error=str(e))


# ---------- Core RAG workflow ----------


async def process_question(
    user_id: str,
    channel_id: str,
    question: str,
    root_id: Optional[str],
    trigger_id: Optional[str],
):
    """Background task: RAG pipeline + post answer to Mattermost."""
    try:
        logger.info(
            "processing_question",
            user_id=user_id,
            channel_id=channel_id,
            question=question[:100],
        )

        # Run RAG pipeline
        answer, citations, confidence_score, confidence_level = (
            await retrieve_and_synthesize(question, user_id)
        )

        # Format response
        response_text = render_answer(answer, citations, confidence_score, confidence_level)

        # Post to channel
        post = await mm_post_message(
            channel_id=channel_id, message=response_text, root_id=root_id
        )

        # Add confidence indicator emoji
        if confidence_level == "high":
            await mm_add_reaction(post["id"], "+1")
        elif confidence_level == "medium":
            await mm_add_reaction(post["id"], "thinking_face")
        else:
            await mm_add_reaction(post["id"], "question")

        logger.info(
            "question_processed",
            user_id=user_id,
            confidence=confidence_level,
            post_id=post["id"],
        )

    except Exception as e:
        logger.error("processing_failed", error=str(e), question=question[:100])
        # Post error to channel
        error_msg = f"""Sorry, I encountered an error processing your question:

> {question}

**Error**: {str(e)[:200]}

Please try:
- Rephrasing your question
- Using `/ask-human` to escalate to a human expert"""

        await mm_post_message(channel_id=channel_id, message=error_msg, root_id=root_id)


def render_answer(answer: str, citations: str, confidence: float, level: str) -> str:
    """Format final answer with citations and metadata."""
    # Confidence emoji
    emoji = {
        "high": "✅",
        "medium": "⚠️",
        "low": "❓",
    }.get(level, "ℹ️")

    return f"""{answer}

---

{citations}

{emoji} **Confidence**: {level.title()} ({confidence:.2f})

**Feedback**: 👍 Helpful? | 👎 Not helpful? | `/ask-human` to escalate"""


# ---------- API endpoints ----------


@app.get("/health")
async def health_check():
    """Health check endpoint for Docker healthcheck."""
    return {"status": "healthy", "service": "mattermost-rag"}


@app.post("/mm/ask")
async def mm_ask(
    background_tasks: BackgroundTasks,
    token: str = Form(...),
    user_id: str = Form(...),
    channel_id: str = Form(...),
    text: str = Form(""),
    root_id: str = Form(None),
    trigger_id: str = Form(None),
    command: str = Form("/ask"),
):
    """
    Mattermost slash command handler for /ask.

    Workflow:
    1. Validate slash command token
    2. Return immediate ephemeral acknowledgment
    3. Process question in background
    4. Post answer to channel as bot
    """
    # Verify token
    if MM_SLASH_TOKEN and token != MM_SLASH_TOKEN:
        logger.warning("invalid_token_attempt", user_id=user_id)
        raise HTTPException(status_code=403, detail="Invalid slash command token")

    question = text.strip()

    # Validate input
    if not question:
        return {
            "response_type": "ephemeral",
            "text": "**Usage**: `/ask <your question>`\n\nExample: `/ask how do I rotate database credentials?`",
        }

    # Length validation
    if len(question) > 500:
        return {
            "response_type": "ephemeral",
            "text": "⚠️ Question too long (max 500 characters). Please shorten your question.",
        }

    # Log request
    logger.info(
        "slash_command_received",
        user_id=user_id,
        channel_id=channel_id,
        question=question[:100],
    )

    # Start background processing
    background_tasks.add_task(
        process_question, user_id, channel_id, question, root_id, trigger_id
    )

    # Immediate ephemeral response
    return {
        "response_type": "ephemeral",
        "text": f"🔍 Searching knowledge base for:\n> {question}\n\n_This may take a few seconds..._",
    }


@app.post("/mm/ask-human")
async def mm_ask_human(
    token: str = Form(...),
    user_id: str = Form(...),
    channel_id: str = Form(...),
    text: str = Form(""),
    root_id: str = Form(None),
):
    """
    Escalation slash command: /ask-human

    Creates a post that notifies human experts.
    """
    # Verify token
    if MM_SLASH_TOKEN and token != MM_SLASH_TOKEN:
        raise HTTPException(status_code=403, detail="Invalid slash command token")

    question = text.strip()
    if not question:
        return {
            "response_type": "ephemeral",
            "text": "**Usage**: `/ask-human <your question>`\n\nThis will notify human experts.",
        }

    logger.info("human_escalation", user_id=user_id, question=question[:100])

    # Post escalation message
    escalation_msg = f"""🆘 **Human Expert Needed**

**Question**: {question}

**Requested by**: <@{user_id}>

@channel - Can someone help with this?"""

    await mm_post_message(channel_id=channel_id, message=escalation_msg, root_id=root_id)

    return {
        "response_type": "ephemeral",
        "text": "✅ Your question has been escalated to human experts.",
    }


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler for unhandled errors."""
    logger.error("unhandled_exception", error=str(exc), path=request.url.path)
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error", "detail": str(exc)[:200]},
    )


# Startup logging
# ---------- Webhook endpoints ----------


@app.post("/mm/incoming-webhook")
async def handle_incoming_webhook(request: Request):
    """Handle incoming webhook notifications from external systems"""
    try:
        data = await request.json()
        logger.info("incoming_webhook_received", data_type=data.get("type", "unknown"))

        # Process different notification types
        notification_type = data.get("type", "alert")

        if notification_type == "rag_result":
            await post_rag_result(data)
        elif notification_type == "system_alert":
            await post_system_alert(data)
        elif notification_type == "document_update":
            await post_document_update(data)

        return {"status": "processed", "type": notification_type}

    except Exception as e:
        logger.error("incoming_webhook_failed", error=str(e))
        raise HTTPException(status_code=500, detail="Failed to process webhook")


async def post_rag_result(data: dict):
    """Post RAG query results via incoming webhook"""
    question = data.get("question", "")
    answer = data.get("answer", "")
    confidence = data.get("confidence", 0.0)

    message = f"""🤖 **RAG Query Result**

**Question**: {question}

**Answer**: {answer}

**Confidence**: {confidence:.2f}"""

    await send_webhook_message(message, data.get("channel"))


async def post_system_alert(data: dict):
    """Post system alerts via incoming webhook"""
    alert_level = data.get("level", "info")
    title = data.get("title", "System Alert")
    message = data.get("message", "")

    emoji = {
        "critical": "🚨",
        "warning": "⚠️",
        "info": "ℹ️",
        "success": "✅"
    }.get(alert_level, "ℹ️")

    formatted_message = f"""{emoji} **{title}**

{message}"""

    await send_webhook_message(formatted_message, data.get("channel"))


async def post_document_update(data: dict):
    """Post document update notifications"""
    action = data.get("action", "updated")
    document = data.get("document", "")
    user = data.get("user", "system")

    message = f"""📄 **Document {action.title()}**

**Document**: {document}
**Updated by**: {user}"""

    await send_webhook_message(message, data.get("channel"))


async def send_webhook_message(message: str, channel: str = None):
    """Send message via incoming webhook"""
    webhook_url = os.getenv("MM_INCOMING_WEBHOOK_URL")
    if not webhook_url:
        logger.warning("no_incoming_webhook_url")
        return

    payload = {
        "text": message,
        "username": "OpEx RAG System",
        "icon_url": "https://example.com/rag-system.png"
    }

    if channel:
        payload["channel"] = channel

    async with httpx.AsyncClient(timeout=10) as client:
        try:
            response = await client.post(webhook_url, json=payload)
            response.raise_for_status()
            logger.info("webhook_message_sent", channel=channel)
        except httpx.HTTPError as e:
            logger.error("webhook_send_failed", error=str(e))


@app.post("/mm/outgoing-webhook")
async def handle_outgoing_webhook(request: Request):
    """Handle outgoing webhook from Mattermost for natural language queries"""
    try:
        data = await request.json()

        # Verify token
        token = data.get("token")
        expected_token = os.getenv("MM_OUTGOING_WEBHOOK_TOKEN")
        if expected_token and token != expected_token:
            logger.warning("invalid_outgoing_token", user=data.get("user_name"))
            raise HTTPException(status_code=403, detail="Invalid webhook token")

        text = data.get("text", "")
        user_name = data.get("user_name", "")
        channel_id = data.get("channel_id", "")

        logger.info("outgoing_webhook_received", user=user_name, text=text[:100])

        # Process natural language queries
        if any(trigger in text.lower() for trigger in ["@opex", "@rag", "ask about"]):
            query = clean_query(text)
            answer, citations, confidence_score, confidence_level = await retrieve_and_synthesize(query, user_name)

            response_text = render_answer(answer, citations, confidence_score, confidence_level)

            return {
                "text": f"@{user_name} {response_text}",
                "response_type": "in_channel",
                "username": "OpEx RAG",
                "icon_url": "https://example.com/rag-bot.png"
            }

        # Empty response for no action
        return {"text": ""}

    except Exception as e:
        logger.error("outgoing_webhook_failed", error=str(e))
        return {"text": f"Sorry @{data.get('user_name', 'user')}, I encountered an error processing your request."}


def clean_query(text: str) -> str:
    """Clean query text by removing triggers and mentions"""
    triggers = ["@opex", "@rag", "ask about"]
    for trigger in triggers:
        text = text.replace(trigger, "").strip()

    # Remove user mentions
    import re
    text = re.sub(r'@\w+', '', text).strip()

    return text


@app.on_event("startup")
async def startup_event():
    logger.info(
        "service_starting",
        mm_site_url=MM_SITE_URL,
        has_bot_token=bool(MM_BOT_TOKEN),
        has_slash_token=bool(MM_SLASH_TOKEN),
        has_incoming_webhook=bool(os.getenv("MM_INCOMING_WEBHOOK_URL")),
        has_outgoing_webhook=bool(os.getenv("MM_OUTGOING_WEBHOOK_TOKEN")),
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
