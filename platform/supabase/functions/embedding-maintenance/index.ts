// ============================================================================
// embedding-maintenance/index.ts
// Supabase Edge Function - Detect and mark stale embeddings
// ============================================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Environment variables
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const SLACK_WEBHOOK_URL = Deno.env.get('SLACK_WEBHOOK_URL');

// Initialize client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

interface HealthMetrics {
  total_sources: number;
  by_status: Record<string, number>;
  failed_sources: number;
  stale_sources: number;
  avg_failure_count: number;
  last_successful_embed: string | null;
  oldest_pending: string | null;
}

/**
 * Send Slack notification
 */
async function sendSlackNotification(message: string, isAlert = false): Promise<void> {
  if (!SLACK_WEBHOOK_URL) {
    console.warn('SLACK_WEBHOOK_URL not configured, skipping notification');
    return;
  }

  const color = isAlert ? '#ff0000' : '#36a64f';
  const emoji = isAlert ? ':rotating_light:' : ':white_check_mark:';

  try {
    await fetch(SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `${emoji} Finance RAG Maintenance`,
        attachments: [
          {
            color,
            text: message,
            ts: Math.floor(Date.now() / 1000),
          },
        ],
      }),
    });
  } catch (error) {
    console.error('Failed to send Slack notification:', error);
  }
}

/**
 * Mark stale sources
 */
async function markStaleSources(stalenessDays = 30): Promise<{
  marked_count: number;
  stale_sources: any[];
}> {
  const { data, error } = await supabase.rpc('mark_stale_sources', {
    staleness_days: stalenessDays,
  });

  if (error) {
    throw new Error(`Failed to mark stale sources: ${error.message}`);
  }

  return {
    marked_count: data[0].marked_count,
    stale_sources: data[0].stale_sources || [],
  };
}

/**
 * Get health metrics
 */
async function getHealthMetrics(): Promise<HealthMetrics> {
  const { data, error } = await supabase.rpc('get_embedding_health');

  if (error) {
    throw new Error(`Failed to get health metrics: ${error.message}`);
  }

  return data as HealthMetrics;
}

/**
 * Reset failure count for recoverable failed sources
 */
async function resetRecoverableFailures(): Promise<number> {
  const { data, error } = await supabase
    .from('embedding_sources')
    .update({
      status: 'pending',
      failure_count: 0,
      last_error: null,
    })
    .eq('status', 'failed')
    .lt('failure_count', 3)
    .select('id');

  if (error) {
    throw new Error(`Failed to reset recoverable failures: ${error.message}`);
  }

  return data?.length || 0;
}

/**
 * Main handler
 */
serve(async (req) => {
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
    const { stalenessDays = 30 } = await req.json().catch(() => ({}));

    console.log('Starting maintenance tasks...');

    // 1. Mark stale sources
    const { marked_count, stale_sources } = await markStaleSources(stalenessDays);
    console.log(`Marked ${marked_count} stale sources`);

    // 2. Reset recoverable failures
    const resetCount = await resetRecoverableFailures();
    console.log(`Reset ${resetCount} recoverable failures`);

    // 3. Get health metrics
    const health = await getHealthMetrics();
    console.log('Health metrics:', health);

    // 4. Determine if alerts needed
    const alerts: string[] = [];

    if (health.failed_sources >= 5) {
      alerts.push(`⚠️ High failure count: ${health.failed_sources} sources permanently failed`);
    }

    const stalePercentage = (health.stale_sources / health.total_sources) * 100;
    if (stalePercentage > 20) {
      alerts.push(
        `⚠️ High staleness: ${health.stale_sources} sources (${stalePercentage.toFixed(1)}%) not updated in ${stalenessDays} days`,
      );
    }

    if (health.by_status?.pending > health.total_sources * 0.5) {
      alerts.push(
        `⚠️ Large backlog: ${health.by_status.pending} sources pending processing`,
      );
    }

    // 5. Send notifications
    if (alerts.length > 0) {
      const alertMessage = alerts.join('\n');
      await sendSlackNotification(alertMessage, true);
    } else {
      const successMessage = `
*Maintenance Complete* ✅

- Marked stale: ${marked_count}
- Reset failures: ${resetCount}
- Total sources: ${health.total_sources}
- Embedded: ${health.by_status?.embedded || 0}
- Pending: ${health.by_status?.pending || 0}
- Failed: ${health.failed_sources}
- Last successful embed: ${health.last_successful_embed ? new Date(health.last_successful_embed).toLocaleString() : 'Never'}
      `.trim();

      await sendSlackNotification(successMessage, false);
    }

    return new Response(
      JSON.stringify({
        message: 'Maintenance complete',
        marked_stale: marked_count,
        reset_failures: resetCount,
        health_metrics: health,
        alerts: alerts.length > 0 ? alerts : null,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    console.error('Maintenance error:', error);

    await sendSlackNotification(`❌ Maintenance failed: ${(error as Error).message}`, true);

    return new Response(
      JSON.stringify({
        error: (error as Error).message,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }
});
