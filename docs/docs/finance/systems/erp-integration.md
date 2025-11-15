---
id: erp-integration
title: ERP System Integration Guide
sidebar_label: ERP Integration
description: Guide to ERP system usage for financial accounting, reporting, and vendor management
tags:
  - finance
  - systems
  - erp
  - accounting
  - integration
---

# ERP System Integration Guide

## Overview

The Enterprise Resource Planning (ERP) system is the company's core financial accounting platform, managing the general ledger, accounts payable, accounts receivable, fixed assets, and financial reporting.

**System**: SAP Business One / Oracle NetSuite (adapt as needed)
**System Owner**: Finance Team
**Support**: erp-support@company.com | Extension 5100
**Access**: Finance team, accounting, authorized users

---

## System Access

### Who Gets Access

**Full Access**:
- Finance team
- Accounting team
- Controllers and CFO

**Limited Access**:
- Budget owners (view only)
- Procurement team (purchasing module)
- AP clerks (payables only)
- AR clerks (receivables only)

### Requesting Access

**Process**:
1. Submit ServiceNow request: "ERP System Access"
2. Manager and Finance Controller approval required
3. Specify role and modules needed
4. Complete security training (mandatory)
5. Receive credentials and training

**Provisioning Time**: 3-5 business days

---

## Key ERP Modules

### 1. General Ledger (GL)

**Purpose**: Central accounting system recording all financial transactions

**Key Features**:
- Chart of Accounts management
- Journal entry processing
- Period-end close
- Financial statement generation
- Consolidation (multi-entity)

**Primary Users**: Accounting team, Finance Controller

---

### 2. Accounts Payable (AP)

**Purpose**: Vendor invoice processing and payment management

**Key Features**:
- Invoice receipt and validation
- 3-way matching (PO, receipt, invoice)
- Approval workflows
- Payment processing (bank transfers, checks)
- 1099/tax compliance (Philippines: BIR forms)
- Vendor management

**Primary Users**: AP team, Finance team

---

### 3. Accounts Receivable (AR)

**Purpose**: Customer invoicing and cash collection

**Key Features**:
- Customer invoicing
- Payment application
- Aging reports
- Collections management
- Bad debt write-offs

**Primary Users**: AR team, Finance team

---

### 4. Fixed Assets (FA)

**Purpose**: Asset tracking and depreciation

**Key Features**:
- Asset registration
- Depreciation calculation (multiple methods)
- Asset transfers and disposals
- Asset inventory management
- Compliance reporting

**Primary Users**: Accounting team

---

### 5. Purchasing

**Purpose**: Purchase order management and procurement

**Key Features**:
- Purchase order creation
- Goods receipt recording
- PO approval workflows
- Vendor catalog management
- Requisition-to-PO conversion

**Primary Users**: Procurement team, AP team

---

## Common Finance Workflows

### Invoice Processing in ERP

**Step-by-Step** (AP Team):

1. **Invoice Receipt**
   - Email: ap@company.com
   - Auto-forwarded to ERP inbox
   - OCR extraction of invoice data

2. **Invoice Registration**
   - Navigate to: AP > Invoice Entry
   - Verify OCR data:
     - Vendor name and TIN
     - Invoice number and date
     - Line items and amounts
     - Tax calculations (VAT, WHT)
   - Correct any OCR errors

3. **PO Matching** (if PO-based)
   - System auto-matches to PO number
   - Displays matching results:
     - ✓ Perfect match: Auto-approve (<₱10K)
     - ⚠ Variance detected: Manual review
   - AP reviews and resolves variances

4. **Budget Owner Approval** (if Non-PO)
   - System routes to budget owner via ServiceNow
   - Budget owner approves in ServiceNow
   - Approval synced back to ERP

5. **GL Coding**
   - Auto-populated from PO (if PO-based)
   - Manual entry for non-PO
   - Validation against budget codes

6. **Tax Calculation**
   - VAT (12% input tax)
   - Withholding tax (per BIR schedule)
   - System auto-calculates
   - Manual override with justification

7. **Final Approval**
   - Finance Controller approval (if >₱100K)
   - System validates:
     - Budget availability
     - Approval limits
     - Duplicate invoice check

8. **Payment Scheduling**
   - Auto-scheduled per vendor payment terms
   - Batch assignment (Tuesday/Friday batches)
   - Payment file generation

---

### Payment Processing

**Payment Run** (AP Manager):

1. **Select Payment Batch**
   - Navigate to: AP > Payment Run
   - Select payment date
   - Filter criteria:
     - Payment method (bank transfer, check)
     - Due date range
     - Vendor selection
   - System proposes payments

2. **Review and Adjust**
   - Review payment list
   - Check bank balance sufficiency
   - Priority adjustments if needed:
     - Remove low-priority items
     - Add urgent payments
   - Verify totals

3. **Generate Payment File**
   - Bank transfer: Generate electronic file (format per bank)
   - Check: Print check batch
   - Wire transfer: Manual bank portal entry

4. **Approve and Execute**
   - Dual approval required (2 of: AP Manager, Finance Controller, CFO)
   - Digital signatures
   - Submit to bank
   - Update payment status in ERP

5. **Post-Payment**
   - System posts GL entries
   - Updates AP balances
   - Generates remittance advice
   - Emails vendors automatically

**Payment Batch Schedule**:
- **Tuesday**: Standard batch (Net 30 due this week)
- **Friday**: Standard batch (Net 30 due next week)
- **Wednesday**: Check run
- **Daily**: Urgent/same-day (before 2 PM)

---

### Month-End Close Process

**Accounting Team Tasks**:

See: [Month-End Close Workflow](/docs/finance/workflows/month-end-close)

**ERP-Specific Steps**:

1. **Day 1: Transaction Cutoff**
   - Lock prior period (AP > Period Control)
   - Verify all transactions posted
   - Run preliminary trial balance

2. **Day 1-2: Subledger Reconciliations**
   - AP aging reconciliation (AP > Reports > Aging)
   - AR aging reconciliation (AR > Reports > Aging)
   - Fixed assets register check (FA > Asset List)
   - Bank reconciliation (Cash > Bank Rec)

3. **Day 3: Adjusting Entries**
   - Journal Entry module (GL > Journal Entry)
   - Standard entries:
     - Depreciation (auto-calculated in FA module)
     - Accruals (manual entry)
     - Prepayments (manual entry)
     - Intercompany eliminations (consolidation module)

4. **Day 4: Trial Balance and Review**
   - Run final trial balance (GL > Reports > Trial Balance)
   - Export to Excel for variance analysis
   - Review with Finance Controller

5. **Day 5: Financial Statements**
   - Generate P&L (GL > Reports > Income Statement)
   - Generate Balance Sheet (GL > Reports > Balance Sheet)
   - Generate Cash Flow (GL > Reports > Cash Flow)
   - Export to PDF for distribution

6. **Period Close**
   - Final review and approval (Finance Controller)
   - Lock period (GL > Period Control > Close Period)
   - Archive reports
   - Distribute to stakeholders

---

## Vendor Management

### Vendor Master Data

**Adding New Vendor**:

1. **Navigate**: AP > Vendor Master > New Vendor

2. **Required Information**:
   - Legal name
   - Tax Identification Number (TIN)
   - BIR registration documents
   - Business registration (SEC/DTI)
   - Address and contact details
   - Payment terms (default Net 30)
   - Banking information:
     - Bank name and branch
     - Account number
     - Account type (checking/savings)

3. **Vendor Categorization**:
   - Vendor type (goods, services, professional, etc.)
   - Industry classification
   - Spend category
   - Strategic importance (critical, preferred, standard)

4. **Tax Configuration**:
   - VAT registration status
   - Withholding tax rate (per BIR schedule)
   - Tax exemptions (if any)

5. **Approval and Activation**:
   - Procurement review
   - Finance Controller approval
   - Vendor activated in system

**Onboarding Timeline**: 5-7 business days

---

### Vendor Information Updates

**Bank Account Changes** (Security Protocol):

1. Vendor submits request on company letterhead
2. AP team verifies:
   - Call known vendor contact (not from email)
   - Request bank verification letter
   - Finance Controller approval required
3. Update in ERP with full audit trail
4. Test payment before large amounts

**Why**: Prevents email compromise and fraud attempts

---

## Reporting and Analytics

### Standard Financial Reports

**Available in ERP**:

| Report | Module | Frequency | Access |
|--------|--------|-----------|--------|
| **Trial Balance** | GL | Monthly, on-demand | Accounting, Finance |
| **Income Statement (P&L)** | GL | Monthly | All managers |
| **Balance Sheet** | GL | Monthly | Accounting, Finance |
| **Cash Flow Statement** | GL | Monthly | Finance, Executive |
| **AP Aging** | AP | Weekly | AP team, Finance |
| **AR Aging** | AR | Weekly | AR team, Finance |
| **Budget vs. Actual** | GL + Clarity | Monthly | Budget owners |
| **Vendor Spend Analysis** | AP | Quarterly | Procurement, Finance |
| **Fixed Asset Register** | FA | Monthly | Accounting |

---

### Custom Report Creation

**For Power Users**:

1. Navigate to: Reports > Report Designer
2. Select data source (GL, AP, AR, FA)
3. Drag and drop fields
4. Apply filters and sorting
5. Format report layout
6. Save as personal or shared report
7. Schedule automatic distribution

**Training Required**: Contact erp-support@company.com

---

### Data Export

**Export Options**:
- Excel (.xlsx)
- PDF
- CSV
- XML (for integrations)

**Large Data Exports**:
- Scheduled during off-hours
- Email notification when ready
- Available for 7 days

---

## Integration with Other Systems

### Clarity PPM Integration

**Daily Synchronization** (Automated):
- **From ERP to Clarity**:
  - Actual expenses (GL postings)
  - Invoice payments
  - Budget balances
- **From Clarity to ERP**:
  - Budget codes and allocations
  - Project codes
  - Cost center structure

**Reconciliation**:
- Automated daily reconciliation job
- Discrepancy report if variance >₱5,000
- Finance team investigates and resolves

---

### ServiceNow Integration

**Real-Time Integration**:
- **Purchase Requests**:
  - Approved PRs → Generate PO in ERP
  - PO number sent back to ServiceNow
  - Status updates synchronized

- **Expense Reports**:
  - Approved expenses → GL posting in ERP
  - Payment status updated in ServiceNow
  - Employee notified of payment

---

### Banking Integration

**Bank Feed Connections**:
- Daily bank statement import
- Automatic transaction matching
- Unmatched items flagged for review
- Bank reconciliation efficiency

**Payment File Transmission**:
- Secure SFTP to bank
- Electronic confirmation received
- Payment status updated automatically

---

## Security and Controls

### User Access Control

**Role-Based Access**:
- Segregation of duties enforced
- Create ≠ Approve ≠ Execute
- Transaction limits per role

**Audit Trail**:
- All transactions logged
- User ID, date/time stamp
- Before/after values (for changes)
- Cannot be deleted or altered

---

### Data Backup and Recovery

**Backup Schedule**:
- **Daily**: Incremental backup (11 PM)
- **Weekly**: Full backup (Sunday 12 AM)
- **Monthly**: Archive (first Sunday)

**Retention**: 7 years (Philippines requirement)

**Disaster Recovery**:
- RTO (Recovery Time Objective): 4 hours
- RPO (Recovery Point Objective): 24 hours
- Tested quarterly

---

## Common Tasks

### Task 1: Look Up Vendor Invoice Status

**Steps**:
1. Navigate to: AP > Invoice Inquiry
2. Search by:
   - Vendor name
   - Invoice number
   - Date range
3. View current status:
   - Pending approval
   - Approved for payment
   - Payment scheduled (date shown)
   - Paid (payment date and method)
4. Drill down for full details

**Time**: 2 minutes

---

### Task 2: Run AR Aging Report

**Steps**:
1. Navigate to: AR > Reports > Aging Report
2. Select aging buckets (Current, 30, 60, 90+)
3. Filter by customer (if needed)
4. Run report
5. Review totals and overdue accounts
6. Export to Excel for collection calls

**Time**: 5 minutes

---

### Task 3: Post Journal Entry

**Steps**:
1. Navigate to: GL > Journal Entry > New Entry
2. Enter header:
   - Posting date
   - Period
   - Description
   - Reference number
3. Add line items:
   - Debit account and amount
   - Credit account and amount
   - Department/cost center
   - Description
4. Verify: Total debits = Total credits
5. Attach supporting documentation
6. Save and submit for approval

**Approval**: Senior Accountant or Accounting Manager

**Time**: 10-15 minutes

---

## Troubleshooting

### Issue: Transaction Won't Post

**Common Causes**:
- Period is closed → Request period re-open from controller
- Account is inactive → Check chart of accounts
- Budget insufficient → Request budget reallocation
- Approval missing → Check workflow status

---

### Issue: Bank Reconciliation Not Balancing

**Steps**:
1. Verify bank statement completeness
2. Check for uncleared items (deposits in transit, outstanding checks)
3. Review for bank fees or interest not recorded
4. Look for duplicate entries
5. Compare last month's reconciliation ending balance

**Escalate to**: Senior Accountant if unresolved after 30 minutes

---

### Issue: Vendor Payment Delayed

**Check**:
1. Invoice approval status
2. Payment batch inclusion
3. Bank file transmission success
4. Vendor bank details correct

**Contact**: ap@company.com with invoice number

---

## Best Practices

✅ **Do**:
- Enter transactions promptly (same day)
- Attach supporting documentation
- Use correct GL codes and cost centers
- Verify amounts before posting
- Follow approval workflows
- Keep vendor master data updated
- Run reports during off-peak hours

❌ **Don't**:
- Share login credentials
- Bypass approvals
- Post to closed periods without authorization
- Delete transactions (reverse/correct instead)
- Modify system configuration
- Override system controls without approval

---

## Training and Support

### Getting Help

**Support Channels**:
- **Email**: erp-support@company.com
- **Phone**: Extension 5100 (M-F, 9 AM - 5 PM)
- **ServiceNow**: Submit "ERP System Support" ticket
- **Office Hours**: Finance team (Fridays 2-4 PM)

### Training Resources

**New User Training**:
- Role-specific training (4 hours)
- Hands-on practice environment
- Certification required before live access

**Ongoing Training**:
- Monthly "Lunch & Learn" sessions
- New feature training (quarterly)
- Best practices workshops

**Documentation**:
- ERP Help Center (in-system help)
- Video library (company learning portal)
- Quick reference guides (downloadable)

---

## System Information

**Platform**: SAP Business One / Oracle NetSuite
**Version**: Current release
**Hosting**: Cloud-based (99.9% uptime SLA)
**Maintenance Window**: Saturdays 12 AM - 4 AM
**Support Hours**: Monday-Friday, 9 AM - 5 PM
**Emergency Support**: Available 24/7 for critical issues

---

## Related Documentation

- [Invoice Processing Workflow](/docs/finance/workflows/invoice-processing)
- [Month-End Close Workflow](/docs/finance/workflows/month-end-close)
- [Clarity PPM Guide](/docs/finance/systems/clarity-ppm)
- [ServiceNow Guide](/docs/finance/systems/servicenow)
- [Procurement Policy](/docs/finance/policies/procurement-policy)

---

**Contact**: erp-support@company.com | Extension 5100
**Finance Team**: Maintaining the financial backbone of the organization.
