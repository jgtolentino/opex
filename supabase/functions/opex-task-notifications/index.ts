// ==============================================================================
// opex-task-notifications/index.ts
// Supabase Edge Function - Send Rocket.Chat notifications for upcoming/overdue tasks
// Triggered: Daily via cron OR on-demand via API call
// ==============================================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Environment variables
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const ROCKETCHAT_WEBHOOK_URL = Deno.env.get('ROCKETCHAT_WEBHOOK_URL')!;
const ROCKETCHAT_MENTION_ENABLED = Deno.env.get('ROCKETCHAT_MENTION_ENABLED') === 'true';

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

interface NotificationRequest {
  days_ahead?: number;
  include_overdue?: boolean;
  dry_run?: boolean; // If true, don't actually send notifications
}

interface NotificationResponse {
  notifications_sent: number;
  users_notified: string[];
  errors: string[];
  dry_run: boolean;
}

interface UpcomingTask {
  instance_id: string;
  task_title: string;
  assigned_to_name: string | null;
  assigned_to_email: string | null;
  team_name: string | null;
  due_date: string;
  days_until_due: number;
  status: string;
  cycle_identifier: string | null;
}

/**
 * Format task notification message for Rocket.Chat
 */
function formatTaskNotification(tasks: UpcomingTask[]): string {
  if (tasks.length === 0) {
    return '✅ No upcoming or overdue tasks!';
  }

  // Group by urgency
  const overdue = tasks.filter((t) => t.days_until_due < 0);
  const dueToday = tasks.filter((t) => t.days_until_due === 0);
  const dueThisWeek = tasks.filter(
    (t) => t.days_until_due > 0 && t.days_until_due <= 7,
  );

  let message = '📋 **Task Reminder Summary**\n\n';

  if (overdue.length > 0) {
    message += `🚨 **OVERDUE (${overdue.length}):**\n`;
    overdue.forEach((task) => {
      const daysOverdue = Math.abs(task.days_until_due);
      message += `  • ${task.task_title} (${task.cycle_identifier})\n`;
      message += `    ⏰ ${daysOverdue} day${daysOverdue > 1 ? 's' : ''} overdue | `;
      message += `👤 ${task.assigned_to_name || 'Unassigned'} | `;
      message += `🏢 ${task.team_name || 'No team'}\n`;
    });
    message += '\n';
  }

  if (dueToday.length > 0) {
    message += `⚠️ **DUE TODAY (${dueToday.length}):**\n`;
    dueToday.forEach((task) => {
      message += `  • ${task.task_title} (${task.cycle_identifier})\n`;
      message += `    👤 ${task.assigned_to_name || 'Unassigned'} | `;
      message += `🏢 ${task.team_name || 'No team'}\n`;
    });
    message += '\n';
  }

  if (dueThisWeek.length > 0) {
    message += `📅 **DUE THIS WEEK (${dueThisWeek.length}):**\n`;
    dueThisWeek.forEach((task) => {
      message += `  • ${task.task_title} (${task.cycle_identifier})\n`;
      message += `    ⏰ Due in ${task.days_until_due} day${task.days_until_due > 1 ? 's' : ''} | `;
      message += `👤 ${task.assigned_to_name || 'Unassigned'} | `;
      message += `🏢 ${task.team_name || 'No team'}\n`;
    });
  }

  return message;
}

/**
 * Send notification to Rocket.Chat
 */
async function sendRocketChatNotification(
  message: string,
  channel?: string,
): Promise<boolean> {
  try {
    const payload = {
      text: message,
      channel: channel || undefined, // Optional channel override
    };

    const response = await fetch(ROCKETCHAT_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Rocket.Chat webhook failed:', response.status, errorText);
      return false;
    }

    console.log('✅ Rocket.Chat notification sent successfully');
    return true;
  } catch (error) {
    console.error('Failed to send Rocket.Chat notification:', error);
    return false;
  }
}

/**
 * Send individual notifications to users with overdue tasks
 */
async function sendPersonalNotifications(
  tasks: UpcomingTask[],
  dryRun: boolean,
): Promise<{ sent: number; users: string[]; errors: string[] }> {
  const result = {
    sent: 0,
    users: [] as string[],
    errors: [] as string[],
  };

  // Group tasks by assigned user
  const tasksByUser = tasks.reduce((acc, task) => {
    if (!task.assigned_to_email) return acc;

    if (!acc[task.assigned_to_email]) {
      acc[task.assigned_to_email] = {
        name: task.assigned_to_name || task.assigned_to_email,
        email: task.assigned_to_email,
        tasks: [],
      };
    }

    acc[task.assigned_to_email].tasks.push(task);
    return acc;
  }, {} as Record<string, { name: string; email: string; tasks: UpcomingTask[] }>);

  // Send notification to each user
  for (const [email, userData] of Object.entries(tasksByUser)) {
    const { name, tasks: userTasks } = userData;

    const message = `👋 Hi ${name},\n\n${formatTaskNotification(userTasks)}`;

    if (dryRun) {
      console.log(
        `[DRY RUN] Would send notification to ${email}:`,
        message,
      );
      result.sent++;
      result.users.push(email);
    } else {
      const success = await sendRocketChatNotification(message);
      if (success) {
        result.sent++;
        result.users.push(email);
      } else {
        result.errors.push(`Failed to notify ${email}`);
      }
    }
  }

  return result;
}

/**
 * Main notification logic
 */
async function sendTaskNotifications(
  request: NotificationRequest,
): Promise<NotificationResponse> {
  const daysAhead = request.days_ahead || 7;
  const includeOverdue = request.include_overdue !== false; // Default true
  const dryRun = request.dry_run || false;

  console.log('Sending task notifications:', {
    daysAhead,
    includeOverdue,
    dryRun,
  });

  const response: NotificationResponse = {
    notifications_sent: 0,
    users_notified: [],
    errors: [],
    dry_run: dryRun,
  };

  // Call Supabase function to get upcoming tasks
  const { data: tasks, error } = await supabase.rpc('opex_get_upcoming_tasks', {
    days_ahead: daysAhead,
    include_overdue: includeOverdue,
  });

  if (error) {
    console.error('Failed to fetch upcoming tasks:', error);
    response.errors.push(`Database error: ${error.message}`);
    return response;
  }

  if (!tasks || tasks.length === 0) {
    console.log('No upcoming or overdue tasks found');
    return response;
  }

  console.log(`Found ${tasks.length} tasks to notify about`);

  // Send summary notification to general channel
  const summaryMessage = formatTaskNotification(tasks as UpcomingTask[]);

  if (dryRun) {
    console.log('[DRY RUN] Would send to general channel:', summaryMessage);
    response.notifications_sent++;
  } else {
    const success = await sendRocketChatNotification(summaryMessage);
    if (success) {
      response.notifications_sent++;
    } else {
      response.errors.push('Failed to send summary notification');
    }
  }

  // Send personal notifications for overdue tasks
  const overdueTasks = (tasks as UpcomingTask[]).filter((t) =>
    t.days_until_due < 0
  );

  if (overdueTasks.length > 0) {
    const personalResult = await sendPersonalNotifications(
      overdueTasks,
      dryRun,
    );
    response.notifications_sent += personalResult.sent;
    response.users_notified = personalResult.users;
    response.errors.push(...personalResult.errors);
  }

  // Update reminder_sent_at timestamp for notified instances
  if (!dryRun) {
    const instanceIds = (tasks as UpcomingTask[]).map((t) => t.instance_id);
    const { error: updateError } = await supabase
      .from('opex_task_instances')
      .update({ reminder_sent_at: new Date().toISOString() })
      .in('id', instanceIds);

    if (updateError) {
      console.error('Failed to update reminder timestamps:', updateError);
      response.errors.push('Failed to update reminder timestamps');
    }
  }

  return response;
}

// ==============================================================================
// HTTP Handler
// ==============================================================================

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers':
          'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    // Validate Rocket.Chat webhook URL is configured
    if (!ROCKETCHAT_WEBHOOK_URL) {
      return new Response(
        JSON.stringify({
          error: 'ROCKETCHAT_WEBHOOK_URL not configured',
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const request: NotificationRequest = req.method === 'POST'
      ? await req.json()
      : {};

    console.log('Notification request:', request);

    const result = await sendTaskNotifications(request);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Handler error:', error);
    return new Response(
      JSON.stringify({
        error: (error as Error).message || 'Internal server error',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
});
