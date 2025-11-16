-- ==============================================================================
-- OpEx Task Management System - Normalized Schema
-- Purpose: Compliance automation, recurring tasks, audit trails, Rocket.Chat alerts
-- Created: 2025-11-16
-- ==============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 1. TEAMS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS opex_teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_opex_teams_name ON opex_teams(name);

COMMENT ON TABLE opex_teams IS 'Organizational teams (Finance, Legal, HR, Operations, etc.)';

-- ==============================================================================
-- 2. USERS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS opex_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT CHECK (role IN ('admin', 'manager', 'reviewer', 'staff')),
    team_id UUID REFERENCES opex_teams(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_opex_users_email ON opex_users(email);
CREATE INDEX IF NOT EXISTS idx_opex_users_team ON opex_users(team_id);
CREATE INDEX IF NOT EXISTS idx_opex_users_active ON opex_users(is_active);

COMMENT ON TABLE opex_users IS 'OpEx platform users - to be synced with Supabase Auth later';

-- ==============================================================================
-- 3. TASK CATEGORIES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS opex_task_categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    recurrent BOOLEAN DEFAULT false,
    color TEXT, -- Hex color for UI display
    icon TEXT, -- Icon identifier for UI
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_opex_categories_recurrent ON opex_task_categories(recurrent);

COMMENT ON TABLE opex_task_categories IS 'Task categories (Tax Filing, Compliance, Reporting, Month-End Close, etc.)';

-- ==============================================================================
-- 4. TASKS TABLE (Canonical Definitions)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS opex_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    category_id INT REFERENCES opex_task_categories(id) ON DELETE SET NULL,
    description TEXT,
    recurrence_rule TEXT, -- RRULE format (RFC 5545)
    status_template TEXT CHECK (status_template IN ('not_started', 'in_progress', 'review', 'done')) DEFAULT 'not_started',
    estimated_hours DECIMAL(5,2),
    priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
    owner_team_id UUID REFERENCES opex_teams(id) ON DELETE SET NULL,
    created_by UUID REFERENCES opex_users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_opex_tasks_category ON opex_tasks(category_id);
CREATE INDEX IF NOT EXISTS idx_opex_tasks_owner_team ON opex_tasks(owner_team_id);
CREATE INDEX IF NOT EXISTS idx_opex_tasks_recurrence ON opex_tasks(recurrence_rule) WHERE recurrence_rule IS NOT NULL;

COMMENT ON TABLE opex_tasks IS 'Task templates/definitions - reusable across instances';
COMMENT ON COLUMN opex_tasks.recurrence_rule IS 'iCal RRULE format: FREQ=MONTHLY;BYDAY=1MO,2TU (1st Mon, 2nd Tue)';

-- ==============================================================================
-- 5. TASK INSTANCES TABLE (Actual Executions)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS opex_task_instances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES opex_tasks(id) ON DELETE CASCADE,
    assigned_to UUID REFERENCES opex_users(id) ON DELETE SET NULL,
    status TEXT NOT NULL CHECK (status IN ('not_started', 'in_progress', 'review', 'done', 'blocked', 'cancelled')) DEFAULT 'not_started',
    due_date DATE NOT NULL,
    completed_at TIMESTAMPTZ,
    remarks TEXT,
    -- Metadata fields
    cycle_identifier TEXT, -- e.g., "2025-Q1", "April 2025", "Week 15"
    reminder_sent_at TIMESTAMPTZ,
    escalation_sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_opex_instances_task ON opex_task_instances(task_id);
CREATE INDEX IF NOT EXISTS idx_opex_instances_assigned ON opex_task_instances(assigned_to);
CREATE INDEX IF NOT EXISTS idx_opex_instances_status ON opex_task_instances(status);
CREATE INDEX IF NOT EXISTS idx_opex_instances_due_date ON opex_task_instances(due_date);
CREATE INDEX IF NOT EXISTS idx_opex_instances_cycle ON opex_task_instances(cycle_identifier);

COMMENT ON TABLE opex_task_instances IS 'Actual task executions - generated from templates via RRULE or manually';
COMMENT ON COLUMN opex_task_instances.cycle_identifier IS 'Business cycle label for grouping (month, quarter, year)';

-- ==============================================================================
-- 6. TASK DEPENDENCIES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS opex_task_dependencies (
    id SERIAL PRIMARY KEY,
    task_id UUID NOT NULL REFERENCES opex_tasks(id) ON DELETE CASCADE,
    depends_on_task_id UUID NOT NULL REFERENCES opex_tasks(id) ON DELETE CASCADE,
    dependency_type TEXT CHECK (dependency_type IN ('finish_to_start', 'start_to_start', 'finish_to_finish')) DEFAULT 'finish_to_start',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(task_id, depends_on_task_id),
    CHECK (task_id != depends_on_task_id) -- Prevent self-reference
);

CREATE INDEX IF NOT EXISTS idx_opex_deps_task ON opex_task_dependencies(task_id);
CREATE INDEX IF NOT EXISTS idx_opex_deps_depends_on ON opex_task_dependencies(depends_on_task_id);

COMMENT ON TABLE opex_task_dependencies IS 'Task dependency graph - drives automation logic';
COMMENT ON COLUMN opex_task_dependencies.dependency_type IS 'finish_to_start (most common), start_to_start, finish_to_finish';

-- ==============================================================================
-- 7. TASK ACTIVITY LOG TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS opex_task_activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_instance_id UUID NOT NULL REFERENCES opex_task_instances(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES opex_users(id) ON DELETE SET NULL,
    action TEXT NOT NULL, -- 'status_changed', 'comment_added', 'assigned', 'rescheduled', 'completed'
    metadata JSONB, -- Flexible storage for action-specific data
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_opex_activity_instance ON opex_task_activity_log(task_instance_id);
CREATE INDEX IF NOT EXISTS idx_opex_activity_actor ON opex_task_activity_log(actor_id);
CREATE INDEX IF NOT EXISTS idx_opex_activity_created ON opex_task_activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_opex_activity_action ON opex_task_activity_log(action);

COMMENT ON TABLE opex_task_activity_log IS 'Audit trail for all task instance changes - used for dashboards, Rocket.Chat, compliance';

-- ==============================================================================
-- 8. HELPER FUNCTIONS
-- ==============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION opex_update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER opex_teams_updated_at BEFORE UPDATE ON opex_teams FOR EACH ROW EXECUTE FUNCTION opex_update_updated_at_column();
CREATE TRIGGER opex_users_updated_at BEFORE UPDATE ON opex_users FOR EACH ROW EXECUTE FUNCTION opex_update_updated_at_column();
CREATE TRIGGER opex_tasks_updated_at BEFORE UPDATE ON opex_tasks FOR EACH ROW EXECUTE FUNCTION opex_update_updated_at_column();
CREATE TRIGGER opex_task_instances_updated_at BEFORE UPDATE ON opex_task_instances FOR EACH ROW EXECUTE FUNCTION opex_update_updated_at_column();

-- ==============================================================================
-- Get upcoming tasks (for Rocket.Chat alerts)
-- ==============================================================================
CREATE OR REPLACE FUNCTION opex_get_upcoming_tasks(
    days_ahead INT DEFAULT 7,
    include_overdue BOOLEAN DEFAULT true
)
RETURNS TABLE (
    instance_id UUID,
    task_title TEXT,
    assigned_to_name TEXT,
    assigned_to_email TEXT,
    team_name TEXT,
    due_date DATE,
    days_until_due INT,
    status TEXT,
    cycle_identifier TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        ti.id AS instance_id,
        t.title AS task_title,
        u.full_name AS assigned_to_name,
        u.email AS assigned_to_email,
        tm.name AS team_name,
        ti.due_date,
        (ti.due_date - CURRENT_DATE)::INT AS days_until_due,
        ti.status,
        ti.cycle_identifier
    FROM opex_task_instances ti
    JOIN opex_tasks t ON ti.task_id = t.id
    LEFT JOIN opex_users u ON ti.assigned_to = u.id
    LEFT JOIN opex_teams tm ON t.owner_team_id = tm.id
    WHERE ti.status NOT IN ('done', 'cancelled')
        AND (
            (include_overdue AND ti.due_date < CURRENT_DATE)
            OR (ti.due_date BETWEEN CURRENT_DATE AND CURRENT_DATE + days_ahead)
        )
    ORDER BY ti.due_date ASC, t.priority DESC;
END;
$$;

COMMENT ON FUNCTION opex_get_upcoming_tasks IS 'Get tasks due soon or overdue - used by Rocket.Chat notification edge function';

-- ==============================================================================
-- Get task compliance health by category
-- ==============================================================================
CREATE OR REPLACE FUNCTION opex_get_compliance_health(
    date_from DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
    date_to DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
    category_name TEXT,
    total_tasks INT,
    completed_on_time INT,
    completed_late INT,
    overdue INT,
    in_progress INT,
    compliance_rate DECIMAL(5,2)
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        tc.name AS category_name,
        COUNT(*)::INT AS total_tasks,
        COUNT(*) FILTER (WHERE ti.status = 'done' AND ti.completed_at::DATE <= ti.due_date)::INT AS completed_on_time,
        COUNT(*) FILTER (WHERE ti.status = 'done' AND ti.completed_at::DATE > ti.due_date)::INT AS completed_late,
        COUNT(*) FILTER (WHERE ti.status NOT IN ('done', 'cancelled') AND ti.due_date < CURRENT_DATE)::INT AS overdue,
        COUNT(*) FILTER (WHERE ti.status IN ('in_progress', 'review'))::INT AS in_progress,
        ROUND(
            (COUNT(*) FILTER (WHERE ti.status = 'done' AND ti.completed_at::DATE <= ti.due_date)::DECIMAL / NULLIF(COUNT(*), 0)) * 100,
            2
        ) AS compliance_rate
    FROM opex_task_instances ti
    JOIN opex_tasks t ON ti.task_id = t.id
    JOIN opex_task_categories tc ON t.category_id = tc.id
    WHERE ti.due_date BETWEEN date_from AND date_to
    GROUP BY tc.id, tc.name
    ORDER BY compliance_rate DESC;
END;
$$;

COMMENT ON FUNCTION opex_get_compliance_health IS 'Calculate compliance metrics by category - used for dashboards';

-- ==============================================================================
-- 9. ROW LEVEL SECURITY (RLS)
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE opex_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE opex_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE opex_task_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE opex_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE opex_task_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE opex_task_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE opex_task_activity_log ENABLE ROW LEVEL SECURITY;

-- Grant service role full access (for edge functions)
GRANT ALL ON opex_teams TO service_role;
GRANT ALL ON opex_users TO service_role;
GRANT ALL ON opex_task_categories TO service_role;
GRANT ALL ON opex_tasks TO service_role;
GRANT ALL ON opex_task_instances TO service_role;
GRANT ALL ON opex_task_dependencies TO service_role;
GRANT ALL ON opex_task_activity_log TO service_role;

-- Grant authenticated users read access to all tables
CREATE POLICY "authenticated_read_teams" ON opex_teams FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_read_users" ON opex_users FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_read_categories" ON opex_task_categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_read_tasks" ON opex_tasks FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_read_instances" ON opex_task_instances FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_read_dependencies" ON opex_task_dependencies FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_read_activity" ON opex_task_activity_log FOR SELECT TO authenticated USING (true);

-- Users can update their own assigned task instances
CREATE POLICY "users_update_own_instances"
    ON opex_task_instances
    FOR UPDATE
    TO authenticated
    USING (assigned_to = auth.uid());

-- Users can insert activity logs for their own actions
CREATE POLICY "users_insert_own_activity"
    ON opex_task_activity_log
    FOR INSERT
    TO authenticated
    WITH CHECK (actor_id = auth.uid());

-- ==============================================================================
-- 10. SEED DATA (Categories)
-- ==============================================================================

INSERT INTO opex_task_categories (name, description, recurrent, color, icon) VALUES
('Tax Filing', 'BIR tax compliance and filings (1601-C, 2550M, etc.)', true, '#EF4444', 'receipt-tax'),
('Month-End Close', 'Monthly financial close processes', true, '#3B82F6', 'calendar-check'),
('Compliance', 'Regulatory compliance and audit requirements', true, '#10B981', 'shield-check'),
('Reporting', 'Financial and operational reporting', true, '#8B5CF6', 'chart-bar'),
('HR Onboarding', 'New employee onboarding workflows', false, '#F59E0B', 'user-plus'),
('HR Offboarding', 'Employee exit processes', false, '#6B7280', 'user-minus'),
('Procurement', 'Purchase requisitions and approvals', false, '#EC4899', 'shopping-cart'),
('Bank Reconciliation', 'Bank statement reconciliation processes', true, '#14B8A6', 'credit-card')
ON CONFLICT (name) DO NOTHING;

COMMENT ON TABLE opex_task_categories IS 'Seeded with common OpEx categories - add more as needed';
