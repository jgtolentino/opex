---
id: invoice-processing-policy
title: Invoice Processing and Payment Policy
sidebar_label: Invoice Processing
description: Official policy governing vendor invoice processing and payment procedures
tags:
  - finance
  - policy
  - invoice
  - accounts-payable
  - compliance
jurisdiction: "PH"
entity: "insightpulseai"
version: "v1.1"
effective_date: "2025-01-01"
policy_owner: "CFO"
---

# Invoice Processing and Payment Policy

## Policy Statement

This policy establishes standard procedures for processing vendor invoices and making payments to ensure accurate recording, timely payment, fraud prevention, and compliance with tax regulations and internal controls.

**Policy Number**: FIN-004
**Effective Date**: January 1, 2025
**Last Reviewed**: January 15, 2025
**Policy Owner**: Chief Financial Officer
**Approval Authority**: CEO

---

## Scope

This policy applies to:
- All vendor invoices for goods and services
- All payment types (bank transfer, check, wire)
- Accounts Payable team and approvers
- All budget owners and department heads
- All vendors and suppliers

---

## Invoice Submission Requirements

### Vendor Requirements

**Valid Invoice Must Include**:
1. Vendor legal name and TIN
2. BIR-registered invoice/receipt
3. Invoice number (unique)
4. Invoice date
5. Itemized description of goods/services
6. Quantity and unit price
7. Subtotal, taxes (VAT, WHT), and total
8. Payment terms
9. Bank account details
10. Purchase Order reference (if applicable)

---

### Invoice Submission Channels

| Channel | Format | Processing Time |
|---------|--------|----------------|
| **Email** (preferred) | PDF to ap@company.com | 1-2 business days |
| **Vendor Portal** | Upload to ERP system | Real-time |
| **Physical Mail** | Original to AP office | 3-4 business days (scanning delay) |
| **EDI/API** | Automated integration | Real-time |

**Note**: PDF invoices preferred; physical invoices will be scanned and processed electronically

---

## Invoice Processing Workflow

See detailed workflow: [Invoice Processing Workflow](/docs/finance/workflows/invoice-processing)

### Step 1: Invoice Receipt and Registration

**Responsible**: AP Clerk

**Actions**:
1. Receive invoice via approved channel
2. OCR scan for data extraction (automated)
3. Validate completeness and BIR compliance
4. Check for duplicate invoice
5. Register in ERP with unique tracking number
6. Classify as PO-based or Non-PO

**Duplicate Check**:
- Same vendor + same invoice number
- Same vendor + same amount + similar date (±7 days)

**Rejection Reasons**:
- Missing required information
- Non-BIR registered receipt
- Duplicate invoice
- Vendor not in system

**SLA**: Same business day (if received before 3 PM)

---

### Step 2: 3-Way Match (PO-Based Invoices)

**Responsible**: ERP System (automated) + AP Analyst (exceptions)

**Matching Components**:
1. Purchase Order
2. Goods Receipt/Service Confirmation
3. Invoice

**Tolerance Thresholds**:

| Item | Acceptable Variance | Action if Exceeded |
|------|-------------------|-------------------|
| **Price** | ±2% or ₱1,000 | AP review |
| **Quantity** | ±5% or 10 units | AP review |
| **Tax** | 0% (exact) | Auto-correction or reject |
| **Total** | ₱500 | AP review |

**Automated Approval** (if perfect match):
- Invoice amount <₱10,000
- All line items match within tolerance
- Vendor in good standing

**Manual Review Required**:
- Any variance exceeds tolerance
- First invoice from new vendor
- Invoice amount >₱10,000

---

### Step 3: Budget Owner Approval (Non-PO Invoices)

**Responsible**: Cost Center Owner

**Review Criteria**:
1. Services/goods actually received
2. Pricing reasonable and expected
3. Proper GL account coding
4. Budget availability confirmed

**Approval Timeframe**: 5 business days

**Escalation**: If no response in 7 days, escalate to Department Head

---

### Step 4: Variance Resolution

**Responsible**: AP Analyst

**Common Variances**:
- Price changes (negotiated discounts, market adjustments)
- Partial deliveries
- Freight/handling charges
- Currency fluctuations (international)
- Tax calculation errors

**Resolution Process**:
1. Investigate variance root cause
2. Contact vendor if needed
3. Consult requester/budget owner
4. Document resolution
5. Adjust invoice or request credit memo

**SLA**: 3 business days

---

### Step 5: Finance Controller Approval (High-Value)

**Triggers**:
- Invoice amount ≥₱100,000
- New vendor (first 3 invoices)
- Unusual or exceptional charges
- Budget owner flagged for additional review

**Review Focus**:
- Budget impact
- Contract compliance
- Payment terms reasonableness
- Tax treatment
- Cash flow implications

**SLA**: 2 business days

---

## Payment Terms and Scheduling

### Standard Payment Terms

| Vendor Type | Payment Terms | Notes |
|------------|--------------|-------|
| **Local Suppliers** | Net 30 | From invoice date |
| **International Suppliers** | Net 45 | Allows for wire transfer delays |
| **Utilities/Services** | Net 15 | Per due date on bill |
| **Government Agencies** | Upon receipt | Tax remittances, fees |
| **Employees** | 7-10 days | Expense reimbursements |

**Early Payment Discounts**:
- Automatically taken if ≥2% discount
- Example: 2/10 Net 30 (2% discount if paid within 10 days)
- Finance Controller approval for exceptions

---

### Payment Batch Schedule

| Batch | Day | Cutoff | Payment Method |
|-------|-----|--------|---------------|
| **Batch A** | Tuesday | Monday 5 PM | Bank transfer |
| **Batch B** | Friday | Thursday 5 PM | Bank transfer |
| **Check Run** | Wednesday | Tuesday 12 PM | Physical check |
| **Urgent** | Daily | 2 PM same-day | Wire transfer (fees apply) |

**Processing Time**:
- Local bank transfer: 1-2 business days
- International wire: 3-5 business days
- Check: 5-7 business days (mail + clearing)

---

### Prioritization Rules

**Priority 1 (Urgent)**:
- Statutory payments (taxes, government fees)
- Payroll-related
- Critical suppliers (approved by CFO)
- Contractual penalties at risk

**Priority 2 (Standard)**:
- Early payment discounts
- Net 30 terms approaching due date
- Recurring services

**Priority 3 (Deferrable)**:
- Non-critical expenses
- Payment terms not yet due
- Vendor relationship allows flexibility

---

## Payment Methods

### Bank Transfer (Preferred)

**Advantages**:
- Fast, secure, traceable
- Lower cost
- Automated reconciliation

**Requirements**:
- Vendor bank details on file
- Account verification completed
- BIR withholding tax computed

---

### Check Payment

**When Used**:
- Vendor unable to accept bank transfer
- Government agencies requiring checks
- Small vendors (<₱10,000 annual)

**Process**:
- Check printing (Wednesday batch)
- Dual signature required (>₱50,000)
- Mail or pickup by vendor

---

### Wire Transfer

**When Used**:
- International payments
- Urgent payments (same-day)
- High-value payments (>₱1,000,000)

**Fees**: ₱500-2,000 (borne by company unless vendor agreement states otherwise)

**Approval**: Finance Controller required

---

## Tax Compliance

### Value-Added Tax (VAT)

**VAT-Registered Vendors**:
- 12% VAT on taxable sales
- Input VAT claimable by company
- VAT invoice required (BIR-registered)

**VAT-Exempt**:
- Government agencies
- Cooperative exemptions
- Zero-rated exports

---

### Withholding Tax (EWT)

**Mandatory Withholding**:

| Service Type | WHT Rate | BIR Form |
|-------------|---------|----------|
| **Professional Services** | 10% or 15% | 2307 |
| **Rental (Real Property)** | 5% | 2307 |
| **Rental (Personal Property)** | 3% | 2307 |
| **Management/Technical Services** | 10% | 2307 |
| **Goods** | 1% | 2307 |

**Compliance**:
- WHT certificate (BIR Form 2307) issued to vendor
- Monthly remittance to BIR
- Quarterly BIR filing (Form 1601-EQ)

---

### Final Withholding Tax

**Applicable To**:
- Interest income
- Royalties
- Dividends

**Rates**: Per BIR regulations (varies 15-30%)

---

## Internal Controls

### Segregation of Duties

**Required Separation**:

| Function | Role | Cannot Also Perform |
|----------|------|-------------------|
| Invoice Receipt | AP Clerk | Payment execution |
| Invoice Approval | Budget Owner | Invoice receipt, payment |
| Payment Preparation | AP Analyst | Payment approval |
| Payment Approval | Finance Controller | Payment preparation |
| Payment Execution | AP Manager | Invoice approval |

---

### Dual Approval Requirements

**Triggers**:
- Payment amount >₱100,000
- New vendor payment
- International wire transfer
- Batch total >₱1,000,000

**Approvers**: Any 2 of:
- Finance Controller
- AP Manager
- CFO

---

### Vendor Master Data Changes

**Restrictions**:
- Bank account changes require vendor letter on letterhead
- Verification call to known vendor contact
- Finance Controller approval
- Change logged and documented

**Fraud Prevention**: Protects against email spoofing and account takeover

---

## Vendor Communications

### Remittance Advice

**Sent Automatically**:
- Email to vendor finance contact
- PDF with payment details
- Invoices paid listed
- Withholding tax amount (if any)

**Timing**: Same day as payment execution

---

### Payment Status Inquiries

**Vendor Contact**:
- Email: ap@company.com
- Phone: Extension 5100
- Hours: Monday-Friday, 9 AM - 5 PM

**Information Provided**:
- Invoice receipt confirmation
- Current processing status
- Expected payment date
- Any issues or holds

---

### Disputed Invoices

**Process**:
1. AP team notifies vendor within 2 business days
2. Provide clear explanation of issue
3. Collaborative resolution
4. Timeline for resolution (10 business days target)

**Escalation**: AP Manager if unresolved after 15 days

---

## Exception Handling

### Urgent Payment Request

**Valid Reasons**:
- Contractual penalty avoidance
- Critical supplier relationship
- Service interruption risk
- Legal/regulatory requirement

**Process**:
1. AP Manager approval required
2. Justification documented
3. Expedited approval workflow (48 hours max)
4. Same-day payment if approved before 2 PM

---

### Payment Without PO

**Allowed For**:
- Utilities and recurring services
- Government fees and taxes
- Emergency repairs
- Professional services (with approved engagement letter)

**Requirements**:
- Budget owner approval mandatory
- Detailed justification
- Finance Controller approval if >₱50,000

---

### Prepayments and Advances

**Policy**: Generally discouraged

**Exceptions**:
- Required by vendor (deposit, advance)
- Custom manufacturing
- Long lead-time items
- Import duties and freight

**Limits**:
- Maximum 50% prepayment
- Maximum ₱500,000 without CFO approval
- Contract or PO required
- Offset against final invoice

---

## Reporting and Metrics

### KPIs Tracked

| Metric | Target | Frequency |
|--------|--------|-----------|
| **On-time payment rate** | >95% | Monthly |
| **Average processing time** | 10 days | Monthly |
| **Early payment discount capture** | >80% | Monthly |
| **Invoice errors/rejections** | <5% | Monthly |
| **Vendor inquiries** | <10 per month | Monthly |

---

### Monthly Reporting

**AP Aging Report**:
- Invoices by aging bucket (current, 30, 60, 90+ days)
- Total outstanding payables
- Trend analysis

**Cash Forecast**:
- Next 30/60/90 days payment projection
- Major payments highlighted
- Cash requirement planning

**Distribution**: CFO, Finance Controller, Treasury

---

## Audit and Compliance

### Internal Audit

**Quarterly Review**:
- Sample testing of 3-way match
- Approval compliance
- Duplicate payment check
- Vendor master data changes
- Segregation of duties compliance

---

### External Audit

**Annual Financial Audit**:
- AP balance confirmation
- Invoice sampling
- Cut-off testing
- Tax compliance review
- Internal control assessment

**Documentation Retention**: 7 years (Philippines requirement)

---

## Non-Compliance and Penalties

### Internal Non-Compliance

| Violation | Consequence |
|-----------|-------------|
| **Processing invoice without approval** | Written warning, retraining |
| **Duplicate payment** | Investigation, process review |
| **Unauthorized bank detail change** | Suspension, investigation |
| **Fraudulent activity** | Immediate termination, legal action |

---

### Vendor Non-Compliance

| Violation | Consequence |
|-----------|-------------|
| **Repeated incorrect invoices** | Vendor education, payment delays |
| **Non-BIR registered receipts** | Invoice rejection |
| **Fraud or misrepresentation** | Vendor suspension, legal action |

---

## Related Documentation

- [Invoice Processing Workflow](/docs/finance/workflows/invoice-processing)
- [Procurement Policy](/docs/finance/policies/procurement-policy)
- [ERP System Guide](/docs/finance/systems/erp-integration)
- [Vendor Onboarding Checklist](/docs/finance/templates/vendor-onboarding)

---

## Policy Review

**Review Frequency**: Annually
**Next Review**: January 2026
**Feedback**: ap@company.com

---

## Approval Signatures

| Role | Name | Signature | Date |
|------|------|-----------|------|
| AP Manager | | | |
| Finance Controller | | | |
| CFO | | | |

---

## Document Control

**Policy Number**: FIN-004
**Version**: 1.1
**Effective Date**: January 1, 2025
**Classification**: Internal Use
**Distribution**: All Employees

---

## Contact Information

**Accounts Payable**: ap@company.com
**Vendor Inquiries**: vendor-support@company.com
**Policy Questions**: finance@company.com
**System Support**: Extension 5100

---

**AP Team**: Ensuring accurate, timely, and compliant vendor payments.
