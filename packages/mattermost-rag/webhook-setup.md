# Mattermost Webhook Integration Setup

## Overview
This document outlines the webhook integrations needed for the Mattermost RAG system.

## 1. Incoming Webhooks
**Purpose**: Allow external integrations to send messages to Mattermost channels

### Configuration Steps:

#### Step 1: Create Incoming Webhook in Mattermost
1. Go to **System Console > Integrations > Incoming Webhooks**
2. Click **Add Incoming Webhook**
3. Configure:
   - **Title**: `OpEx RAG Notifications`
   - **Description**: `Send notifications from RAG system to Mattermost`
   - **Channel**: `#opex-rag-alerts` (create this channel first)
   - **Trigger Words**: (optional) `alert`, `notification`, `update`

#### Step 2: Webhook URL
The webhook URL will look like:
```
https://chat.insightpulseai.net/hooks/xxxxxxxxxxxxxxxxxxxxxxxx
```

#### Step 3: Environment Variables
Add to your `.env` file:
```bash
MM_INCOMING_WEBHOOK_URL=https://chat.insightpulseai.net/hooks/xxxxxxxxxxxxxxxxxxxxxxxx
```

#### Step 4: Usage Example
```python
import httpx
import os

async def send_alert_to_mattermost(message: str, channel: str = None):
    """Send alert via incoming webhook"""
    webhook_url = os.getenv("MM_INCOMING_WEBHOOK_URL")

    payload = {
        "text": message,
        "username": "OpEx RAG Bot",
        "icon_url": "https://example.com/bot-icon.png"
    }

    if channel:
        payload["channel"] = channel

    async with httpx.AsyncClient() as client:
        await client.post(webhook_url, json=payload)
```

## 2. Outgoing Webhooks
**Purpose**: Allow Mattermost to send messages to external integrations and receive responses

### Configuration Steps:

#### Step 1: Create Outgoing Webhook in Mattermost
1. Go to **System Console > Integrations > Outgoing Webhooks**
2. Click **Add Outgoing Webhook**
3. Configure:
   - **Title**: `OpEx RAG Query Handler`
   - **Description**: `Process RAG queries from Mattermost messages`
   - **Channel**: `#general` (or specific channels)
   - **Trigger Words**: `@opex`, `@rag`, `ask about`
   - **Callback URLs**: `https://your-rag-service.com/mm/webhook`
   - **Content Type**: `application/json`

#### Step 2: Webhook Configuration
- **Trigger When**: `First word matches a trigger word`
- **HTTP Method**: `POST`
- **Username**: `OpEx RAG`
- **Icon URL**: (optional bot icon)

#### Step 3: Environment Variables
Add to your `.env` file:
```bash
MM_OUTGOING_WEBHOOK_TOKEN=your_outgoing_webhook_token
```

#### Step 4: Implementation Example
```python
from fastapi import FastAPI, Request, HTTPException
import hmac
import hashlib

app = FastAPI()

@app.post("/mm/webhook")
async def handle_outgoing_webhook(request: Request):
    """Handle outgoing webhook from Mattermost"""
    data = await request.json()

    # Verify webhook token
    token = data.get("token")
    if token != os.getenv("MM_OUTGOING_WEBHOOK_TOKEN"):
        raise HTTPException(status_code=403, detail="Invalid webhook token")

    # Extract message data
    text = data.get("text", "")
    user_name = data.get("user_name", "")
    channel_name = data.get("channel_name", "")

    # Process RAG query
    if "ask about" in text.lower():
        query = extract_query(text)
        answer = await process_rag_query(query)

        return {
            "text": f"@{user_name} {answer}",
            "response_type": "in_channel"
        }

    return {"text": ""}  # Empty response for no action

def extract_query(text: str) -> str:
    """Extract query from trigger-based message"""
    # Remove trigger words and clean up
    triggers = ["ask about", "@opex", "@rag"]
    for trigger in triggers:
        text = text.replace(trigger, "").strip()
    return text
```

## 3. App Directory Integration
**Purpose**: Self-hosted app discovery and management

### Configuration Steps:

#### Step 1: Enable App Framework
1. Go to **System Console > Plugins > Management**
2. Enable **Plugin Management**
3. Enable **Apps Framework**

#### Step 2: Configure App Directory
1. Go to **System Console > Plugins > Plugin Management**
2. Set **Enable Marketplace** to `true`
3. Set **Enable Automatic Prepackaged Plugins** to `true`

#### Step 3: Self-Hosted Apps
For custom RAG apps, create a `manifest.json`:

```json
{
  "app_id": "opex-rag-integration",
  "name": "OpEx RAG Assistant",
  "description": "AI-powered operational excellence assistant",
  "homepage_url": "https://your-domain.com",
  "requested_permissions": [
    "act_as_bot",
    "act_as_user"
  ],
  "requested_locations": [
    "/command"
  ],
  "http": {
    "root_url": "https://your-rag-service.com"
  }
}
```

## 4. Complete Webhook Integration

### Updated main.py with Webhooks

```python
# Add to existing main.py

@app.post("/mm/incoming-webhook")
async def handle_incoming_webhook(request: Request):
    """Handle incoming webhook notifications"""
    data = await request.json()

    # Process different notification types
    notification_type = data.get("type", "alert")

    if notification_type == "rag_result":
        await post_rag_result(data)
    elif notification_type == "system_alert":
        await post_system_alert(data)

    return {"status": "processed"}

@app.post("/mm/outgoing-webhook")
async def handle_outgoing_webhook(request: Request):
    """Handle outgoing webhook from Mattermost"""
    data = await request.json()

    # Verify token
    token = data.get("token")
    expected_token = os.getenv("MM_OUTGOING_WEBHOOK_TOKEN")
    if token != expected_token:
        raise HTTPException(status_code=403, detail="Invalid webhook token")

    text = data.get("text", "")
    user_name = data.get("user_name", "")
    channel_id = data.get("channel_id", "")

    # Process natural language queries
    if any(trigger in text.lower() for trigger in ["@opex", "@rag", "ask about"]):
        query = clean_query(text)
        answer = await retrieve_and_synthesize(query, user_name)

        return {
            "text": f"@{user_name} {answer}",
            "response_type": "in_channel",
            "username": "OpEx RAG",
            "icon_url": "https://example.com/rag-bot.png"
        }

    return {"text": ""}

def clean_query(text: str) -> str:
    """Clean query text by removing triggers and mentions"""
    triggers = ["@opex", "@rag", "ask about"]
    for trigger in triggers:
        text = text.replace(trigger, "").strip()
    return text
```

## 5. Environment Variables Summary

```bash
# Existing
MM_SITE_URL=https://chat.insightpulseai.net
MM_BOT_TOKEN=your_bot_token
MM_SLASH_TOKEN=your_slash_token

# New Webhook Variables
MM_INCOMING_WEBHOOK_URL=https://chat.insightpulseai.net/hooks/xxx
MM_OUTGOING_WEBHOOK_TOKEN=your_outgoing_token
```

## 6. Testing Webhooks

### Test Incoming Webhook
```bash
curl -X POST $MM_INCOMING_WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -d '{
    "text": "RAG system is now online and ready for queries",
    "username": "OpEx RAG System",
    "icon_url": "https://example.com/system-icon.png"
  }'
```

### Test Outgoing Webhook
Send a message in Mattermost containing trigger words like:
- `@opex how do I process expense reports?`
- `@rag what are the BIR deadlines this month?`
- `ask about month-end close procedures`

## 7. Security Considerations

1. **Token Security**: Keep webhook tokens secure in environment variables
2. **Input Validation**: Validate all incoming webhook data
3. **Rate Limiting**: Implement rate limiting for webhook endpoints
4. **HTTPS**: Always use HTTPS for webhook callbacks
5. **Error Handling**: Proper error handling for webhook failures

## Next Steps

1. Create the webhooks in Mattermost admin panel
2. Update environment variables with new webhook URLs and tokens
3. Deploy the updated RAG service with webhook endpoints
4. Test both incoming and outgoing webhook functionality
5. Monitor webhook performance and error rates
