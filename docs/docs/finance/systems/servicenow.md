---
id: servicenow
title: ServiceNow Finance Workflows Guide
sidebar_label: ServiceNow
description: User guide for finance-related ServiceNow workflows and request management
tags:
  - finance
  - systems
  - servicenow
  - workflows
---

# ServiceNow Finance Workflows Guide

## Overview

ServiceNow is the company's request management and workflow automation platform. This guide covers finance-related processes including purchase requests, expense reports, and invoice approvals.

**System Owner**: IT Operations
**Finance Support**: finance@company.com
**General Support**: Extension 5200 or servicedesk@company.com
**Access**: All employees

---

## System Access

### Accessing ServiceNow

**URL**: https://companyname.service-now.com

**Login**:
- Company Active Directory credentials (SSO)
- 2FA required for external access
- Mobile app available (iOS, Android)

**Initial Setup**:
1. Complete user profile (on first login)
2. Set notification preferences
3. Configure mobile app (optional)

---

## Purchase Request Workflow

### Submitting a Purchase Request

**Navigate**:
Home > Requests > Create New > Purchase Request

**Required Information**:

| Field | Description | Example |
|-------|-------------|---------|
| **Item/Service** | Detailed description | "Dell Laptop XPS 15" |
| **Quantity** | Number of units | 2 |
| **Unit Price** | Cost per unit (₱) | ₱65,000 |
| **Total Cost** | Auto-calculated | ₱130,000 |
| **Budget Code** | From Clarity PPM | DEPT-IT-2025-012 |
| **Vendor** | Preferred supplier | Dell Philippines |
| **Justification** | Business need | "Developer laptops for new hires" |
| **Delivery Date** | When needed | "2025-02-15" |
| **Attachments** | Quotes, specs | vendor-quote.pdf |

**Step-by-Step**:

1. **Initiate Request**
   - Click "New Purchase Request"
   - Fill required fields (marked with *)
   - Attach vendor quotes (≥3 for >₱50K)

2. **Select Budget Code**
   - Click "Budget Code" lookup
   - Search by department or category
   - Verify available balance shown
   - System checks budget availability

3. **Add Vendor Information**
   - Search approved vendor list
   - If new vendor: Click "Request New Vendor"
   - Enter vendor contact details
   - Attach vendor onboarding documents

4. **Review and Submit**
   - Preview summary
   - Check for errors or missing info
   - Click "Submit for Approval"
   - Note request number (e.g., PREQ0012345)

**Auto-Validations**:
- ✓ Budget code exists and active
- ✓ Sufficient budget available
- ✓ Required fields completed
- ✓ Vendor in approved list (or flagged)
- ✓ Quotes attached per policy

**Submission Confirmation**:
- Email confirmation sent
- Request number assigned
- Estimated approval date provided

**Processing Time**: See approval matrix in [Purchase Request Workflow](/docs/finance/workflows/purchase-request)

---

### Tracking Purchase Request Status

**Check Status**:
1. Home > My Requests > Purchase Requests
2. View status column:
   - **Draft**: Not yet submitted
   - **Pending Manager Approval**: With your manager
   - **Pending Finance Approval**: With finance team
   - **Pending Procurement**: Awaiting PO issuance
   - **PO Issued**: Purchase order sent to vendor
   - **Delivered**: Goods/services received
   - **Closed**: Process complete

**Status Details**:
- Click request number for full details
- View approval chain and current step
- See comments from approvers
- Track estimated completion date

**Email Notifications**:
- Approval/rejection decision
- Request for additional information
- PO number issued
- Delivery confirmation reminder

---

### Modifying or Cancelling a Request

**Modify Draft Request**:
- Open request (if status = Draft)
- Click "Edit"
- Make changes
- Re-submit

**Modify Submitted Request**:
- Cannot edit directly
- Add comment with changes needed
- Approver may:
  - Send back for revision
  - Approve with noted changes
  - Reject and request resubmission

**Cancel Request**:
1. Open request
2. Click "Actions" > "Cancel Request"
3. Provide cancellation reason
4. If already approved: Requires finance approval to cancel

---

## Expense Reimbursement Workflow

### Submitting an Expense Report

**Navigate**:
Home > Requests > Create New > Expense Reimbursement

**Expense Report Structure**:
- Header: Trip/period details
- Line Items: Individual expenses
- Attachments: Receipts and supporting docs

---

### Creating Expense Line Items

**Add Expense**:
1. Click "+ Add Expense Line"
2. Complete fields for each expense:

| Field | Description | Required |
|-------|-------------|----------|
| **Date** | Expense date | Yes |
| **Category** | Expense type (dropdown) | Yes |
| **Description** | Specific details | Yes |
| **Amount** | Total in ₱ or foreign currency | Yes |
| **Payment Method** | Personal card, cash, corporate card | Yes |
| **Project Code** | If project-related | If applicable |
| **Receipt** | Upload image/PDF | If >₱500 |

**Expense Categories**:
- Meals (Local Business)
- Meals (Client Entertainment)
- Transportation (Taxi/Ride-hailing)
- Transportation (Personal Vehicle)
- Accommodation
- Airfare
- Conference/Training Fees
- Office Supplies
- Communication (Phone/Internet)
- Other (with description)

**Foreign Currency Expenses**:
- Enter amount in original currency
- System auto-converts using BSP rate
- Rate displayed for verification
- Attach currency receipt

**Repeat Expenses**:
- Use "Duplicate" button
- Useful for daily per diem or recurring costs

---

### Attaching Receipts

**Receipt Upload**:
1. Click "Attach Receipt" for each line item
2. Supported formats: JPG, PNG, PDF
3. Max file size: 10MB per file
4. Take clear photos:
   - All corners visible
   - Text readable
   - No glare or shadows

**Receipt Quality Checklist**:
- ✓ Vendor name clear
- ✓ Date visible
- ✓ Amount matches entry
- ✓ Itemization shown (for meals)
- ✓ Tax details (VAT/WHT) visible

**Missing Receipt**:
1. Select "Missing Receipt" checkbox
2. Upload "Missing Receipt Affidavit" (template from finance)
3. Attach alternative proof (credit card statement, email confirmation)
4. Note: Limited to 3 per calendar year

---

### Entertainment Expense Special Requirements

**For Client Entertainment** (meals, events):
1. Complete expense line
2. Click "Add Entertainment Details"
3. Fill required fields:
   - Attendee names and companies
   - Business purpose
   - Expected outcome
   - Pre-approval reference (if applicable)

**Alcohol Expenses**:
- Must be part of entertainment
- Automatic flag for manager review
- May require additional approval

---

### Submitting Expense Report

**Before Submission**:
- ✓ All receipts attached (or affidavits)
- ✓ Categories correct
- ✓ Amounts verified
- ✓ Project codes added (if applicable)
- ✓ Entertainment details complete

**Submit**:
1. Review summary totals
2. Check policy compliance indicators
3. Add overall trip summary (optional but helpful)
4. Click "Submit for Approval"
5. Receive confirmation email with report number

**Auto-Validation**:
- System checks policy compliance
- Flags over-limit expenses (soft warning)
- Requires manager override for flagged items
- Checks for duplicate submissions

---

### Tracking Expense Reimbursement Status

**Status Flow**:
1. **Submitted** → Manager review
2. **Manager Approved** → Finance AP review
3. **Finance Approved** → Payment processing
4. **Payment Scheduled** → In payment batch
5. **Paid** → Deposited to your account
6. **Closed** → Process complete

**Expected Timeline**:
- Manager approval: 3 business days
- Finance review: 3-5 business days
- Payment processing: 5-7 business days
- **Total**: 10-15 business days from submission

**Payment Notification**:
- Email when payment processed
- Payment date and amount
- Bank account (last 4 digits)
- Check deposit confirmation

---

## Invoice Approval Workflow

### For Budget Owners (Non-PO Invoices)

**When You Receive an Invoice Approval Request**:
- Email notification from ServiceNow
- Invoice attached for review
- Budget impact shown

**Approval Task**:
1. Click link in email notification
2. Review invoice details:
   - Vendor name and amount
   - Services/goods description
   - Your budget code
   - Available budget balance
3. Verify:
   - Services actually received?
   - Amount reasonable and expected?
   - Correct budget code?
4. Make decision:
   - **Approve**: Invoice proceeds to payment
   - **Reject**: Invoice returned to vendor
   - **Request Info**: Send back to requestor

**Approval Time Limit**: 5 business days
**Escalation**: If no action, escalates to Department Head

---

## Common ServiceNow Tasks

### Task 1: Check Request Status

**Quick Check**:
1. Home > My Requests
2. View recent requests
3. Filter by status or date
4. Click for details

**Advanced Search**:
1. Requests > Advanced Search
2. Filter criteria:
   - Request type
   - Date range
   - Status
   - Amount range
3. Export results if needed

---

### Task 2: Respond to Approver Questions

**When Approver Requests Information**:
1. Email notification received
2. Click notification link
3. View approver's question/comment
4. Click "Add Comment"
5. Provide requested information
6. Attach additional docs if needed
7. Click "Submit Response"
8. Request returns to approval queue

**Response Time**: 2 business days (recommended)

---

### Task 3: Delegate Approvals

**Going on Leave/Vacation**:
1. Home > User Profile > Delegation Settings
2. Click "Add Delegation"
3. Select:
   - Delegate user (who will approve for you)
   - Start and end dates
   - Request types (Purchase, Expense, etc.)
4. Save
5. Delegate receives notification

**Delegation Limits**:
- Maximum 30 days
- Renewable if extended leave
- Automatic expiration

---

### Task 4: View Approval Queue

**For Managers/Approvers**:
1. Home > My Approvals
2. View pending items
3. Sort by:
   - Priority (urgent, high, normal)
   - Submission date (oldest first recommended)
   - Amount
4. Bulk actions:
   - Select multiple items
   - Approve all (if similar)
   - Export list

**SLA Indicators**:
- 🟢 Within SLA
- 🟡 Approaching SLA (1 day remaining)
- 🔴 Overdue SLA

---

## Mobile App Usage

### ServiceNow Mobile App

**Download**:
- iOS: App Store - "ServiceNow Mobile"
- Android: Google Play - "ServiceNow Mobile"

**Login**:
- Enter company instance URL
- Use company credentials (SSO)
- Enable biometric login (optional)

**Mobile Capabilities**:
- ✓ Submit expense reports (with camera receipt capture)
- ✓ Submit purchase requests
- ✓ Approve requests
- ✓ Check request status
- ✓ Respond to comments
- ✓ Receive push notifications

**Mobile-Specific Features**:
- **Receipt Capture**: Take photo directly in app
- **Voice Notes**: Add descriptions via voice
- **Location Services**: Auto-fill expense location
- **Offline Mode**: Draft expenses offline, submit when connected

---

## Notifications and Alerts

### Email Notifications

**You Receive Emails For**:
- New request submitted (confirmation)
- Request approved
- Request rejected (with reason)
- Additional information requested
- Payment processed
- Approval task assigned to you
- SLA approaching for your approvals

**Manage Notifications**:
1. Home > User Profile > Notification Preferences
2. Select which emails to receive
3. Set digest frequency (immediate, daily, weekly)
4. Save preferences

---

### In-App Notifications

**Notification Bell** (top right):
- Shows unread notifications
- Click to view details
- Mark as read
- Quick actions (approve, view, comment)

---

## Reporting and Analytics

### Personal Expense Reports

**View Your Expense History**:
1. Reports > My Expense Reports
2. Filter by date range
3. View totals by category
4. Export to Excel

**Tax Year Summary**:
- Annual reimbursement totals
- By expense category
- Useful for personal tax filing (if applicable)

---

### Purchase Request History

**View Purchase History**:
1. Reports > My Purchase Requests
2. Filter by status or date
3. See spending patterns
4. Export data

---

## Troubleshooting

### Issue: Cannot Find Budget Code

**Solution**:
1. Check Clarity PPM for correct code
2. Ensure budget code is active
3. Contact finance if code should exist
4. Use "Request Help" button in form

---

### Issue: Vendor Not in Approved List

**Solution**:
1. Click "Request New Vendor" in form
2. Complete vendor onboarding form
3. Procurement team will process (5-7 days)
4. You'll be notified when approved
5. Then complete your purchase request

---

### Issue: Receipt Upload Failing

**Solutions**:
- Check file size (<10MB)
- Use supported format (JPG, PNG, PDF)
- Check internet connection
- Try different browser
- Use mobile app as alternative
- Contact ServiceNow support if persists

---

### Issue: Request Stuck "Pending Approval"

**Actions**:
1. Check request details for current approver
2. Verify approver is not on leave
3. Send reminder via "Request Update" button
4. If >7 days, contact finance support
5. May need escalation to next level

---

## Best Practices

✅ **Do**:
- Submit requests promptly (within 60 days for expenses)
- Attach clear, legible receipts
- Provide detailed descriptions
- Check budget availability before submitting
- Respond quickly to approver questions
- Keep request numbers for reference

❌ **Don't**:
- Submit duplicate requests
- Bypass approval workflows
- Upload personal/unrelated documents
- Share login credentials
- Ignore policy violations (will be rejected anyway)

---

## Training and Support

### Getting Help

**In-System Help**:
- Click "?" icon (top right)
- Context-sensitive help topics
- Video tutorials
- FAQs

**Live Support**:
- **Chat**: Click chat icon (M-F 9AM-5PM)
- **Email**: servicedesk@company.com
- **Phone**: Extension 5200
- **ServiceNow Ticket**: Submit "General IT Support" request

### Training Resources

**New User Onboarding**:
- Monthly group training sessions
- 1-hour, hands-on
- Register: training@company.com

**Video Library**:
- "How to Submit a Purchase Request" (5 min)
- "Expense Report Walkthrough" (8 min)
- "Approving Requests" (4 min)
- Access: Learning Portal > ServiceNow

---

## Integration with Finance Systems

### Clarity PPM

**Real-Time Integration**:
- Budget codes pulled from Clarity
- Budget availability checked instantly
- Commitments updated upon approval
- Actuals posted upon payment

---

### ERP System

**Daily Synchronization**:
- Approved purchase requests → PO generation
- Paid expenses → GL posting
- Payment status updates
- Vendor invoice matching

---

## Related Documentation

- [Purchase Request Workflow](/docs/finance/workflows/purchase-request)
- [Expense Reimbursement Workflow](/docs/finance/workflows/expense-reimbursement)
- [Invoice Processing Workflow](/docs/finance/workflows/invoice-processing)
- [Clarity PPM Guide](/docs/finance/systems/clarity-ppm)
- [ERP Integration Guide](/docs/finance/systems/erp-integration)

---

## System Information

**Platform**: ServiceNow (Orlando release)
**Uptime SLA**: 99.9%
**Maintenance Window**: Sundays 2-6 AM
**Last Updated**: January 2025

---

**Contact**: servicedesk@company.com | Extension 5200
**Finance Support**: finance@company.com | Extension 5100

---

**IT & Finance Teams**: Enabling efficient, digital financial workflows.
