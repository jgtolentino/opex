// ==============================================================================
// lib/types/tasks.ts
// TypeScript types for OpEx Task Management System
// ==============================================================================

// ==============================================================================
// Core Entities
// ==============================================================================

export interface Team {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  full_name: string;
  email: string;
  role: 'admin' | 'manager' | 'reviewer' | 'staff' | null;
  team_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TaskCategory {
  id: number;
  name: string;
  description: string | null;
  recurrent: boolean;
  color: string | null;
  icon: string | null;
  created_at: string;
}

export type TaskStatus = 'not_started' | 'in_progress' | 'review' | 'done' | 'blocked' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';
export type DependencyType = 'finish_to_start' | 'start_to_start' | 'finish_to_finish';

export interface Task {
  id: string;
  title: string;
  category_id: number | null;
  description: string | null;
  recurrence_rule: string | null; // RRULE format
  status_template: TaskStatus;
  estimated_hours: number | null;
  priority: TaskPriority;
  owner_team_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface TaskInstance {
  id: string;
  task_id: string;
  assigned_to: string | null;
  status: TaskStatus;
  due_date: string; // ISO date string (YYYY-MM-DD)
  completed_at: string | null;
  remarks: string | null;
  cycle_identifier: string | null; // e.g., "November 2025", "2025-Q4"
  reminder_sent_at: string | null;
  escalation_sent_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface TaskDependency {
  id: number;
  task_id: string;
  depends_on_task_id: string;
  dependency_type: DependencyType;
  created_at: string;
}

export interface TaskActivityLog {
  id: string;
  task_instance_id: string;
  actor_id: string | null;
  action: string; // 'status_changed', 'comment_added', 'assigned', 'rescheduled', 'completed'
  metadata: Record<string, any> | null;
  created_at: string;
}

// ==============================================================================
// Extended Types with Relations
// ==============================================================================

export interface TaskInstanceWithDetails extends TaskInstance {
  task: Task;
  assigned_to_user: User | null;
  task_category: TaskCategory | null;
  owner_team: Team | null;
}

export interface TaskWithInstances extends Task {
  category: TaskCategory | null;
  owner_team: Team | null;
  instances: TaskInstance[];
  dependencies: TaskDependency[];
}

// ==============================================================================
// API Request/Response Types
// ==============================================================================

export interface CreateTaskRequest {
  title: string;
  category_id?: number;
  description?: string;
  recurrence_rule?: string;
  priority?: TaskPriority;
  estimated_hours?: number;
  owner_team_id?: string;
}

export interface UpdateTaskInstanceRequest {
  status?: TaskStatus;
  assigned_to?: string | null;
  due_date?: string;
  remarks?: string;
}

export interface ScheduleTasksRequest {
  days_ahead?: number;
  task_ids?: string[];
}

export interface ScheduleTasksResponse {
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

export interface UpcomingTask {
  instance_id: string;
  task_title: string;
  assigned_to_name: string | null;
  assigned_to_email: string | null;
  team_name: string | null;
  due_date: string;
  days_until_due: number;
  status: TaskStatus;
  cycle_identifier: string | null;
}

export interface ComplianceHealth {
  category_name: string;
  total_tasks: number;
  completed_on_time: number;
  completed_late: number;
  overdue: number;
  in_progress: number;
  compliance_rate: number; // 0-100
}

export interface SendNotificationsRequest {
  days_ahead?: number;
  include_overdue?: boolean;
  dry_run?: boolean;
}

export interface SendNotificationsResponse {
  notifications_sent: number;
  users_notified: string[];
  errors: string[];
  dry_run: boolean;
}

// ==============================================================================
// Dashboard Types
// ==============================================================================

export interface TaskStatusSummary {
  not_started: number;
  in_progress: number;
  review: number;
  done: number;
  blocked: number;
  cancelled: number;
  overdue: number;
  total: number;
}

export interface TeamWorkload {
  team_id: string;
  team_name: string;
  active_tasks: number;
  overdue_tasks: number;
  avg_completion_time_days: number | null;
}

export interface UserWorkload {
  user_id: string;
  user_name: string;
  user_email: string;
  team_name: string | null;
  assigned_tasks: number;
  overdue_tasks: number;
  in_progress_tasks: number;
}

// ==============================================================================
// Utility Types
// ==============================================================================

export interface DateRange {
  start: string;
  end: string;
}

export interface PaginationParams {
  page?: number;
  per_page?: number;
  order_by?: string;
  order_direction?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// ==============================================================================
// Filter Types
// ==============================================================================

export interface TaskInstanceFilter {
  status?: TaskStatus | TaskStatus[];
  assigned_to?: string | string[];
  team_id?: string | string[];
  category_id?: number | number[];
  due_date_from?: string;
  due_date_to?: string;
  cycle_identifier?: string;
  overdue_only?: boolean;
}
