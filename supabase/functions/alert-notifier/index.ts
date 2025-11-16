// ============================================================================
// alert-notifier/index.ts
// Supabase Edge Function - Send Slack notifications for RAG alerts
// ============================================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const SLACK_WEBHOOK_URL = Deno.env.get('SLACK_WEBHOOK_URL')!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  db: { schema: 'opex' },
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

interface Alert {
  id: string;
  query_id?: string;
  alert_type: string;
  severity: string;
  message: string;
  details: Record<string, any>;
  created_at: string;
}

interface SlackMessage {
  text: string;
  blocks: Array<{
    type: string;
    text?: {
      type: string;
      text: string;
    };
    fields?: Array<{
      type: string;
      text: string;
    }>;
  }>;
}

function buildSlackMessage(alert: Alert): SlackMessage {
  const severityEmoji = {
    low: '🔵',
    medium: '🟡',
    high: '🟠',
    critical: '🔴'
  }[alert.severity] || '⚪';

  const typeEmoji = {
    error: '❌',
    latency: '⏱️',
    rating: '⭐'
  }[alert.alert_type] || '📢';

  return {
    text: `${severityEmoji} OpEx RAG Alert: ${alert.message}`,
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `${severityEmoji} ${typeEmoji} ${alert.message}`
        }
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Alert Type:*\n${alert.alert_type}`
          },
          {
            type: 'mrkdwn',
            text: `*Severity:*\n${alert.severity}`
          },
          {
            type: 'mrkdwn',
            text: `*Time:*\n${new Date(alert.created_at).toLocaleString()}`
          },
          {
            type: 'mrkdwn',
            text: `*Alert ID:*\n${alert.id.substring(0, 8)}`
          }
        ]
      }
    ]
  };
}

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    const payload = await req.json();
    console.log('📥 Received alert payload:', JSON.stringify(payload, null, 2));

    // Extract alert from webhook payload
    const alert: Alert = payload.record || payload;

    if (!alert.id || !alert.alert_type) {
      console.error('❌ Invalid alert payload:', payload);
      return new Response(
        JSON.stringify({ error: 'Invalid alert payload' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Skip if already notified
    if (alert.details && alert.details.notified_at) {
      console.log('⏭️ Alert already notified:', alert.id);
      return new Response(
        JSON.stringify({ success: true, message: 'Already notified' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('📢 Sending Slack notification for alert:', {
      id: alert.id,
      type: alert.alert_type,
      severity: alert.severity
    });

    // Build Slack message
    const slackMessage = buildSlackMessage(alert);

    // Send to Slack
    const slackResponse = await fetch(SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(slackMessage)
    });

    if (!slackResponse.ok) {
      const errorText = await slackResponse.text();
      console.error('❌ Slack webhook failed:', {
        status: slackResponse.status,
        error: errorText
      });

      return new Response(
        JSON.stringify({ error: 'Failed to send Slack notification', details: errorText }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Update alert with notified_at timestamp
    const { error: updateError } = await supabase
      .from('rag_alerts')
      .update({ notified_at: new Date().toISOString() })
      .eq('id', alert.id);

    if (updateError) {
      console.error('⚠️ Failed to update notified_at:', updateError);
      // Don't fail the request - notification was successful
    }

    console.log('✅ Slack notification sent successfully:', alert.id);

    return new Response(
      JSON.stringify({
        success: true,
        alert_id: alert.id,
        message: 'Slack notification sent'
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );

  } catch (error) {
    console.error('💥 Alert notifier error:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        details: (error as Error).message || 'Unknown error'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
});
