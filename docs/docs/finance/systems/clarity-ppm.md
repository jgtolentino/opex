---
id: clarity-ppm
title: Clarity PPM System Guide
sidebar_label: Clarity PPM
description: User guide for Clarity PPM budget management and project portfolio system
tags:
  - finance
  - systems
  - clarity
  - budget
  - ppm
---

# Clarity PPM System Guide

## Overview

Clarity PPM (Project & Portfolio Management) is the company's budget management, project tracking, and resource planning system. This guide covers common finance-related tasks and workflows.

**System Owner**: Finance Team
**Support**: Extension 5100 or clarity-support@company.com
**Access**: All budget owners and project managers

---

## System Access

### Getting Access

**Who Gets Access**:
- All managers with budget responsibility
- Project managers
- Finance team
- Department heads
- Executive team

**Request Access**:
1. Submit ServiceNow request: "Clarity PPM Access"
2. Manager approval required
3. Specify role needed:
   - **Budget Owner**: View and manage assigned budgets
   - **Project Manager**: Project creation and tracking
   - **Finance User**: Full financial reporting access
   - **Executive**: Read-only dashboard access

**Provisioning Time**: 1-2 business days

---

### Login and Navigation

**URL**: https://clarity.company.com (VPN required if remote)

**Login Credentials**:
- Use company Active Directory credentials
- SSO enabled
- 2FA required

**Home Dashboard**:
- My Projects
- My Budgets
- Pending Approvals
- Recent Activity
- Key Metrics (if configured)

---

## Budget Management

### Understanding Budget Structure

**Hierarchy**:
```
Company Budget
└── Division Budget
    └── Department Budget
        └── Cost Center Budget
            └── GL Account Budget
```

**Budget Periods**:
- Fiscal Year (January - December)
- Quarterly (Q1, Q2, Q3, Q4)
- Monthly (rolling 12 months)

---

### Viewing Your Budget

**Navigate to Budget View**:
1. Home > Budgets > My Budgets
2. Select budget period (Current Year default)
3. Filter by department or cost center

**Budget Display**:

| Column | Description |
|--------|-------------|
| **Budget Code** | Unique identifier (e.g., DEPT-SALES-2025-001) |
| **Description** | Budget line description |
| **Original Budget** | Approved annual budget |
| **Revised Budget** | Adjusted after reallocations |
| **Actuals YTD** | Actual spending year-to-date |
| **Committed** | POs issued but not yet invoiced |
| **Available** | Remaining budget (Revised - Actuals - Committed) |
| **% Used** | (Actuals + Committed) / Revised Budget |

**Color Coding**:
- 🟢 Green: <75% budget used
- 🟡 Yellow: 75-90% budget used
- 🔴 Red: >90% budget used or over budget

---

### Checking Budget Availability

**Before Submitting Purchase Request**:

1. Navigate to: Budgets > Budget Inquiry
2. Enter budget code (from dropdown or search)
3. View "Available Balance"
4. Verify sufficient balance for your purchase
5. Note budget code for purchase request

**Insufficient Budget**:
- Contact your manager
- Request budget reallocation
- Defer purchase to next period
- Seek exception approval

---

### Budget Reporting

**Standard Reports**:

| Report Name | Description | Frequency |
|------------|-------------|-----------|
| **Budget vs. Actual** | Variance analysis by department | Monthly |
| **Budget Utilization** | Spending rate and forecast | Monthly |
| **Commitment Report** | Outstanding POs and obligations | Weekly |
| **Available Budget** | Real-time availability | On-demand |
| **Budget Transfer Log** | Reallocation history | On-demand |

**Accessing Reports**:
1. Reports > Financial Reports
2. Select report category
3. Set parameters (date range, department)
4. Run report
5. Export options: Excel, PDF, CSV

---

## Project Management (Finance View)

### Project Budget Tracking

**Viewing Project Financials**:
1. Home > Projects > My Projects
2. Select project name
3. Navigate to "Financials" tab

**Financial Metrics Displayed**:
- Project Budget (approved)
- Actual Costs (labor + expenses)
- Committed Costs (POs, contracts)
- Forecast to Complete
- Budget Variance
- Burn Rate

**Project Financial Health**:
- **On Budget**: Variance <5%
- **At Risk**: Variance 5-10%
- **Over Budget**: Variance >10%

---

### Time and Expense Allocation

**Charging Time to Projects**:
1. Navigate to: Timesheets > New Timesheet
2. Select project code
3. Enter hours by day
4. Add task/activity (if applicable)
5. Submit for manager approval

**Charging Expenses to Projects**:
1. Submit expense report in ServiceNow
2. Select project code from dropdown
3. Allocate expense amount to project
4. Expense automatically updates project actuals

**Note**: Project codes appear only if you're assigned as project team member

---

## Budget Requests and Planning

### Annual Budget Submission

**Timeline**: September (for following year)

**Process**:
1. Navigate to: Planning > Budget Request
2. Create new budget request
3. Select cost center and period
4. Enter budget by GL account category:
   - Salaries and wages
   - Benefits
   - Travel and entertainment
   - Professional services
   - Technology
   - Office expenses
   - Other
5. Provide justification for each major line
6. Add headcount assumptions
7. Submit to manager

**Budget Review**:
- Manager review and feedback
- Finance consolidation
- Executive review
- Board approval
- Final budget loaded in January

---

### Mid-Year Budget Reallocation

**When to Request**:
- Shifting business priorities
- Unexpected expenses
- Under-utilized budget available
- Cross-departmental needs

**Process**:
1. Navigate to: Budgets > Budget Transfer Request
2. Complete form:
   - **From**: Source budget code
   - **To**: Destination budget code
   - **Amount**: Transfer amount
   - **Justification**: Detailed explanation
3. Submit for approval

**Approval Routing** (based on amount):
- <₱50K: Budget owner
- ₱50K-₱250K: Department head
- >₱250K: Finance Controller

**Processing Time**: 3-5 business days

---

## Integration with Other Systems

### ServiceNow Integration

**Purchase Requests**:
- Budget codes pulled from Clarity
- Real-time budget availability check
- Automatic commitment update

**Expense Reports**:
- Budget codes validated
- Project codes verified
- Automatic actual cost update

---

### ERP Integration

**Daily Synchronization**:
- Actual expenses posted to Clarity
- Invoice payments recorded
- GL account balances updated

**Reconciliation**:
- Monthly automated reconciliation
- Variance investigation if >₱5,000
- Finance team resolves discrepancies

---

## Common Tasks and Procedures

### Task 1: Find Budget Code for Purchase Request

**Steps**:
1. Budgets > Budget Lookup
2. Search by:
   - Department name
   - GL account category
   - Description keyword
3. Note budget code (format: DEPT-CATEGORY-YEAR-###)
4. Verify "Available Balance" sufficient
5. Copy budget code to purchase request

**Time**: 2 minutes

---

### Task 2: Review Monthly Budget Variance

**Steps**:
1. Reports > Budget vs. Actual Report
2. Filter: Your department, Current month
3. Run report
4. Review variances >10% or >₱10,000
5. Prepare variance explanations:
   - Timing differences
   - Volume changes
   - Rate changes
   - One-time items
6. Submit explanations to manager

**Time**: 15-30 minutes (monthly)

---

### Task 3: Track Project Spending

**Steps**:
1. Projects > Project Financial Dashboard
2. Select your project
3. Review:
   - Actual vs. Budget
   - Burn rate (weekly/monthly)
   - Forecast to complete
4. Identify risks or over-runs
5. Take corrective actions:
   - Reduce scope
   - Request additional budget
   - Reallocate resources

**Time**: 10 minutes (weekly)

---

### Task 4: Submit Budget Forecast Update

**Steps**:
1. Navigate to: Planning > Forecast Update
2. Select budget period (Q2, Q3, Q4)
3. Update forecast by GL account:
   - Review actuals year-to-date
   - Adjust forecast for remainder
   - Provide assumption notes
4. Save and submit
5. Review consolidated forecast

**Frequency**: Quarterly (required) or on-demand

**Time**: 30-60 minutes (quarterly)

---

## Reporting and Analytics

### Dashboard Customization

**Create Personal Dashboard**:
1. Home > Customize Dashboard
2. Add portlets:
   - My Budget Summary
   - Top Spending Categories
   - Budget Variance Alerts
   - Project Financial Health
3. Arrange layout
4. Save as default

---

### Key Performance Indicators (KPIs)

**Budget KPIs Tracked**:
- Budget utilization rate
- Variance to budget (%)
- Forecast accuracy
- Commitment coverage
- Spending velocity

**Project KPIs Tracked**:
- Budget variance
- Schedule performance index (SPI)
- Cost performance index (CPI)
- Earned value metrics

---

## Troubleshooting

### Issue: Budget Code Not Found

**Solution**:
- Verify budget code format (check with finance)
- Ensure budget period correct (current year)
- Contact finance if code should exist

---

### Issue: Budget Shows Zero Available

**Possible Causes**:
1. Budget fully utilized
2. Large PO committed balance
3. Budget reallocation pending
4. Data synchronization delay

**Actions**:
- Review actuals and commitments
- Check for pending transfers
- Request budget reallocation
- Contact finance support

---

### Issue: Project Code Not Appearing

**Solution**:
- Verify you're assigned to project team
- Check project is active status
- Request project manager add you
- Contact PMO office

---

### Issue: Data Discrepancy Between Clarity and ERP

**Solution**:
- Check last sync date/time (bottom of screen)
- Allow 24 hours for synchronization
- If >24 hours, contact finance support
- Do not duplicate transactions

---

## Training and Support

### Getting Help

**Self-Service Resources**:
- In-app help (? icon)
- User guides: Clarity PPM Help Center
- Video tutorials: Company learning portal

**Support Channels**:
- **Email**: clarity-support@company.com
- **Phone**: Extension 5100
- **ServiceNow**: Submit "Clarity PPM Support" ticket
- **Office Hours**: Finance team (Thursdays 2-4 PM)

---

### Training Sessions

**New User Training**:
- Monthly group sessions
- 2 hours, hands-on
- Registration: clarity-training@company.com

**Advanced Topics**:
- Budget planning and forecasting
- Project financial management
- Custom reporting
- Quarterly sessions

---

## Best Practices

✅ **Do**:
- Check budget availability before committing
- Review budget monthly
- Keep project codes accurate
- Submit timesheets promptly
- Document budget assumptions

❌ **Don't**:
- Share login credentials
- Commit funds without budget
- Ignore variance alerts
- Wait until year-end for forecasts
- Bypass approval workflows

---

## Related Documentation

- [Budget Approval Policy](/docs/finance/policies/budget-approval)
- [Purchase Request Workflow](/docs/finance/workflows/purchase-request)
- [ServiceNow User Guide](/docs/finance/systems/servicenow)
- [Month-End Close Workflow](/docs/finance/workflows/month-end-close)

---

## System Information

**Version**: Clarity 16.1.2
**Last Updated**: January 2025
**Maintenance Window**: Saturdays 2-6 AM (system unavailable)
**Uptime SLA**: 99.5%

---

**Contact**: clarity-support@company.com | Extension 5100
**Finance Team**: Enabling data-driven budget and project decisions.
