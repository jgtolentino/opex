---
id: employee-requisition
title: Employee Requisition Workflow
sidebar_label: Employee Requisition
description: Complete BPMN workflow for requesting and approving new employee positions
tags:
  - hr
  - workflow
  - hiring
  - approval
  - bpmn
---

# Employee Requisition Workflow

## Overview

The employee requisition workflow is a structured process for requesting, approving, and fulfilling new employee positions. This ensures proper budget approval, stakeholder alignment, and compliance with hiring policies.

**Target Audience**: Hiring Managers, Department Heads, HR Team, Finance Team, Executive Leadership

**Process Duration**: 5-10 business days (standard)

---

## Workflow Diagram

![Employee Requisition Process](/diagrams/hr/employee-requisition.svg)

*Figure 1: Complete employee requisition approval workflow*

> **Note**: Diagram source file available at `diagrams-src/hr/employee-requisition.drawio`

---

## BPMN Process Model

### Swimlanes (Actors)

| Lane | Role | Responsibilities |
|------|------|------------------|
| **Hiring Manager** | Initiator | Submits requisition, provides justification |
| **Department Head** | First Approver | Reviews business need and budget alignment |
| **HR Business Partner** | Policy Review | Validates compliance, refines job description |
| **Finance Controller** | Budget Validation | Confirms budget availability |
| **Executive Leadership** | Final Approval | Strategic alignment (conditional) |
| **HR Recruitment** | Fulfillment | Executes hiring process |

### System Integration Points

- **ServiceNow**: Requisition form submission and routing
- **Clarity PPM**: Budget verification and headcount tracking
- **HRIS (SAP SuccessFactors/Workday)**: Requisition activation and job posting

---

## Process Steps

### Step 1: Requisition Initiation

**Actor**: Hiring Manager

**Inputs**:
- Position title, level, department
- Business justification
- Budget code
- Proposed start date
- Draft job description

**Actions**:
1. Access requisition form in ServiceNow
2. Complete required fields (position details, justification)
3. Attach supporting documents (org chart, business case)
4. Submit for department head review

**Output**: Draft requisition → Status: "Pending Department Approval"

**Estimated Time**: 30-60 minutes

---

### Step 2: Department Head Review

**Actor**: Department Head

**Decision Criteria**:
- Budget availability
- Strategic alignment with department goals
- Priority vs. other open positions
- Organizational structure impact

**Actions**:
1. Review requisition details and justification
2. Validate against department headcount plan
3. Make approval decision:
   - **Approve** → Forward to HR review
   - **Reject** → Return with feedback
   - **Request Revision** → Send back for modifications

**Output**: Approved/Rejected requisition

**SLA**: 2 business days

---

### Step 3: HR Business Partner Review

**Actor**: HR Team

**Validation Checks**:
- Job description completeness
- Salary competitiveness (benchmark data)
- Role duplication check
- Diversity and inclusion considerations
- Hiring policy compliance

**Actions**:
1. Review and refine job description
2. Benchmark compensation against market data
3. Check for overlapping roles
4. Verify hiring process compliance
5. Make approval decision:
   - **Approve** → Forward to Finance
   - **Request Revision** → Send back for JD improvements
   - **Reject** → Escalate concerns

**Output**: HR-approved requisition

**SLA**: 2-3 business days

---

### Step 4: Finance Controller Validation

**Actor**: Finance Team

**Validation via Clarity PPM**:
- Budget code validity
- Remaining budget sufficiency
- Headcount plan alignment
- Hiring freeze status

**Decision Logic**:

| Condition | Result |
|-----------|--------|
| Budget confirmed + No freeze | **Approve** → Move to executive review (if needed) |
| Insufficient budget | **Reject** → Notify department head |
| Hiring freeze active | **Hold** → Place on waiting list |

**Output**: Financial approval/rejection

**SLA**: 1-2 business days

---

### Step 5: Executive Approval (Conditional)

**Actor**: CEO/CFO

**Triggers** (Any of the following):
- Position level: Director or above
- Salary range: &gt;$150,000
- New headcount (not replacement)
- Budget impact: &gt;5% of department budget

**Decision Criteria**:
- Strategic alignment with company goals
- ROI justification
- Organizational structure impact
- Market conditions and hiring climate

**Actions**:
1. Review executive summary
2. Assess strategic fit
3. Make final decision:
   - **Approve** → Requisition approved
   - **Reject** → Requisition cancelled
   - **Defer** → Request additional information

**Output**: Final approval decision

**SLA**: 3-5 business days

---

### Step 6: Requisition Fulfillment

**Actor**: HR Recruitment Team

**Actions**:
1. Create job posting from approved requisition
2. Identify candidate sourcing channels
3. Assign dedicated recruiter
4. Initiate recruitment process
5. Update requisition status → "Active Recruitment"

**Output**: Active job posting + recruitment plan

**Estimated Time**: 1-2 business days

---

## Approval Matrix

| Position Level | Dept Head | Finance | HR | Executive |
|---------------|-----------|---------|-----|-----------|
| Entry Level (IC) | ✓ | ✓ | ✓ | - |
| Mid-Level (Senior IC/Lead) | ✓ | ✓ | ✓ | - |
| Manager | ✓ | ✓ | ✓ | - |
| Senior Manager | ✓ | ✓ | ✓ | ✓* |
| Director | ✓ | ✓ | ✓ | ✓ |
| VP/C-Level | ✓ | ✓ | ✓ | ✓ |

*✓ = Required approval
*✓\* = Required if salary >$150K or new headcount

---

## RACI Matrix

| Step | Hiring Manager | Dept Head | HRBP | Finance | Executive | Systems |
|------|----------------|-----------|------|---------|-----------|---------|
| Create Request | **R** | C | C | I | - | **A** |
| Dept Approval | C | **R/A** | C | I | - | **A** |
| HR Review | C | I | **R/A** | C | I | **A** |
| Finance Check | I | C | C | **R/A** | I | **A** |
| Executive Approval | I | C | C | C | **R/A** | **A** |
| Recruitment Start | C | C | C | I | - | **R** |

**Legend**: R = Responsible | A = Accountable | C = Consulted | I = Informed

---

## Forms and Templates

1. **Employee Requisition Form** ([Download](/templates/hr/employee-requisition-form.docx))
2. **Job Description Template** ([Download](/templates/hr/job-description-template.docx))
3. **Business Case Template** ([Download](/templates/hr/business-case-template.docx))

---

## Common Scenarios

### Scenario 1: Replacement Hire
**Situation**: Employee resignation, immediate replacement needed

**Process Modifications**:
- Expedited timeline (3-5 business days)
- Executive approval waived for like-for-like replacement
- Pre-approved budget simplifies finance review

**Action**: Mark "Replacement Hire" in requisition form

---

### Scenario 2: Urgent Business Need
**Situation**: Critical project staffing

**Process Modifications**:
- Parallel approvals (department + finance simultaneously)
- Executive approval via email/Slack
- Conditional offer subject to formal approval

**Action**: Mark as "Urgent" with detailed justification

---

### Scenario 3: Budget Reallocation
**Situation**: No existing budget

**Process Modifications**:
- Budget reallocation approval from CFO
- Extended timeline (10-15 business days)

**Action**: Initiate budget reallocation before requisition

---

## Metrics and KPIs

| Metric | Target | Measurement |
|--------|--------|-------------|
| Average approval time | 7 business days | Submission → Final approval |
| Rejection rate | &lt;10% | Rejected / Total submitted |
| First-pass approval | &gt;80% | Approved without revisions |
| Executive escalation | &lt;15% | Requiring exec approval |

---

## Troubleshooting

### Requisition Stuck in Approval
**Actions**:
1. Check assignee availability
2. Review for missing information
3. Escalate to HR Business Partner

### Invalid Budget Code
**Actions**:
1. Verify with finance team
2. Request updated budget codes
3. Resubmit with correct code

---

## Related Documentation

- [Hiring Process Overview](/docs/hr/workflows/onboarding)
- [Budget Approval Policy](/docs/finance/policies/budget-approval)
- [Job Description Guide](/docs/hr/templates/job-description)

---

## Policy References

- **HR Policy Manual**: Section 3.2 - Workforce Planning
- **Finance Policy**: FIN-005 - Budget Control
- **Compensation Policy**: COMP-002 - Salary Guidelines

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-01-15 | HR Team | Initial documentation |

---

## Contact and Support

**Questions**: hr@company.com
**HRIS Support**: hris-support@company.com
**Feedback**: [Submit via GitHub](https://github.com/jgtolentino/opex/issues/new)
