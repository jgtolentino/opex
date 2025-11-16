# Alert System Documentation

Production-ready alert notification system for OpEx via Rocket.Chat.

## Architecture

```
Next.js App (logAlert helper)
    ↓
Supabase Edge Function (alert-notifier)
    ↓
Rocket.Chat Incoming Webhook
    ↓
#alerts channel (or configured channel)
```

## Setup Instructions

### 1. Supabase Configuration

The `alert-notifier` Edge Function is already deployed at:
```
https://ublqmilcjtpnflofprkr.functions.supabase.co/alert-notifier
```

**Required Secret in Supabase Vault**:
- Key: `ROCKETCHAT_WEBHOOK_URL`
- Value: Your Rocket.Chat incoming webhook URL

**To add the secret**:

**Option A - Supabase Dashboard**:
1. Go to Supabase Dashboard → Project Settings → Vault
2. Click "New secret"
3. Key: `ROCKETCHAT_WEBHOOK_URL`
4. Value: `https://your.rocket.chat/hooks/...` (from Rocket.Chat admin)
5. Save

**Option B - Supabase CLI**:
```bash
supabase secrets set ROCKETCHAT_WEBHOOK_URL="https://your.rocket.chat/hooks/..."
```

### 2. Rocket.Chat Configuration

**Create Incoming Webhook**:
1. Login to Rocket.Chat as admin
2. Administration → Integrations → New Integration → Incoming Webhook
3. Configure:
   - **Name**: `Supabase Alerts`
   - **Channel**: `#alerts` (or your preferred channel)
   - **Enabled**: On
   - **Script Enabled**: Off (use default)
4. Save and copy the generated **Webhook URL**
5. Use this URL in Supabase Vault (step 1 above)

### 3. Next.js Environment Variable

Add to your `.env.local`:
```bash
ALERT_NOTIFIER_URL=https://ublqmilcjtpnflofprkr.functions.supabase.co/alert-notifier
```

**For Vercel Production**:
1. Go to Vercel Dashboard → Project Settings → Environment Variables
2. Add:
   - Key: `ALERT_NOTIFIER_URL`
   - Value: `https://ublqmilcjtpnflofprkr.functions.supabase.co/alert-notifier`
   - Environment: Production, Preview, Development (select all)
3. Redeploy

## Usage

### Basic Usage

```typescript
import { logAlert } from '@/lib/logAlert'

// Simple info alert
await logAlert({
  text: 'User logged in successfully'
})

// Warning with context
await logAlert({
  level: 'warn',
  source: 'docusaurus-build',
  text: 'Build completed with 3 warnings',
  context: {
    pageCount: 42,
    warningCount: 3
  }
})

// Error with detailed context
await logAlert({
  level: 'error',
  source: 'opex-api',
  text: 'Database connection failed',
  context: {
    error: err.message,
    userId: '123',
    timestamp: new Date().toISOString()
  }
})
```

### API Route Example

```typescript
// app/api/example/route.ts
import { NextResponse } from 'next/server'
import { logAlert } from '@/lib/logAlert'

export async function POST(req: Request) {
  try {
    const body = await req.json()

    // ... your logic ...

    return NextResponse.json({ ok: true })
  } catch (err) {
    await logAlert({
      level: 'error',
      source: 'example-api',
      text: 'API request failed',
      context: {
        error: (err as Error).message,
        path: req.url
      }
    })

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### Edge Function Example

```typescript
// supabase/functions/your-function/index.ts
import { logAlert } from '../_shared/logAlert.ts' // Adapt path as needed

Deno.serve(async (req) => {
  try {
    // ... your logic ...
  } catch (err) {
    await logAlert({
      level: 'error',
      source: 'supabase-edge',
      text: 'Edge function failed',
      context: {
        function: 'your-function',
        error: (err as Error).message
      }
    })

    return new Response('Error', { status: 500 })
  }
})
```

## Alert Levels

| Level   | Color   | Use Case                                    |
|---------|---------|---------------------------------------------|
| `info`  | Green   | Normal operations, successful completions   |
| `warn`  | Orange  | Warnings, degraded performance, edge cases  |
| `error` | Red     | Errors, failures, critical issues           |

## Alert Fields

```typescript
interface AlertPayload {
  text: string                      // Required: Main alert message
  level?: 'info' | 'warn' | 'error' // Default: 'info'
  source?: string                    // Default: 'nextjs-app'
  context?: Record<string, unknown>  // Optional: Additional metadata
}
```

## Testing

### Manual Test via cURL

```bash
curl -X POST \
  "https://ublqmilcjtpnflofprkr.functions.supabase.co/alert-notifier" \
  -H "Content-Type: application/json" \
  -d '{
    "source": "test",
    "level": "info",
    "text": "Test alert from terminal",
    "context": {
      "env": "development",
      "timestamp": "2025-11-16T05:00:00Z"
    }
  }'
```

### Test from Next.js

```typescript
// Add to any API route or server component
import { logAlert } from '@/lib/logAlert'

await logAlert({
  text: 'Test alert from Next.js',
  level: 'info',
  context: { test: true }
})
```

Check your Rocket.Chat `#alerts` channel for the message.

## Troubleshooting

### Alerts not appearing in Rocket.Chat

1. **Check Edge Function logs**:
   - Supabase Dashboard → Edge Functions → alert-notifier → Logs
   - Look for errors or failed requests

2. **Verify webhook URL in Vault**:
   - Supabase Dashboard → Project Settings → Vault
   - Confirm `ROCKETCHAT_WEBHOOK_URL` is set correctly

3. **Test webhook directly**:
   ```bash
   curl -X POST "https://your.rocket.chat/hooks/..." \
     -H "Content-Type: application/json" \
     -d '{"text": "Direct test"}'
   ```

4. **Check Rocket.Chat integration**:
   - Administration → Integrations → Supabase Alerts
   - Ensure "Enabled" is ON
   - Check channel permissions

### Environment variable not found

- Restart Next.js dev server after adding `ALERT_NOTIFIER_URL`
- For Vercel, ensure variable is added to all environments
- Check server logs for warning: `[logAlert] ALERT_NOTIFIER_URL not set`

## File Locations

- Helper: `lib/logAlert.ts`
- Examples: `lib/logAlert.example.ts`
- Edge Function: `supabase/functions/alert-notifier/index.ts`
- Documentation: `lib/ALERT_SYSTEM.md` (this file)

## Related Documentation

- Supabase Edge Functions: https://supabase.com/docs/guides/functions
- Supabase Vault (Secrets): https://supabase.com/docs/guides/database/vault
- Rocket.Chat Incoming Webhooks: https://docs.rocket.chat/use-rocket.chat/workspace-administration/integrations#incoming-webhook-script

---

**Last Updated**: 2025-11-16
**Status**: Production Ready
**Maintainer**: OpEx Team
