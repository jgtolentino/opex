// lib/logAlert.ts
// Production-ready alert helper for Rocket.Chat notifications via Supabase Edge Function

type AlertLevel = 'info' | 'warn' | 'error'

export interface AlertPayload {
  text: string
  level?: AlertLevel
  source?: string
  context?: Record<string, unknown>
}

const endpoint = process.env.ALERT_NOTIFIER_URL

if (!endpoint) {
  // Log once on boot – avoids silent no-ops
  // (will show in server logs / Vercel function logs)
  console.warn(
    '[logAlert] ALERT_NOTIFIER_URL not set – alerts will be skipped.'
  )
}

/**
 * Send alert to Rocket.Chat via alert-notifier Edge Function
 *
 * @example
 * await logAlert({
 *   level: 'error',
 *   source: 'opex-api',
 *   text: 'Failed to process request',
 *   context: { userId: '123', error: err.message }
 * })
 */
export async function logAlert({
  text,
  level = 'info',
  source = 'nextjs-app',
  context = {}
}: AlertPayload): Promise<void> {
  if (!endpoint) return

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // IMPORTANT: no revalidation, no cache
      cache: 'no-store',
      body: JSON.stringify({ text, level, source, context })
    })

    if (!res.ok) {
      console.error(
        '[logAlert] Failed to send alert',
        res.status,
        await res.text()
      )
    }
  } catch (err) {
    console.error('[logAlert] Error sending alert', err)
  }
}
