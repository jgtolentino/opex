"""RAG client for hybrid search across Supabase, Notion, and GitHub."""

import os
from typing import Optional

import httpx
import structlog
from openai import OpenAI
from tenacity import retry, stop_after_attempt, wait_exponential

from prompts import SYSTEM_PROMPT, build_rag_prompt, format_citations, assess_confidence

logger = structlog.get_logger()

# Initialize OpenRouter client (OpenAI-compatible API)
openrouter_client = OpenAI(
    api_key=os.getenv("OPENROUTER_API_KEY"),
    base_url="https://openrouter.ai/api/v1"
)


class RAGClient:
    """Hybrid RAG client for OpEx knowledge base."""

    def __init__(self):
        self.rag_backend_url = os.getenv("RAG_BACKEND_URL", "")
        self.supabase_url = os.getenv("SUPABASE_URL", "")
        self.supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
        self.timeout = int(os.getenv("REQUEST_TIMEOUT", "30"))

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        reraise=True,
    )
    async def retrieve(self, question: str, user_id: str, limit: int = 5) -> list[dict]:
        """
        Retrieve relevant documents using hybrid search.

        Priority:
        1. RAG backend (if configured) - for hybrid search
        2. Supabase pgvector search - for document embeddings
        3. Fallback to dummy context for development
        """
        # Try RAG backend first
        if self.rag_backend_url:
            try:
                async with httpx.AsyncClient(timeout=self.timeout) as client:
                    response = await client.post(
                        f"{self.rag_backend_url}/retrieve",
                        json={"query": question, "user_id": user_id, "limit": limit},
                    )
                    response.raise_for_status()
                    data = response.json()
                    logger.info("rag_backend_success", hits=len(data.get("hits", [])))
                    return data.get("hits", [])
            except Exception as e:
                logger.warning("rag_backend_failed", error=str(e))

        # Try Supabase pgvector search
        if self.supabase_url and self.supabase_key:
            try:
                hits = await self._supabase_search(question, limit)
                if hits:
                    logger.info("supabase_search_success", hits=len(hits))
                    return hits
            except Exception as e:
                logger.warning("supabase_search_failed", error=str(e))

        # Fallback: return development dummy context
        logger.info("using_fallback_context")
        return self._get_fallback_context(question)

    async def _supabase_search(self, question: str, limit: int) -> list[dict]:
        """Search Supabase using pgvector similarity."""
        # TODO: Replace with actual Supabase client when vector search is ready
        # For now, return empty to trigger fallback
        return []

    def _get_fallback_context(self, question: str) -> list[dict]:
        """Development fallback context."""
        # Common OpEx topics with example content
        if "credential" in question.lower() or "rotate" in question.lower():
            return [
                {
                    "title": "Credential Rotation Best Practices",
                    "snippet": "To rotate credentials: 1. Generate new keys in service dashboard 2. Update environment secrets via doctl/supabase CLI 3. Redeploy services 4. Verify connectivity 5. Revoke old credentials",
                    "url": "https://docs.example.com/security/rotation",
                    "score": 0.88,
                }
            ]
        elif "ocr" in question.lower():
            return [
                {
                    "title": "OCR Service Configuration",
                    "snippet": "OCR service uses PaddleOCR-VL-900M with auto-approval threshold at 0.85 confidence. Deployment via DigitalOcean App Platform with 2GB RAM minimum.",
                    "url": "https://docs.example.com/services/ocr",
                    "score": 0.92,
                }
            ]
        elif "deploy" in question.lower():
            return [
                {
                    "title": "Deployment Workflow",
                    "snippet": "Standard deployment: 1. Update app spec YAML 2. Run `doctl apps update <id> --spec <file>` 3. Trigger deployment with `doctl apps create-deployment <id>` 4. Monitor logs with `doctl apps logs <id> --follow`",
                    "url": "https://docs.example.com/deployment/workflow",
                    "score": 0.90,
                }
            ]
        else:
            return [
                {
                    "title": "OpEx Knowledge Base",
                    "snippet": "General OpEx documentation covering infrastructure, services, and operational procedures. Use /ask-human for specific questions not in docs.",
                    "url": "https://docs.example.com/",
                    "score": 0.65,
                }
            ]

    @retry(
        stop=stop_after_attempt(2),
        wait=wait_exponential(multiplier=1, min=1, max=5),
        reraise=True,
    )
    async def synthesize(
        self, question: str, context_docs: list[dict]
    ) -> tuple[str, list[str], float, str]:
        """
        Synthesize answer using OpenRouter (DeepSeek) with RAG context.

        Returns:
            (answer, citations, confidence_score, confidence_level)
        """
        # Build prompt
        prompt = build_rag_prompt(question, context_docs)

        # Assess confidence before LLM call
        confidence_score, confidence_level = assess_confidence(context_docs)

        logger.info(
            "synthesizing_answer",
            question=question[:100],
            num_docs=len(context_docs),
            confidence=confidence_level,
        )

        # Call OpenRouter with DeepSeek model
        try:
            response = openrouter_client.chat.completions.create(
                model="deepseek/deepseek-chat",
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=2048,
                temperature=0.3,  # Lower temp for factual accuracy
                stream=False
            )

            answer = response.choices[0].message.content

            # Format citations
            citations = format_citations(context_docs)

            logger.info(
                "synthesis_complete",
                answer_length=len(answer),
                confidence=confidence_level,
            )

            return answer, citations, confidence_score, confidence_level

        except Exception as e:
            logger.error("synthesis_failed", error=str(e))
            # Return fallback response
            fallback_answer = f"""I encountered an error processing your question: {question}

Please try:
1. Rephrasing your question
2. Using `/ask-human` to escalate to a human expert

Error: {str(e)[:100]}"""
            return fallback_answer, [], 0.0, "low"


# Singleton instance
rag_client = RAGClient()


async def retrieve_and_synthesize(
    question: str, user_id: str
) -> tuple[str, str, float, str]:
    """
    Complete RAG pipeline: retrieve → synthesize → format.

    Returns:
        (answer, citations_markdown, confidence_score, confidence_level)
    """
    # Retrieve context
    context_docs = await rag_client.retrieve(question, user_id)

    # Synthesize answer
    answer, citations, confidence_score, confidence_level = await rag_client.synthesize(
        question, context_docs
    )

    # Format citations as markdown
    citations_md = f"**Sources**\n{citations}" if citations else "_No sources available._"

    return answer, citations_md, confidence_score, confidence_level
