// ==============================================================================
// opex-task-scheduler/index.ts
// Supabase Edge Function - Generate task instances from RRULE templates
// Triggered: Daily via cron OR on-demand via API call
// ==============================================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { RRule } from 'https://esm.sh/rrule@2.7.2';

// Environment variables
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

interface Task {
  id: string;
  title: string;
  category_id: number;
  recurrence_rule: string;
  owner_team_id: string;
}

interface ScheduleRequest {
  days_ahead?: number; // How many days in the future to generate instances
  task_ids?: string[]; // Optional: only generate for specific tasks
}

interface ScheduleResponse {
  generated: number;
  skipped: number;
  errors: string[];
  instances: Array<{
    task_id: string;
    task_title: string;
    due_date: string;
    cycle_identifier: string;
  }>;
}

/**
 * Parse RRULE string and generate due dates
 */
function generateDueDates(
  rruleString: string,
  startDate: Date,
  endDate: Date,
): Date[] {
  try {
    // Parse RRULE (iCal format)
    const rule = RRule.fromString(rruleString);

    // Generate occurrences between start and end date
    const occurrences = rule.between(startDate, endDate, true);

    return occurrences;
  } catch (error) {
    console.error('Failed to parse RRULE:', rruleString, error);
    return [];
  }
}

/**
 * Generate cycle identifier from due date
 * Examples: "November 2025", "2025-Q4", "Week 46 2025"
 */
function generateCycleIdentifier(dueDate: Date, frequency: string): string {
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  if (frequency === 'MONTHLY' || frequency === 'YEARLY') {
    return `${months[dueDate.getMonth()]} ${dueDate.getFullYear()}`;
  } else if (frequency === 'WEEKLY') {
    const weekNumber = Math.ceil(
      (dueDate.getDate() + new Date(dueDate.getFullYear(), 0, 1).getDay()) / 7,
    );
    return `Week ${weekNumber} ${dueDate.getFullYear()}`;
  } else {
    // Default: just the month
    return `${months[dueDate.getMonth()]} ${dueDate.getFullYear()}`;
  }
}

/**
 * Check if task instance already exists for this date
 */
async function instanceExists(
  taskId: string,
  dueDate: Date,
): Promise<boolean> {
  const dueDateString = dueDate.toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('opex_task_instances')
    .select('id')
    .eq('task_id', taskId)
    .eq('due_date', dueDateString)
    .maybeSingle();

  if (error) {
    console.error('Error checking instance existence:', error);
    return false;
  }

  return !!data;
}

/**
 * Create task instance
 */
async function createTaskInstance(
  task: Task,
  dueDate: Date,
  cycleIdentifier: string,
): Promise<boolean> {
  const dueDateString = dueDate.toISOString().split('T')[0];

  const { error } = await supabase.from('opex_task_instances').insert({
    task_id: task.id,
    assigned_to: null, // To be assigned manually or via automation rules
    status: 'not_started',
    due_date: dueDateString,
    cycle_identifier: cycleIdentifier,
  });

  if (error) {
    console.error('Failed to create instance:', error);
    return false;
  }

  return true;
}

/**
 * Main scheduling logic
 */
async function scheduleTaskInstances(
  request: ScheduleRequest,
): Promise<ScheduleResponse> {
  const daysAhead = request.days_ahead || 90; // Default: generate 90 days ahead
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + daysAhead);

  console.log(
    `Generating task instances from ${startDate.toISOString()} to ${endDate.toISOString()}`,
  );

  const response: ScheduleResponse = {
    generated: 0,
    skipped: 0,
    errors: [],
    instances: [],
  };

  // Fetch all recurring tasks (or specific ones if requested)
  let query = supabase
    .from('opex_tasks')
    .select('id, title, category_id, recurrence_rule, owner_team_id')
    .not('recurrence_rule', 'is', null);

  if (request.task_ids && request.task_ids.length > 0) {
    query = query.in('id', request.task_ids);
  }

  const { data: tasks, error: fetchError } = await query;

  if (fetchError) {
    response.errors.push(`Failed to fetch tasks: ${fetchError.message}`);
    return response;
  }

  if (!tasks || tasks.length === 0) {
    console.log('No recurring tasks found');
    return response;
  }

  console.log(`Found ${tasks.length} recurring tasks`);

  // Process each task
  for (const task of tasks as Task[]) {
    try {
      // Extract frequency from RRULE
      const frequencyMatch = task.recurrence_rule.match(/FREQ=(\w+)/);
      const frequency = frequencyMatch ? frequencyMatch[1] : 'MONTHLY';

      // Generate due dates from RRULE
      const dueDates = generateDueDates(
        task.recurrence_rule,
        startDate,
        endDate,
      );

      console.log(`Task "${task.title}": ${dueDates.length} occurrences`);

      // Create instances for each due date
      for (const dueDate of dueDates) {
        // Check if instance already exists
        const exists = await instanceExists(task.id, dueDate);

        if (exists) {
          response.skipped++;
          console.log(
            `Skipped: Instance already exists for ${task.title} on ${dueDate.toISOString().split('T')[0]}`,
          );
          continue;
        }

        // Generate cycle identifier
        const cycleIdentifier = generateCycleIdentifier(dueDate, frequency);

        // Create instance
        const success = await createTaskInstance(
          task,
          dueDate,
          cycleIdentifier,
        );

        if (success) {
          response.generated++;
          response.instances.push({
            task_id: task.id,
            task_title: task.title,
            due_date: dueDate.toISOString().split('T')[0],
            cycle_identifier: cycleIdentifier,
          });
          console.log(
            `✅ Created instance: ${task.title} - ${dueDate.toISOString().split('T')[0]}`,
          );
        } else {
          response.errors.push(
            `Failed to create instance for ${task.title} on ${dueDate.toISOString().split('T')[0]}`,
          );
        }
      }
    } catch (error) {
      const errorMsg = `Error processing task ${task.title}: ${(error as Error).message}`;
      console.error(errorMsg);
      response.errors.push(errorMsg);
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
    const request: ScheduleRequest = req.method === 'POST'
      ? await req.json()
      : {};

    console.log('Scheduling request:', request);

    const result = await scheduleTaskInstances(request);

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
