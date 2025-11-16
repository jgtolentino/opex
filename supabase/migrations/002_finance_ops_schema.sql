-- Migration: Finance Operations Schema
-- Purpose: Normalized schema for month-end closing, BIR tax filing, and CPA exam tracking
-- Version: 1.0
-- Created: 2025-11-16

-- ============================================================================
-- 1. MONTH-END CLOSING TABLES
-- ============================================================================

-- Roles and entities table
CREATE TABLE IF NOT EXISTS opex.finance_roles (
  id SERIAL PRIMARY KEY,
  code VARCHAR(20) UNIQUE NOT NULL, -- RIM, CKVC, BOM, etc.
  name TEXT NOT NULL, -- "Finance Supervisor", "Senior Finance Manager", etc.
  type VARCHAR(20) NOT NULL CHECK (type IN ('entity', 'role')),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE opex.finance_roles IS 'Finance roles and entity codes (RIM, CKVC, BOM, etc.)';

-- Month-end closing tasks (normalized from CSV)
CREATE TABLE IF NOT EXISTS opex.closing_tasks (
  id SERIAL PRIMARY KEY,
  task_name TEXT NOT NULL,
  category VARCHAR(100) NOT NULL, -- "Bank Reconciliation", "AP/AR", "Fixed Assets", etc.
  stage VARCHAR(20) NOT NULL CHECK (stage IN ('Preparation', 'Review', 'Approval')),
  owner_role_code VARCHAR(20) NOT NULL, -- JPAL, RIM, CKVC, etc.
  responsible_role VARCHAR(100) NOT NULL, -- "Finance Supervisor", "Senior Finance Manager", etc.
  accountable_role VARCHAR(100), -- "Finance SSC Manager", etc.
  due_day INTEGER NOT NULL CHECK (due_day BETWEEN 1 AND 31), -- Day 1-15 of close cycle
  sla_hours NUMERIC(5,1) NOT NULL, -- e.g., 2.0, 4.0, 24.0 (1 day)
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'overdue')),
  evidence_required TEXT,
  bir_form VARCHAR(20), -- e.g., "1601-C", "2550Q", NULL
  description TEXT,
  dependencies JSONB, -- Array of task IDs this task depends on
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE opex.closing_tasks IS 'Master list of month-end closing tasks with dependencies and SLAs';
CREATE INDEX idx_closing_tasks_due_day ON opex.closing_tasks(due_day);
CREATE INDEX idx_closing_tasks_role ON opex.closing_tasks(owner_role_code);
CREATE INDEX idx_closing_tasks_category ON opex.closing_tasks(category);
CREATE INDEX idx_closing_tasks_status ON opex.closing_tasks(status);

-- Period-specific task instances (actual execution tracking)
CREATE TABLE IF NOT EXISTS opex.closing_task_instances (
  id SERIAL PRIMARY KEY,
  task_id INTEGER NOT NULL REFERENCES opex.closing_tasks(id),
  period_end_date DATE NOT NULL, -- e.g., 2025-10-31
  entity_code VARCHAR(20) NOT NULL, -- RIM, CKVC, BOM, etc.
  assigned_to_user_id UUID, -- Supabase auth user ID
  due_date DATE NOT NULL,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'overdue', 'blocked')),
  evidence_url TEXT, -- Link to Google Drive, Notion, etc.
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE opex.closing_task_instances IS 'Period-specific instances of closing tasks (e.g., Oct 2025 close for RIM)';
CREATE INDEX idx_task_instances_period ON opex.closing_task_instances(period_end_date);
CREATE INDEX idx_task_instances_entity ON opex.closing_task_instances(entity_code);
CREATE INDEX idx_task_instances_status ON opex.closing_task_instances(status);
CREATE UNIQUE INDEX idx_task_instances_unique ON opex.closing_task_instances(task_id, period_end_date, entity_code);

-- ============================================================================
-- 2. BIR TAX FILING TABLES
-- ============================================================================

-- BIR form definitions
CREATE TABLE IF NOT EXISTS opex.bir_forms (
  id SERIAL PRIMARY KEY,
  form_code VARCHAR(20) UNIQUE NOT NULL, -- "1601-C", "2550Q", "1702-Q", etc.
  form_name TEXT NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('monthly', 'quarterly', 'annual', 'as_needed')),
  description TEXT,
  statutory_deadline_rule TEXT, -- e.g., "10th day of following month", "25 days after quarter"
  enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE opex.bir_forms IS 'BIR form catalog with deadline rules';

-- Insert default BIR forms
INSERT INTO opex.bir_forms (form_code, form_name, category, statutory_deadline_rule) VALUES
  ('1601-C', 'Monthly Remittance Return of Income Taxes Withheld (Compensation)', 'monthly', '10th day of following month'),
  ('1601-E', 'Monthly Remittance Return of Income Taxes Withheld (Expanded)', 'monthly', '10th day of following month'),
  ('2550Q', 'Quarterly Value-Added Tax Return', 'quarterly', '25 days after quarter-end'),
  ('1701-Q', 'Quarterly Income Tax Return for Self-Employed/Professionals', 'quarterly', 'Last day of month following quarter'),
  ('1702-Q', 'Quarterly Income Tax Return for Corporations', 'quarterly', '60 days after quarter-end'),
  ('1702', 'Annual Income Tax Return for Corporations', 'annual', '15th day of 4th month following taxable year'),
  ('1700', 'Annual Income Tax Return for Self-Employed/Professionals', 'annual', '15th day of 4th month following taxable year'),
  ('0619-E', 'Annual Information Return of Income Taxes Withheld on Compensation (Alphalist)', 'annual', '31 January (with Jan 1601-C)'),
  ('2307', 'Certificate of Creditable Tax Withheld at Source', 'as_needed', 'Within 20 days after quarter')
ON CONFLICT (form_code) DO NOTHING;

-- BIR filing schedule (computed deadlines per period)
CREATE TABLE IF NOT EXISTS opex.bir_filing_schedule (
  id SERIAL PRIMARY KEY,
  form_code VARCHAR(20) NOT NULL REFERENCES opex.bir_forms(form_code),
  period_type VARCHAR(20) NOT NULL CHECK (period_type IN ('monthly', 'quarterly', 'annual')),
  period_label VARCHAR(20) NOT NULL, -- "Jan 2026", "Q1 2026", "CY 2025"
  period_start_date DATE NOT NULL,
  period_end_date DATE NOT NULL,
  filing_deadline DATE NOT NULL, -- Statutory deadline
  filing_deadline_adjusted DATE NOT NULL, -- Adjusted for weekends/holidays
  is_holiday_adjusted BOOLEAN DEFAULT FALSE,
  prep_date DATE NOT NULL, -- Deadline - 4 business days
  approval_sfm_date DATE NOT NULL, -- Deadline - 2 business days
  approval_fd_date DATE NOT NULL, -- Deadline - 1 business day
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'filed', 'overdue')),
  efps_confirmation_number TEXT,
  payment_reference_number TEXT,
  filed_at TIMESTAMPTZ,
  filed_by_user_id UUID,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE opex.bir_filing_schedule IS 'Computed BIR filing deadlines with back-scheduled phases';
CREATE INDEX idx_filing_schedule_form ON opex.bir_filing_schedule(form_code);
CREATE INDEX idx_filing_schedule_period ON opex.bir_filing_schedule(period_label);
CREATE INDEX idx_filing_schedule_deadline ON opex.bir_filing_schedule(filing_deadline_adjusted);
CREATE INDEX idx_filing_schedule_status ON opex.bir_filing_schedule(status);
CREATE UNIQUE INDEX idx_filing_schedule_unique ON opex.bir_filing_schedule(form_code, period_label);

-- ============================================================================
-- 3. CPA EXAM TRACKING TABLES
-- ============================================================================

-- CPA subjects
CREATE TABLE IF NOT EXISTS opex.cpa_subjects (
  id SERIAL PRIMARY KEY,
  code VARCHAR(10) UNIQUE NOT NULL, -- "FAR", "AFAR", "MAS", "AUDIT", "RFBT", "TAX"
  name TEXT NOT NULL,
  exam_weight NUMERIC(4,2), -- % of total exam, e.g., 16.67 for each subject
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO opex.cpa_subjects (code, name, exam_weight) VALUES
  ('FAR', 'Financial Accounting and Reporting', 16.67),
  ('AFAR', 'Advanced Financial Accounting and Reporting', 16.67),
  ('MAS', 'Management Advisory Services', 16.67),
  ('AUDIT', 'Auditing Theory and Practice', 16.67),
  ('RFBT', 'Regulatory Framework for Business Transactions', 16.67),
  ('TAX', 'Taxation', 16.67)
ON CONFLICT (code) DO NOTHING;

-- CPA syllabus topics (hierarchical)
CREATE TABLE IF NOT EXISTS opex.cpa_syllabus_topics (
  id SERIAL PRIMARY KEY,
  subject_code VARCHAR(10) NOT NULL REFERENCES opex.cpa_subjects(code),
  section_code VARCHAR(20) NOT NULL, -- e.g., "10.1", "6.5.3"
  title TEXT NOT NULL,
  description TEXT,
  parent_section_code VARCHAR(20), -- For hierarchical structure (e.g., "10.1" parent of "10.1.1")
  level INTEGER DEFAULT 1, -- Depth in hierarchy (1 = main topic, 2 = subtopic, etc.)
  exam_yield VARCHAR(20) CHECK (exam_yield IN ('high', 'medium', 'low')),
  is_computational BOOLEAN DEFAULT FALSE,
  prerequisites JSONB, -- Array of prerequisite section codes
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE opex.cpa_syllabus_topics IS 'CPA exam syllabus topics in hierarchical structure';
CREATE INDEX idx_syllabus_subject ON opex.cpa_syllabus_topics(subject_code);
CREATE INDEX idx_syllabus_section ON opex.cpa_syllabus_topics(section_code);
CREATE UNIQUE INDEX idx_syllabus_unique ON opex.cpa_syllabus_topics(subject_code, section_code);

-- User study progress tracking
CREATE TABLE IF NOT EXISTS opex.cpa_study_progress (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL, -- Supabase auth user ID
  topic_id INTEGER NOT NULL REFERENCES opex.cpa_syllabus_topics(id),
  coverage_source VARCHAR(50) CHECK (coverage_source IN ('real_work', 'self_study', 'course', 'drill')),
  linked_task_id INTEGER, -- References closing_tasks.id or bir_filing_schedule.id if from real work
  covered_at DATE DEFAULT CURRENT_DATE,
  confidence_level INTEGER CHECK (confidence_level BETWEEN 1 AND 5), -- 1 = weak, 5 = strong
  practice_questions_attempted INTEGER DEFAULT 0,
  practice_questions_correct INTEGER DEFAULT 0,
  last_reviewed_at DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE opex.cpa_study_progress IS 'User progress tracking per CPA syllabus topic';
CREATE INDEX idx_study_progress_user ON opex.cpa_study_progress(user_id);
CREATE INDEX idx_study_progress_topic ON opex.cpa_study_progress(topic_id);
CREATE UNIQUE INDEX idx_study_progress_unique ON opex.cpa_study_progress(user_id, topic_id, coverage_source);

-- ============================================================================
-- 4. SUPPORTING TABLES
-- ============================================================================

-- Philippine holiday calendar
CREATE TABLE IF NOT EXISTS opex.ph_holidays (
  id SERIAL PRIMARY KEY,
  holiday_date DATE UNIQUE NOT NULL,
  holiday_name TEXT NOT NULL,
  holiday_type VARCHAR(20) CHECK (holiday_type IN ('regular', 'special_non_working', 'special_working')),
  is_recurring BOOLEAN DEFAULT FALSE, -- e.g., New Year, Christmas (fixed date)
  year INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE opex.ph_holidays IS 'Philippine national and special holidays for business day calculations';
CREATE INDEX idx_holidays_date ON opex.ph_holidays(holiday_date);
CREATE INDEX idx_holidays_year ON opex.ph_holidays(year);

-- Insert common recurring holidays (update yearly)
INSERT INTO opex.ph_holidays (holiday_date, holiday_name, holiday_type, is_recurring, year) VALUES
  ('2025-01-01', 'New Year''s Day', 'regular', TRUE, 2025),
  ('2025-04-09', 'Araw ng Kagitingan (Day of Valor)', 'regular', FALSE, 2025),
  ('2025-04-17', 'Maundy Thursday', 'regular', FALSE, 2025),
  ('2025-04-18', 'Good Friday', 'regular', FALSE, 2025),
  ('2025-05-01', 'Labor Day', 'regular', TRUE, 2025),
  ('2025-06-12', 'Independence Day', 'regular', TRUE, 2025),
  ('2025-08-25', 'National Heroes Day (last Mon of Aug)', 'regular', FALSE, 2025),
  ('2025-11-30', 'Bonifacio Day', 'regular', TRUE, 2025),
  ('2025-12-25', 'Christmas Day', 'regular', TRUE, 2025),
  ('2025-12-30', 'Rizal Day', 'regular', TRUE, 2025),
  ('2026-01-01', 'New Year''s Day', 'regular', TRUE, 2026),
  ('2026-04-09', 'Araw ng Kagitingan (Day of Valor)', 'regular', FALSE, 2026),
  ('2026-04-02', 'Maundy Thursday', 'regular', FALSE, 2026),
  ('2026-04-03', 'Good Friday', 'regular', FALSE, 2026),
  ('2026-05-01', 'Labor Day', 'regular', TRUE, 2026),
  ('2026-06-12', 'Independence Day', 'regular', TRUE, 2026),
  ('2026-08-31', 'National Heroes Day (last Mon of Aug)', 'regular', FALSE, 2026),
  ('2026-11-30', 'Bonifacio Day', 'regular', TRUE, 2026),
  ('2026-12-25', 'Christmas Day', 'regular', TRUE, 2026),
  ('2026-12-30', 'Rizal Day', 'regular', TRUE, 2026)
ON CONFLICT (holiday_date) DO NOTHING;

-- ============================================================================
-- 5. HELPER FUNCTIONS
-- ============================================================================

-- Function: Add business days (skip weekends + PH holidays)
CREATE OR REPLACE FUNCTION opex.add_business_days(start_date DATE, num_days INTEGER)
RETURNS DATE AS $$
DECLARE
  current_date DATE := start_date;
  days_added INTEGER := 0;
BEGIN
  WHILE days_added < num_days LOOP
    current_date := current_date + INTERVAL '1 day';

    -- Skip weekends (6 = Saturday, 0 = Sunday in PostgreSQL)
    IF EXTRACT(DOW FROM current_date) NOT IN (0, 6) THEN
      -- Skip holidays
      IF NOT EXISTS (
        SELECT 1 FROM opex.ph_holidays
        WHERE holiday_date = current_date
        AND holiday_type IN ('regular', 'special_non_working')
      ) THEN
        days_added := days_added + 1;
      END IF;
    END IF;
  END LOOP;

  RETURN current_date;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION opex.add_business_days IS 'Add N business days to a date, skipping weekends and PH holidays';

-- Function: Subtract business days
CREATE OR REPLACE FUNCTION opex.subtract_business_days(start_date DATE, num_days INTEGER)
RETURNS DATE AS $$
DECLARE
  current_date DATE := start_date;
  days_subtracted INTEGER := 0;
BEGIN
  WHILE days_subtracted < num_days LOOP
    current_date := current_date - INTERVAL '1 day';

    IF EXTRACT(DOW FROM current_date) NOT IN (0, 6) THEN
      IF NOT EXISTS (
        SELECT 1 FROM opex.ph_holidays
        WHERE holiday_date = current_date
        AND holiday_type IN ('regular', 'special_non_working')
      ) THEN
        days_subtracted := days_subtracted + 1;
      END IF;
    END IF;
  END LOOP;

  RETURN current_date;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION opex.subtract_business_days IS 'Subtract N business days from a date, skipping weekends and PH holidays';

-- Function: Is business day?
CREATE OR REPLACE FUNCTION opex.is_business_day(check_date DATE)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if weekend
  IF EXTRACT(DOW FROM check_date) IN (0, 6) THEN
    RETURN FALSE;
  END IF;

  -- Check if holiday
  IF EXISTS (
    SELECT 1 FROM opex.ph_holidays
    WHERE holiday_date = check_date
    AND holiday_type IN ('regular', 'special_non_working')
  ) THEN
    RETURN FALSE;
  END IF;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION opex.is_business_day IS 'Check if a date is a business day (not weekend or PH holiday)';

-- Function: Get next business day
CREATE OR REPLACE FUNCTION opex.get_next_business_day(start_date DATE)
RETURNS DATE AS $$
BEGIN
  RETURN opex.add_business_days(start_date, 1);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================================
-- 6. VIEWS FOR COMMON QUERIES
-- ============================================================================

-- View: Overdue closing tasks (current period)
CREATE OR REPLACE VIEW opex.v_overdue_closing_tasks AS
SELECT
  cti.id,
  cti.period_end_date,
  cti.entity_code,
  ct.task_name,
  ct.category,
  ct.responsible_role,
  cti.due_date,
  CURRENT_DATE - cti.due_date AS days_overdue,
  cti.status,
  ct.sla_hours
FROM opex.closing_task_instances cti
JOIN opex.closing_tasks ct ON cti.task_id = ct.id
WHERE cti.status != 'completed'
  AND cti.due_date < CURRENT_DATE
ORDER BY days_overdue DESC, ct.due_day;

COMMENT ON VIEW opex.v_overdue_closing_tasks IS 'All overdue closing tasks for current periods';

-- View: Upcoming BIR filings (next 30 days)
CREATE OR REPLACE VIEW opex.v_upcoming_bir_filings AS
SELECT
  bf.form_code,
  bf.form_name,
  bfs.period_label,
  bfs.filing_deadline_adjusted,
  bfs.prep_date,
  bfs.approval_sfm_date,
  bfs.approval_fd_date,
  bfs.status,
  bfs.filing_deadline_adjusted - CURRENT_DATE AS days_until_deadline,
  CASE
    WHEN bfs.filing_deadline_adjusted - CURRENT_DATE <= 3 THEN 'urgent'
    WHEN bfs.filing_deadline_adjusted - CURRENT_DATE <= 7 THEN 'high'
    WHEN bfs.filing_deadline_adjusted - CURRENT_DATE <= 14 THEN 'medium'
    ELSE 'low'
  END AS priority
FROM opex.bir_filing_schedule bfs
JOIN opex.bir_forms bf ON bfs.form_code = bf.form_code
WHERE bfs.status != 'filed'
  AND bfs.filing_deadline_adjusted BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
ORDER BY bfs.filing_deadline_adjusted;

COMMENT ON VIEW opex.v_upcoming_bir_filings IS 'BIR filings due in next 30 days with priority levels';

-- View: CPA study coverage heatmap (per user)
CREATE OR REPLACE VIEW opex.v_cpa_study_coverage AS
SELECT
  sp.user_id,
  cs.code AS subject_code,
  cs.name AS subject_name,
  COUNT(DISTINCT sp.topic_id) AS topics_covered,
  COUNT(DISTINCT CASE WHEN sp.coverage_source = 'real_work' THEN sp.topic_id END) AS topics_from_work,
  SUM(sp.practice_questions_attempted) AS total_questions_attempted,
  SUM(sp.practice_questions_correct) AS total_questions_correct,
  ROUND(AVG(sp.confidence_level), 2) AS avg_confidence,
  MAX(sp.last_reviewed_at) AS last_review_date
FROM opex.cpa_study_progress sp
JOIN opex.cpa_syllabus_topics st ON sp.topic_id = st.id
JOIN opex.cpa_subjects cs ON st.subject_code = cs.code
GROUP BY sp.user_id, cs.code, cs.name
ORDER BY cs.code;

COMMENT ON VIEW opex.v_cpa_study_coverage IS 'Per-user CPA study coverage summary by subject';

-- ============================================================================
-- 7. GRANTS (adjust as needed for your auth setup)
-- ============================================================================

-- Grant SELECT to authenticated users
GRANT SELECT ON ALL TABLES IN SCHEMA opex TO authenticated;
GRANT SELECT ON ALL SEQUENCES IN SCHEMA opex TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA opex TO authenticated;

-- Grant INSERT, UPDATE to service role (for agents/automation)
GRANT INSERT, UPDATE ON opex.closing_task_instances TO service_role;
GRANT INSERT, UPDATE ON opex.bir_filing_schedule TO service_role;
GRANT INSERT, UPDATE ON opex.cpa_study_progress TO service_role;

-- ============================================================================
-- 8. ROW-LEVEL SECURITY (RLS) - Optional
-- ============================================================================

-- Enable RLS on user-specific tables
ALTER TABLE opex.closing_task_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE opex.cpa_study_progress ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own study progress
CREATE POLICY "Users can view own study progress" ON opex.cpa_study_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own study progress" ON opex.cpa_study_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own study progress" ON opex.cpa_study_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can see task instances for their assigned tasks (optional)
-- Adjust based on your auth/org model
-- CREATE POLICY "Users see assigned tasks" ON opex.closing_task_instances
--   FOR SELECT USING (assigned_to_user_id = auth.uid());

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
