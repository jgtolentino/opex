-- ==============================================================================
-- OpEx Task Management - Seed Data
-- Purpose: Sample teams, users, tasks with real BIR/Finance compliance examples
-- ==============================================================================

-- ==============================================================================
-- 1. TEAMS
-- ==============================================================================
INSERT INTO opex_teams (id, name, description) VALUES
('11111111-1111-1111-1111-111111111111', 'Finance', 'Finance Shared Services Center'),
('22222222-2222-2222-2222-222222222222', 'Tax & Compliance', 'BIR compliance and tax filing'),
('33333333-3333-3333-3333-333333333333', 'HR', 'Human Resources'),
('44444444-4444-4444-4444-444444444444', 'Operations', 'General operations and admin'),
('55555555-5555-5555-5555-555555555555', 'Legal', 'Legal and regulatory affairs')
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- 2. USERS (Sample)
-- ==============================================================================
INSERT INTO opex_users (id, full_name, email, role, team_id) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Maria Santos', 'maria.santos@opex.ph', 'manager', '11111111-1111-1111-1111-111111111111'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Juan dela Cruz', 'juan.delacruz@opex.ph', 'staff', '22222222-2222-2222-2222-222222222222'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Ana Reyes', 'ana.reyes@opex.ph', 'reviewer', '33333333-3333-3333-3333-333333333333'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Pedro Garcia', 'pedro.garcia@opex.ph', 'admin', '44444444-4444-4444-4444-444444444444')
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- 3. TASK TEMPLATES (Recurring)
-- ==============================================================================

-- BIR 1601-C (Monthly Withholding Tax)
INSERT INTO opex_tasks (id, title, category_id, description, recurrence_rule, priority, owner_team_id, created_by) VALUES
(
    'e1111111-1111-1111-1111-111111111111',
    'BIR 1601-C Filing (Monthly Withholding Tax)',
    (SELECT id FROM opex_task_categories WHERE name = 'Tax Filing'),
    'File monthly withholding tax return (1601-C) - Due 10th business day after month-end',
    'FREQ=MONTHLY;BYMONTHDAY=10', -- 10th of every month
    'critical',
    '22222222-2222-2222-2222-222222222222', -- Tax & Compliance team
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
),
(
    'e2222222-2222-2222-2222-222222222222',
    'BIR 2550Q Filing (Quarterly Income Tax)',
    (SELECT id FROM opex_task_categories WHERE name = 'Tax Filing'),
    'File quarterly income tax return - Due within 60 days after end of quarter',
    'FREQ=YEARLY;BYMONTH=2,5,8,11;BYMONTHDAY=20', -- Feb 20, May 20, Aug 20, Nov 20
    'critical',
    '22222222-2222-2222-2222-222222222222',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
),
(
    'e3333333-3333-3333-3333-333333333333',
    'Month-End Close - General Ledger',
    (SELECT id FROM opex_task_categories WHERE name = 'Month-End Close'),
    'Close general ledger and prepare trial balance',
    'FREQ=MONTHLY;BYMONTHDAY=5', -- 5th of every month
    'high',
    '11111111-1111-1111-1111-111111111111',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
),
(
    'e4444444-4444-4444-4444-444444444444',
    'Bank Reconciliation - All Accounts',
    (SELECT id FROM opex_task_categories WHERE name = 'Bank Reconciliation'),
    'Reconcile all bank accounts and clear outstanding items',
    'FREQ=MONTHLY;BYMONTHDAY=3', -- 3rd of every month
    'high',
    '11111111-1111-1111-1111-111111111111',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
),
(
    'e5555555-5555-5555-5555-555555555555',
    'Payroll Processing',
    (SELECT id FROM opex_task_categories WHERE name = 'Compliance'),
    'Process monthly payroll and prepare payslips',
    'FREQ=MONTHLY;BYMONTHDAY=25', -- 25th of every month
    'critical',
    '33333333-3333-3333-3333-333333333333',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
)
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- 4. TASK DEPENDENCIES
-- ==============================================================================

-- Bank Reconciliation must complete before Month-End Close
INSERT INTO opex_task_dependencies (task_id, depends_on_task_id, dependency_type) VALUES
(
    'e3333333-3333-3333-3333-333333333333', -- Month-End Close
    'e4444444-4444-4444-4444-444444444444', -- Bank Reconciliation
    'finish_to_start'
)
ON CONFLICT (task_id, depends_on_task_id) DO NOTHING;

-- ==============================================================================
-- 5. TASK INSTANCES (Sample for current month)
-- ==============================================================================

-- Generate instances for November 2025
INSERT INTO opex_task_instances (id, task_id, assigned_to, status, due_date, cycle_identifier) VALUES
-- BIR 1601-C for October 2025 (due Nov 10)
(
    'i1111111-1111-1111-1111-111111111111',
    'e1111111-1111-1111-1111-111111111111',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'in_progress',
    '2025-11-10',
    'October 2025'
),
-- Bank Reconciliation for October 2025 (due Nov 3)
(
    'i2222222-2222-2222-2222-222222222222',
    'e4444444-4444-4444-4444-444444444444',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'done',
    '2025-11-03',
    'October 2025'
),
-- Month-End Close for October 2025 (due Nov 5)
(
    'i3333333-3333-3333-3333-333333333333',
    'e3333333-3333-3333-3333-333333333333',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'review',
    '2025-11-05',
    'October 2025'
),
-- Payroll for November 2025 (due Nov 25)
(
    'i4444444-4444-4444-4444-444444444444',
    'e5555555-5555-5555-5555-555555555555',
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'not_started',
    '2025-11-25',
    'November 2025'
)
ON CONFLICT (id) DO NOTHING;

-- Mark one as completed
UPDATE opex_task_instances
SET completed_at = '2025-11-03 15:30:00+08', status = 'done'
WHERE id = 'i2222222-2222-2222-2222-222222222222';

-- ==============================================================================
-- 6. ACTIVITY LOG (Sample)
-- ==============================================================================

INSERT INTO opex_task_activity_log (task_instance_id, actor_id, action, metadata) VALUES
(
    'i2222222-2222-2222-2222-222222222222',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'status_changed',
    '{"from": "in_progress", "to": "done", "comment": "All bank accounts reconciled successfully"}'::jsonb
),
(
    'i3333333-3333-3333-3333-333333333333',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'status_changed',
    '{"from": "in_progress", "to": "review", "comment": "Trial balance prepared, ready for review"}'::jsonb
),
(
    'i1111111-1111-1111-1111-111111111111',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'comment_added',
    '{"comment": "Waiting for final withholding certificates from 2 agencies"}'::jsonb
)
ON CONFLICT DO NOTHING;

-- ==============================================================================
-- SUCCESS MESSAGE
-- ==============================================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Seed data loaded successfully!';
    RAISE NOTICE '   - 5 teams created';
    RAISE NOTICE '   - 4 sample users created';
    RAISE NOTICE '   - 5 recurring task templates created';
    RAISE NOTICE '   - 4 task instances for Nov 2025 created';
    RAISE NOTICE '   - Sample activity log entries created';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Deploy edge function: opex-task-scheduler (generates instances from RRULE)';
    RAISE NOTICE '2. Deploy edge function: opex-task-notifications (Rocket.Chat alerts)';
    RAISE NOTICE '3. Create dashboard to visualize compliance health';
END $$;
