-- Migration: Create expenses table for T&E tax console
-- Purpose: Store expense records with tax validation status

-- Create expenses table
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id TEXT NOT NULL,
  employee_name TEXT NOT NULL,
  date DATE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  tax_status TEXT NOT NULL DEFAULT 'pending',
  last_tax_summary TEXT,
  validation_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT tax_status_check CHECK (
    tax_status IN ('pending', 'validated', 'high_risk', 'exempt')
  )
);

-- Create index on employee_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_expenses_employee_id ON public.expenses(employee_id);

-- Create index on date for date range queries
CREATE INDEX IF NOT EXISTS idx_expenses_date ON public.expenses(date DESC);

-- Create index on tax_status for filtering
CREATE INDEX IF NOT EXISTS idx_expenses_tax_status ON public.expenses(tax_status);

-- Enable Row Level Security
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to read all expenses
CREATE POLICY "Authenticated users can read expenses"
  ON public.expenses
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Allow authenticated users to insert expenses (for testing/demo)
CREATE POLICY "Authenticated users can insert expenses"
  ON public.expenses
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_expenses_updated_at
  BEFORE UPDATE ON public.expenses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for demo/testing
INSERT INTO public.expenses (
  employee_id,
  employee_name,
  date,
  amount,
  category,
  description,
  tax_status,
  last_tax_summary
) VALUES
  ('EMP001', 'Juan Dela Cruz', '2025-11-01', 1250.00, 'Transportation', 'Taxi to client meeting', 'validated', 'Compliant with BIR regulations'),
  ('EMP001', 'Juan Dela Cruz', '2025-11-05', 3500.00, 'Meals', 'Client lunch at Makati', 'validated', 'Within per diem limits'),
  ('EMP002', 'Maria Santos', '2025-11-03', 850.00, 'Office Supplies', 'Printer paper and toner', 'validated', 'Valid business expense'),
  ('EMP002', 'Maria Santos', '2025-11-10', 15000.00, 'Travel', 'Flight to Cebu for conference', 'high_risk', 'Exceeds standard travel allowance - requires additional documentation'),
  ('EMP003', 'Pedro Reyes', '2025-11-07', 500.00, 'Transportation', 'Grab to BGC office', 'validated', 'Compliant'),
  ('EMP003', 'Pedro Reyes', '2025-11-12', 2200.00, 'Meals', 'Team dinner', 'pending', NULL),
  ('EMP004', 'Ana Gonzales', '2025-11-08', 12500.00, 'Accommodation', 'Hotel stay - Davao business trip', 'validated', 'Pre-approved business travel'),
  ('EMP004', 'Ana Gonzales', '2025-11-15', 750.00, 'Miscellaneous', 'Office snacks', 'exempt', 'De minimis benefit'),
  ('EMP005', 'Carlos Aquino', '2025-11-09', 4800.00, 'Communication', 'Mobile plan reimbursement', 'validated', 'Per employment contract'),
  ('EMP005', 'Carlos Aquino', '2025-11-14', 25000.00, 'Equipment', 'Laptop upgrade', 'pending', NULL)
ON CONFLICT DO NOTHING;

COMMENT ON TABLE public.expenses IS 'Expense records with PH tax validation status';
COMMENT ON COLUMN public.expenses.tax_status IS 'Tax validation status: pending, validated, high_risk, exempt';
COMMENT ON COLUMN public.expenses.last_tax_summary IS 'Latest AI-generated tax validation summary';
