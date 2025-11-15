# Standard Operating Procedure: Month-End Closing Process

**Document Control**
- **Document ID:** FIN-SOP-001
- **Version:** 1.0
- **Effective Date:** 2025-11-15
- **Department:** Finance and Accounting
- **Process Owner:** Finance Director (GVKC)
- **Review Frequency:** Quarterly

---

## 1. Purpose

This Standard Operating Procedure (SOP) defines the standardized process for completing the monthly financial close for all entities. The purpose is to ensure:

- Timely and accurate financial reporting
- Compliance with Philippine Bureau of Internal Revenue (BIR) requirements
- Consistent application of accounting policies and internal controls
- Proper segregation of duties and approval workflow
- Audit trail and documentation retention

---

## 2. Scope

This procedure applies to:

- All month-end closing activities from the last business day of the month through final close (Day +8)
- All Finance and Accounting team members involved in preparation, review, and approval
- All general ledger accounts, project accounts, and subsidiary ledgers
- All BIR tax compliance and filing requirements
- All intercompany transactions and consolidation entries

**Out of Scope:**
- Year-end closing procedures (separate SOP: FIN-SOP-002)
- Quarterly auditor review procedures
- Budget preparation and variance analysis (separate process)

---

## 3. Definitions and Glossary

| Term | Definition |
|------|------------|
| **BIR** | Bureau of Internal Revenue - Philippine tax authority |
| **CA** | Cash Advance - funds advanced to employees for business expenses |
| **COGS** | Cost of Goods Sold |
| **EWT** | Expanded Withholding Tax |
| **GL** | General Ledger |
| **P&L** | Profit and Loss Statement |
| **PBB** | Performance-Based Bonus |
| **POP** | Percentage of Completion accounting method |
| **RACI** | Responsible, Accountable, Consulted, Informed |
| **SLA** | Service Level Agreement - target completion time |
| **VAT** | Value Added Tax (12% in Philippines) |
| **WC** | Working Capital |
| **WIP** | Work in Progress - unbilled project costs |

**Role Abbreviations:**
- **CNVC** - Finance Supervisor (Payroll & Treasury)
- **RM** - Senior Accountant (Corporate Accounting)
- **BOM** - Project Accountant (Project Accounting & Billing)
- **LAS** - Senior Accountant (Fixed Assets & Tax)
- **JPL** - Tax Specialist
- **GVKC** - Finance Director (Final Approver)

---

## 4. Preconditions and Required Inputs

### 4.1 Required System Access
- ERP/Accounting system (with proper user permissions)
- Payroll system
- Project management system
- Document management system
- BIR eFPS (electronic Filing and Payment System)

### 4.2 Required Input Documents
- Bank statements (all accounts, reconciled)
- Supplier invoices and vendor statements
- Client billing requests and job orders
- Employee expense reports and CA liquidations
- Payroll register (approved)
- Time and attendance records
- Government remittance forms (SSS, PhilHealth, Pag-IBIG)
- Foreign exchange rates (month-end official rates)
- Insurance policy schedules
- Asset acquisition/disposal documentation
- Lease agreements and rental contracts

### 4.3 System Prerequisites
- Prior month close must be finalized and locked
- All bank reconciliations must be completed
- All sub-ledgers must be balanced to GL control accounts
- Chart of accounts must be current

---

## 5. Month-End Closing Process - Detailed Steps

### **Phase 1: Days 1-3 (Oct 27-29) - Transaction Processing**

#### **Step 1.1: Payroll and Personnel Costs**
**Code:** 001 | **Responsible:** JPL | **Reviewer:** CNVC | **Approver:** GVKC | **SLA:** Day 1

1. Obtain approved payroll register from HR
2. Verify payroll calculations:
   - Gross salaries and wages
   - Government contributions (SSS, PhilHealth, Pag-IBIG)
   - Withholding tax (compensation)
   - Net pay and deductions
3. Process payroll journal entry:
   ```
   DR Salaries and Wages
   DR Employee Benefits Expense
   CR Withholding Tax Payable
   CR SSS/PhilHealth/Pag-IBIG Payable
   CR Cash/Bank
   ```
4. Record commissions (if applicable) based on approved commission schedules
5. Process salary settlement account adjustments
6. **Documentation Required:** Payroll register, government contribution computation, approved commission schedule
7. **Approval:** Finance Supervisor reviews calculations; Finance Director approves posting

[[Insert screenshot of: Payroll journal entry template]]

---

#### **Step 1.2: Rent and Lease Expenses**
**Code:** 002 | **Responsible:** CNVC | **Reviewer:** RM | **Approver:** GVKC | **SLA:** Day 1

1. Review all active lease agreements and rental contracts
2. Calculate monthly rental expense for:
   - Office premises (main and satellite locations)
   - Related party leases
   - Parking spaces
   - Condominium dues
   - Telephone and communication lines
3. Accrue rental expense if invoice not yet received:
   ```
   DR Rent Expense
   CR Accrued Rent Payable
   ```
4. Reconcile to lease schedule and contract terms
5. **Documentation Required:** Lease agreements, rental invoices, accrual calculation worksheet
6. **Controls:** Cross-reference to approved contract register; verify escalation clauses

[[Insert screenshot of: Lease accrual worksheet]]

---

#### **Step 1.3: Monthly Accruals - Operating Expenses**
**Code:** 003, 026 | **Responsible:** RM, JPL | **Reviewer:** GVKC | **Approver:** GVKC | **SLA:** Day 1-2

1. Identify all expenses incurred but not yet invoiced:
   - Management consulting fees
   - Project team fees
   - Travel and accommodation (approved but not liquidated)
   - Professional fees (legal, audit, advisory)
   - Utilities (electricity, water, internet)
   - Communication expenses
   - Recurring subscriptions
2. Obtain supporting documentation:
   - Approved purchase orders or engagement letters
   - Percentage of completion estimates
   - Utility meter readings (if invoice delayed)
3. Calculate accrual amount using:
   - Contract terms (monthly rate × time period)
   - Historical averages (for utilities)
   - Progress billing schedules (for project fees)
4. Process accrual entry:
   ```
   DR [Expense Category]
   CR Accrued Expenses Payable
   ```
5. Update accrual tracker spreadsheet
6. **Documentation Required:** PO/contract, accrual calculation, email approval from department head
7. **Controls:** Accruals >PHP 50,000 require department head sign-off; Review prior month accruals for reversal

[[Insert screenshot of: Accrual tracker template]]

---

#### **Step 1.4: Prior Period Review and Adjustments**
**Code:** 004 | **Responsible:** GVKC | **Reviewer:** GVKC | **Approver:** GVKC | **SLA:** Day 1

1. Review prior month temporary journal entries (flag: "TMP" in narration)
2. Identify entries requiring reversal in current month
3. Review prior period adjustment requests:
   - Corrections from audit findings
   - Corrections from client/vendor reconciliations
   - Reclassifications identified post-close
4. Prepare reversal entries for accruals that have now been invoiced
5. Document justification for each prior period adjustment
6. Process entries with clear narration: "Reversal of [original entry date/description]"
7. **Documentation Required:** Original JE reference, reversal memo, approval from Finance Director
8. **Controls:** All prior period adjustments require FD approval; Materiality threshold: PHP 25,000

[[Insert screenshot of: Prior period adjustment log]]

---

#### **Step 1.5: Depreciation and Amortization**
**Code:** 005, 012, 021 | **Responsible:** RM, LAS | **Reviewer:** GVKC | **Approver:** GVKC | **SLA:** Day 1-2

1. Update fixed asset register for:
   - New asset acquisitions (current month)
   - Asset disposals or retirements
   - Transfers between asset categories
   - Impairment indicators
2. Calculate monthly depreciation:
   - Apply depreciation method per asset class (straight-line, declining balance)
   - Verify useful life and salvage value
   - Prorate for partial month (if applicable)
3. Calculate amortization for:
   - Software licenses and subscriptions
   - Leasehold improvements
   - Capitalized development costs
   - Prepaid insurance and retainers
4. Process depreciation/amortization entry:
   ```
   DR Depreciation Expense
   DR Amortization Expense
   CR Accumulated Depreciation
   CR Accumulated Amortization
   ```
5. Reconcile accumulated depreciation to fixed asset register
6. **Documentation Required:** Fixed asset register, depreciation schedule, asset acquisition/disposal forms
7. **Controls:** Monthly depreciation variance >5% requires investigation

[[Insert screenshot of: Depreciation calculation schedule]]

---

#### **Step 1.6: Corporate Balance Sheet Reconciliations**
**Code:** 006 | **Responsible:** RM | **Reviewer:** GVKC | **Approver:** GVKC | **SLA:** Day 1

1. Reconcile key balance sheet accounts:
   - **Loans Payable:** Compare GL to loan amortization schedules and lender statements
   - **Deposits:** Verify security deposits, advance rent, earnest money
   - **Intercompany Accounts:** Reconcile with sister companies; resolve differences
   - **Accrued Liabilities:** Review aging; write-off stale items >12 months (with approval)
2. Record any identified adjustments
3. Perform intercompany revaluation (if foreign currency denominated):
   - Apply month-end exchange rate
   - Record forex gain/loss
4. Update reconciliation templates
5. **Documentation Required:** Loan statements, intercompany confirmation, reconciliation worksheets
6. **Controls:** All reconciling items >60 days require action plan

[[Insert screenshot of: Balance sheet reconciliation template]]

---

#### **Step 1.7: Insurance Accruals**
**Code:** 007 | **Responsible:** RM | **Reviewer:** GVKC | **Approver:** GVKC | **SLA:** Day 1

1. Review insurance policy register:
   - Property and casualty insurance
   - Professional indemnity
   - Employee benefits (group life, health)
   - Project-specific insurance
2. Calculate monthly insurance expense:
   - Annual premium ÷ 12 months
   - Or amortize based on policy period
3. Process accrual:
   ```
   DR Insurance Expense
   CR Prepaid Insurance (or Accrued Expenses)
   ```
4. Flag policies expiring within 60 days for renewal
5. Update insurance schedule for new policies
6. **Documentation Required:** Insurance policy register, premium invoices, amortization schedule
7. **Controls:** All new policies require Finance Director approval before recognition

[[Insert screenshot of: Insurance policy register]]

---

#### **Step 1.8: Treasury and Foreign Currency Management**
**Code:** 008 | **Responsible:** RM | **Reviewer:** GVKC | **Approver:** GVKC | **SLA:** Day 1

1. Obtain official month-end exchange rates from BSP (Bangko Sentral ng Pilipinas)
2. Identify all foreign currency denominated accounts:
   - Foreign currency bank accounts
   - Foreign currency receivables
   - Foreign currency payables
   - Intercompany foreign currency balances
3. Perform monthly revaluation:
   - Calculate unrealized forex gain/loss
   - Record mark-to-market adjustment
4. Record interest income on deposits and money market placements
5. Record bank charges and fees
6. Process treasury entries:
   ```
   DR/CR Foreign Currency Account
   CR/DR Unrealized Forex Gain/Loss

   DR Cash in Bank
   CR Interest Income
   ```
7. **Documentation Required:** BSP exchange rate bulletin, bank statements, forex revaluation worksheet
8. **Controls:** Forex positions >USD 100,000 require FD notification

[[Insert screenshot of: Forex revaluation worksheet]]

---

### **Phase 2: Days 2-4 (Oct 28-30) - Project Accounting**

#### **Step 2.1: Client Billings and Revenue Recognition**
**Code:** 009 | **Responsible:** BOM | **Reviewer:** GVKC | **Approver:** GVKC | **SLA:** Day 2

1. Obtain approved billing request forms from Project Management
2. Verify job order completion status and client approval
3. Prepare client invoices:
   - Professional fees (based on contract terms)
   - Reimbursable expenses
   - Apply VAT (12%)
   - Apply Expanded Withholding Tax if applicable
4. Record billing entry:
   ```
   DR Accounts Receivable
   CR Revenue - Professional Fees
   CR Output VAT
   ```
5. For unbilled revenue (work completed but not yet billed):
   - Calculate revenue earned under Percentage of Completion (POC)
   - Accrue unbilled revenue
   ```
   DR Unbilled Receivables
   CR Revenue - Professional Fees
   ```
6. Adjust deferred revenue for advance billings
7. **Documentation Required:** Approved billing request, job order, client contract, POC calculation
8. **Controls:** All billings >PHP 100,000 require Project Director sign-off

[[Insert screenshot of: Billing request form template]]

---

#### **Step 2.2: Project P&L and Working Capital Reporting**
**Code:** 010 | **Responsible:** BOM | **Reviewer:** GVKC | **Approver:** GVKC | **SLA:** Day 2

1. Extract project-level financial data from ERP
2. Prepare project P&L for each active job:
   - Revenue (billed and unbilled)
   - Direct costs (labor, materials, subcontractors)
   - Indirect allocated costs
   - Gross margin percentage
3. Prepare working capital reports:
   - Accounts receivable aging by project
   - Cash advance aging by project
   - Accrued project costs
4. Analyze variances:
   - Actual vs. budget
   - Current month vs. prior month
   - Gross margin trends
5. Flag projects with:
   - Negative gross margin
   - Overdue receivables >90 days
   - Unapplied cash advances >60 days
6. **Documentation Required:** Project P&L template, WC aging reports, variance analysis memo
7. **Controls:** Project margin <10% requires Project Director explanation

[[Insert screenshot of: Project P&L template]]

---

#### **Step 2.3: WIP/POP Reconciliation**
**Code:** 011, 022, 24 | **Responsible:** BOM | **Reviewer:** GVKC | **Approver:** GVKC | **SLA:** Day 2-3

1. Prepare Work-in-Progress (WIP) schedule for all ongoing projects:
   - Project costs incurred to date
   - Revenue recognized to date (under POC method)
   - Billings to date
   - Over/under billing position
2. Reconcile WIP to general ledger:
   - WIP balance per schedule = WIP balance per GL
   - Investigate and resolve variances
3. Review project status with Project Managers:
   - Confirm percentage complete estimates
   - Identify change orders or scope changes
   - Assess collectability of receivables
4. Record adjustments for:
   - Additional accrued costs identified
   - Deferred revenue for advance billings
   - Provision for doubtful accounts (if needed)
5. Update WIP summary schedule
6. **Documentation Required:** WIP schedule by job, POC calculation worksheet, Project Manager confirmation email
7. **Controls:** WIP variance >PHP 100,000 requires investigation and resolution before close

[[Insert screenshot of: WIP reconciliation template]]

---

#### **Step 2.4: Accounts Receivable and Collections**
**Code:** 013, 16 | **Responsible:** BOM | **Reviewer:** GVKC | **Approver:** GVKC | **SLA:** Day 2-3

1. Prepare AR aging report by customer:
   - Current (0-30 days)
   - 31-60 days
   - 61-90 days
   - Over 90 days
2. Reconcile customer balances to statements
3. Coordinate with Client Service team:
   - Obtain collection status updates
   - Identify disputed invoices
   - Confirm payment commitments
4. Assess doubtful accounts:
   - Apply aging-based provision policy (e.g., 50% >90 days, 100% >180 days)
   - Consider client-specific circumstances
5. Record bad debt provision (if required):
   ```
   DR Bad Debt Expense
   CR Allowance for Doubtful Accounts
   ```
6. **Documentation Required:** AR aging, customer reconciliation, collection status report, provision calculation
7. **Controls:** All write-offs require Finance Director approval; Provision changes >PHP 50,000 require memo justification

[[Insert screenshot of: AR aging template]]

---

#### **Step 2.5: Cash Advance Management**
**Code:** 014, 15, 23 | **Responsible:** BOM | **Reviewer:** GVKC | **Approver:** GVKC | **SLA:** Day 2-3

1. Process cash advance (CA) liquidations:
   - Review employee expense reports
   - Verify supporting receipts and documentation
   - Check approval signatures
   - Validate business purpose and GL coding
2. Record CA liquidation:
   ```
   DR [Expense Categories per receipts]
   DR Input VAT (if applicable)
   CR Cash Advance - Employee
   CR/DR Cash (for refund or additional payment)
   ```
3. Prepare CA aging report:
   - Employee name
   - Advance date
   - Amount
   - Aging bucket
4. Follow up on outstanding CAs:
   - Send reminder for liquidations >30 days
   - Escalate to department heads for >60 days
   - Process salary deduction for >90 days (with approval)
5. **Documentation Required:** Expense report, receipts, CA aging report, approval forms
6. **Controls:** All CAs >PHP 20,000 require Finance Supervisor pre-approval; Liquidation deadline: 30 days from return

[[Insert screenshot of: Cash advance liquidation form]]

---

### **Phase 3: Days 3-5 (Oct 29-31) - Tax Compliance**

#### **Step 3.1: VAT Computation and Filing**
**Code:** 019 | **Responsible:** JPL | **Reviewer:** RM | **Approver:** GVKC | **SLA:** Day 3

1. Compile monthly VAT return (BIR Form 2550M):
   - **Output VAT:** Sales × 12%
   - **Input VAT:** Purchases with valid VAT invoices × 12%
   - **Net VAT payable** or **excess input VAT**
2. Reconcile VAT accounts to GL:
   - Output VAT account balance
   - Input VAT account balance
   - Withholding VAT creditable
3. Review input VAT claims for validity:
   - Proper VAT invoice/receipt format
   - TIN verification of suppliers
   - Business-related purchases only
4. Process manual adjustments:
   - Input VAT disallowances (non-VAT purchases, missing invoices)
   - Output VAT corrections
5. Record monthly VAT entry:
   ```
   DR Output VAT
   CR Input VAT
   CR Withholding VAT Creditable
   CR VAT Payable (or DR VAT Excess Input)
   ```
6. Prepare VAT return for approval
7. **Documentation Required:** Sales register, purchases register, VAT reconciliation, BIR Form 2550M
8. **Controls:** Input VAT claims require valid VAT invoice; Late filing penalty: 25% + 12% annual interest

[[Insert screenshot of: VAT reconciliation worksheet]]

---

#### **Step 3.2: Withholding Tax Computation**
**Code:** 019 | **Responsible:** JPL | **Reviewer:** RM | **Approver:** GVKC | **SLA:** Day 3

1. Compile Expanded Withholding Tax (EWT) transactions:
   - Professional fees (10% or 15%)
   - Rent (5%)
   - Commissions (10%)
   - Other services per RR 2-98 as amended
2. Prepare BIR Form 1601-E (Monthly Remittance of Creditable Income Taxes Withheld):
   - List all payees with TIN
   - Withheld amount per income payment category
   - Total withholding tax payable
3. Reconcile EWT payable account to return
4. Prepare withholding tax certificates (BIR Form 2307) for suppliers
5. Record withholding tax entry (if not yet recorded):
   ```
   DR EWT Payable
   CR Cash/Bank (upon payment)
   ```
6. **Documentation Required:** Payment vouchers, EWT computation schedule, BIR Form 1601-E, 2307 certificates
7. **Controls:** All EWT must be withheld at time of payment; BIR deadline: 10th of following month

[[Insert screenshot of: EWT summary schedule]]

---

#### **Step 3.3: Tax Provision and Deferred Tax**
**Code:** N/A (Taxes & Compliance category) | **Responsible:** RM | **Reviewer:** GVKC | **Approver:** GVKC | **SLA:** Day 3

1. Calculate current month income tax provision:
   - Year-to-date pre-tax income
   - Apply corporate income tax rate (25% or 30% depending on gross income)
   - Divide by months elapsed = monthly provision
2. Review book-tax differences:
   - Temporary differences (e.g., depreciation method differences)
   - Permanent differences (e.g., non-deductible expenses)
3. Calculate deferred tax asset/liability (if material)
4. Record tax provision entry:
   ```
   DR Income Tax Expense
   CR Income Tax Payable
   CR Deferred Tax Liability (or DR Deferred Tax Asset)
   ```
5. Calculate Performance-Based Bonus (PBB) provision based on approved formula
6. **Documentation Required:** Tax provision worksheet, book-tax difference schedule, PBB calculation
7. **Controls:** Tax provision reviewed quarterly with external tax advisor

[[Insert screenshot of: Tax provision worksheet]]

---

### **Phase 4: Days 5-7 (Nov 1-3) - Final Adjustments**

#### **Step 4.1: Asset Entries and Capitalizations**
**Code:** 017, 20 | **Responsible:** LAS | **Reviewer:** GVKC | **Approver:** GVKC | **SLA:** Day 5

1. Review capital expenditure (capex) transactions for the month
2. Identify assets to be capitalized:
   - Purchase price >PHP 20,000 (capitalization threshold)
   - Useful life >1 year
   - Enhances asset value or extends useful life
3. Record new asset acquisitions:
   ```
   DR Fixed Assets - [Category]
   CR Accounts Payable / Cash
   ```
4. Process assets under construction/installation
5. Record right-of-use assets for new leases (PFRS 16):
   ```
   DR Right-of-Use Asset
   CR Lease Liability
   ```
6. Update fixed asset register
7. **Documentation Required:** Purchase invoice, asset requisition form, useful life determination memo
8. **Controls:** All capex >PHP 100,000 require Executive Committee approval

[[Insert screenshot of: Asset capitalization form]]

---

#### **Step 4.2: Reclassifications and Corrections**
**Code:** 018 | **Responsible:** LAS | **Reviewer:** GVKC | **Approver:** GVKC | **SLA:** Day 5

1. Review GL account classifications for accuracy
2. Identify and process reclassifications:
   - Between cost centers
   - Between projects
   - Between expense categories (e.g., Professional Fees to Wages)
   - Between OPEX and CAPEX
3. Process internal charge-backs:
   - Allocate shared services costs to business units
   - Allocate corporate overhead to projects (if applicable)
4. Record reclassification entries:
   ```
   DR [Correct Account/Cost Center]
   CR [Incorrect Account/Cost Center]
   ```
5. Ensure proper narration for audit trail
6. **Documentation Required:** Reclassification memo, allocation schedule, approval email
7. **Controls:** Material reclassifications (>PHP 50,000) require Finance Director approval

[[Insert screenshot of: Reclassification journal entry template]]

---

#### **Step 4.3: Final P&L Review and Adjustments**
**Code:** N/A (Final Adjustments category) | **Responsible:** BOM, RM | **Reviewer:** GVKC | **Approver:** GVKC | **SLA:** Day 6

1. Generate preliminary P&L report
2. Perform analytical review:
   - Compare to prior month
   - Compare to budget
   - Review unusual variances (>10% or >PHP 100,000)
3. Investigate and resolve anomalies:
   - Missing accruals
   - Duplicate entries
   - Incorrect allocations
   - Timing differences
4. Process final adjusting entries
5. Review key financial metrics:
   - Gross margin percentage
   - Operating expense ratio
   - EBITDA
6. Prepare variance explanations for material items
7. **Documentation Required:** Preliminary P&L, variance analysis, adjustment entries
8. **Controls:** No entries can be posted after Day 7 without Finance Director approval

[[Insert screenshot of: P&L variance analysis template]]

---

#### **Step 4.4: Working Capital Finalization**
**Code:** N/A (Final Adjustments category) | **Responsible:** BOM | **Reviewer:** GVKC | **Approver:** GVKC | **SLA:** Day 7

1. Finalize all working capital schedules:
   - AR aging (with collection status)
   - CA aging (with follow-up actions)
   - WIP schedule (with POC reconciliation)
   - Accrued liabilities aging
2. Prepare HO/TV (Head Office / Total Variance) summary report
3. Compile supporting schedules for balance sheet accounts
4. Update working capital KPIs:
   - Days Sales Outstanding (DSO)
   - Days Inventory Outstanding (DIO) - if applicable
   - Days Payable Outstanding (DPO)
   - Cash conversion cycle
5. **Documentation Required:** All WC schedules, KPI dashboard
6. **Controls:** All WC balances must reconcile to GL before close

[[Insert screenshot of: Working capital summary dashboard]]

---

### **Phase 5: Day 8 (Nov 4) - BIR Filing and Close**

#### **Step 5.1: Compile Tax Submission Documents**
**Code:** N/A (Final Adjustments category) | **Responsible:** LAS, JPL | **Reviewer:** GVKC | **Approver:** GVKC | **SLA:** Day 8

1. Gather all monthly BIR filing requirements:
   - BIR Form 1601-C (Withholding Tax on Compensation) - if applicable
   - BIR Form 0619-E (Monthly Remittance - SSS, PhilHealth, Pag-IBIG)
   - BIR Form 1601-E (EWT)
   - BIR Form 2550M (Monthly VAT)
2. Perform final review of each return
3. Prepare payment vouchers for all tax payments
4. Obtain required approvals per Tax Filing Process
5. File returns via BIR eFPS
6. Remit payments via authorized agent bank
7. Obtain and file stamped returns and payment confirmations
8. **Documentation Required:** All BIR forms, payment vouchers, bank payment confirmations
9. **Controls:** All returns must be filed by statutory deadline; Late filing penalty: 25% + interest

[[Insert screenshot of: Tax filing checklist]]

---

#### **Step 5.2: Final Close and Lock Period**
**Code:** N/A | **Responsible:** GVKC | **Approver:** GVKC | **SLA:** Day 8

1. Perform final GL review:
   - All suspense accounts cleared
   - All intercompany accounts balanced
   - All control accounts reconciled
2. Run final financial reports:
   - Balance Sheet
   - Income Statement
   - Cash Flow Statement
   - Trial Balance
3. Export GL detail for the period
4. Lock accounting period in ERP system
5. Archive all supporting documentation
6. Issue financial reports to stakeholders
7. **Documentation Required:** Final financial statements, GL export, close checklist
8. **Controls:** Only Finance Director can lock period; No post-close entries without FD approval and documentation

[[Insert screenshot of: Period close checklist]]

---

## 6. Approvals and Compliance

### 6.1 Approval Hierarchy

| Approval Level | Threshold | Approver | Documentation Required |
|----------------|-----------|----------|------------------------|
| **Transaction Level** | All routine monthly entries | Preparer (various) + Reviewer | Standard JE form, supporting docs |
| **Supervisory Review** | All entries before posting | Finance Supervisor / Senior Accountant | Review sign-off on JE |
| **Final Approval** | All posted entries | Finance Director (GVKC) | Approved JE packet |
| **Exceptional Items** | >PHP 100,000 or unusual | Finance Director + CFO | Special approval memo |
| **Prior Period Adjustments** | Any amount | Finance Director | Adjustment memo with justification |

### 6.2 Segregation of Duties

| Function | Preparer | Reviewer | Approver | Posting Rights |
|----------|----------|----------|----------|----------------|
| **Journal Entry** | Various | Supervisor | Finance Director | System Admin |
| **Cash Disbursement** | AP Clerk | Finance Supervisor | Finance Director | Treasury |
| **Bank Reconciliation** | Staff Accountant | Finance Supervisor | Finance Director | View Only |
| **Tax Filing** | Tax Specialist | Senior Accountant | Finance Director | Tax Specialist |

### 6.3 BIR Compliance Requirements

All month-end activities must ensure compliance with:

- **Revenue Regulations (RR) 2-98** (as amended) - Withholding tax rates and requirements
- **PFRS/PAS** - Philippine Financial Reporting Standards
- **BIR deadlines:**
  - Monthly VAT (2550M): 20th of following month
  - Monthly EWT (1601-E): 10th of following month
  - Monthly Compensation (1601-C/0619-E): 10th of following month
  - Quarterly Income Tax (1702-Q): Last day of month following quarter
  - Quarterly VAT (2550-Q): 25th of month following quarter

### 6.4 Audit Trail Requirements

All transactions must maintain:
- Source document (invoice, contract, approval email)
- Journal entry with clear narration
- Approvals with date and name
- Reconciliation (if balance sheet account)
- Filed in chronological order in document management system

**Retention Period:** 10 years (per BIR requirements)

---

## 7. Exception Handling and Escalation Matrix

| Exception Type | Resolution Action | Escalation Path | Timeline |
|----------------|-------------------|-----------------|----------|
| **Missing supporting document** | Hold posting; request from originator | Finance Supervisor → Finance Director | 24 hours |
| **Reconciliation variance >PHP 10,000** | Investigate root cause; prepare adjustment | Finance Supervisor → Finance Director | 48 hours |
| **Late vendor invoice (prior period)** | Record as prior period adjustment with memo | Finance Director approval required | Before close |
| **Client billing dispute** | Hold revenue recognition; consult with Client Service | Project Director → Finance Director | 72 hours |
| **System error or GL lock** | Log IT ticket; manual workaround if urgent | IT Support → Finance Director | 4 hours |
| **Employee non-compliance (CA liquidation)** | Send reminder; escalate to manager | Dept Manager → HR → Salary deduction | 30/60/90 days |
| **Missed BIR deadline** | File immediately; compute penalties; prepare memo | Finance Director → CFO | Immediate |

**Emergency Contact:** Finance Director (GVKC) - available during closing period

---

## 8. SLA Requirements and Critical Path

### 8.1 Service Level Agreements

| Process Phase | Target Completion | Critical Dependency |
|---------------|-------------------|---------------------|
| **Phase 1:** Transaction Processing | Day 3 (Oct 29) | Payroll approval, Bank reconciliation |
| **Phase 2:** Project Accounting | Day 4 (Oct 30) | Project Manager confirmations, Client billing approvals |
| **Phase 3:** Tax Compliance | Day 5 (Oct 31) | VAT/EWT reconciliations complete |
| **Phase 4:** Final Adjustments | Day 7 (Nov 3) | All accruals and reclassifications |
| **Phase 5:** BIR Filing & Close | Day 8 (Nov 4) | Final approval from Finance Director |

### 8.2 Critical Path Items (Cannot Be Delayed)

1. **Bank reconciliation** - Must be complete by Day 2
2. **Payroll processing** - Must be complete by Day 1 (for remittance deadline)
3. **VAT return** - Must be approved by Day 5 (for filing deadline Day 20)
4. **WIP reconciliation** - Must be complete by Day 4 (impacts revenue recognition)
5. **Final FD approval** - Must be obtained by Day 7 (to allow filing on Day 8)

### 8.3 Performance Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **On-time close** | 100% within 8 business days | Close date vs. target |
| **Rework rate** | <5% of entries | Reversed/corrected entries ÷ total entries |
| **Compliance rate** | 100% BIR filings on time | On-time filings ÷ total filings |
| **Variance accuracy** | >95% explanations documented | Variances explained ÷ total variances >10% |

---

## 9. Related Documents and References

- **FIN-SOP-002:** Year-End Closing Procedure
- **FIN-POL-001:** Capitalization Policy
- **FIN-POL-002:** Revenue Recognition Policy (PFRS 15)
- **FIN-POL-003:** Allowance for Doubtful Accounts Policy
- **FIN-FORM-001:** Journal Entry Template
- **FIN-FORM-002:** Month-End Close Checklist
- **TAX-REF-001:** BIR Tax Calendar
- **TAX-REF-002:** Withholding Tax Rate Card

**External References:**
- BIR Revenue Regulations: https://www.bir.gov.ph
- PFRS Standards: https://www.frsc.com.ph

---

## 10. Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-11-15 | Finance Team | Initial SOP documentation based on current practice |

---

## 11. Approval Sign-Off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| **Prepared By** | Finance Team | | |
| **Reviewed By** | Finance Supervisor (CNVC) | | |
| **Approved By** | Finance Director (GVKC) | | |

---

**END OF DOCUMENT**
