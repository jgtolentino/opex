// ============================================================================
// alert-notifier/index.ts
// Supabase Edge Function - Send Rocket.Chat notifications for RAG alerts
// ============================================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const ROCKETCHAT_WEBHOOK_URL = Deno.env.get('ROCKETCHAT_WEBHOOK_URL')!;

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

interface RocketChatMessage {
  text: string;
  attachments?: Array<{
    title?: string;
    text?: string;
    color?: string;
    fields?: Array<{
      title: string;
      value: string;
      short?: boolean;
    }>;
  }>;
}

function buildRocketChatMessage(alert: Alert): RocketChatMessage {
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

  const severityColor = {
    low: '#0000FF',
    medium: '#FFFF00',
    high: '#FFA500',
    critical: '#FF0000'
  }[alert.severity] || '#808080';

  // Rocket.Chat simplified format
  return {
    text: `${severityEmoji} ${typeEmoji} **OpEx RAG Alert**: ${alert.message}`,
    attachments: [
      {
        title: `Alert Details - ${alert.alert_type.toUpperCase()}`,
        color: severityColor,
        fields: [
          {
            title: 'Alert Type',
            value: alert.alert_type,
            short: true
          },
          {
            title: 'Severity',
            value: alert.severity,
            short: true
          },
          {
            title: 'Time',
            value: new Date(alert.created_at).toLocaleString(),
            short: true
          },
          {
            title: 'Alert ID',
            value: alert.id.substring(0, 8),
            short: true
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

    console.log('📢 Sending Rocket.Chat notification for alert:', {
      id: alert.id,
      type: alert.alert_type,
      severity: alert.severity
    });

    // Build Rocket.Chat message
    const rocketChatMessage = buildRocketChatMessage(alert);

    // Send to Rocket.Chat
    const rocketChatResponse = await fetch(ROCKETCHAT_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rocketChatMessage)
    });

    if (!rocketChatResponse.ok) {
      const errorText = await rocketChatResponse.text();
      console.error('❌ Rocket.Chat webhook failed:', {
        status: rocketChatResponse.status,
        error: errorText
      });

      return new Response(
        JSON.stringify({ error: 'Failed to send Rocket.Chat notification', details: errorText }),
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

    console.log('✅ Rocket.Chat notification sent successfully:', alert.id);

    return new Response(
      JSON.stringify({
        success: true,
        alert_id: alert.id,
        message: 'Rocket.Chat notification sent'
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
