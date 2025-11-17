// types/database.ts

export interface Expense {
  id: string;
  employee_id: string;
  employee_name: string;
  date: string;
  amount: number;
  category: string;
  description: string | null;
  tax_status: "pending" | "validated" | "high_risk" | "exempt";
  last_tax_summary: string | null;
  validation_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface OpexTask {
  id: string;
  period: string;
  title: string;
  owner: string;
  status: "pending" | "in_progress" | "completed" | "blocked";
  due_date: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  company: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface SystemStatus {
  id: string;
  system_name: "odoo" | "supabase" | "n8n" | "mattermost" | "edge_functions";
  status: "ok" | "warning" | "down";
  last_checked: string;
  details: string | null;
}
