# Process Diagrams: Month-End Closing

**Document Control**
- **Document ID:** FIN-BPMN-001
- **Version:** 1.0
- **Effective Date:** 2025-11-15
- **Related Documents:** FIN-SOP-001, FIN-RACI-001, FIN-TIMELINE-001

---

## Overview

This document provides Business Process Model and Notation (BPMN) style diagrams for the month-end closing process. The diagrams use Mermaid syntax and can be rendered in most modern documentation platforms.

**Diagram Types:**
1. High-Level Close Process Flow
2. Swimlane Diagrams by Function
3. Detailed Sub-Process Flows
4. Decision Tree Diagrams
5. Tax Filing Workflow

---

## 1. High-Level Month-End Close Process

```mermaid
graph TB
    Start([Month-End Date]) --> PreCheck{Pre-Close<br/>Requirements Met?}
    PreCheck -->|No| Escalate1[Escalate to GVKC]
    PreCheck -->|Yes| Phase1[Phase 1: Transaction Processing<br/>Days 1-3]

    Phase1 --> M1{Milestone 1:<br/>Transactions Complete?}
    M1 -->|No| Review1[Review Delays<br/>Assign Recovery Actions]
    Review1 --> Phase1
    M1 -->|Yes| Phase2[Phase 2: Project Accounting<br/>Days 2-4]

    Phase2 --> M2{Milestone 2:<br/>Projects Complete?}
    M2 -->|No| Review2[Review WIP Variances<br/>Resolve Issues]
    Review2 --> Phase2
    M2 -->|Yes| Phase3[Phase 3: Tax Compliance<br/>Days 3-5]

    Phase3 --> M3{Milestone 3:<br/>Tax Returns Approved?}
    M3 -->|No| Review3[Review Tax Calculations<br/>Correct Errors]
    Review3 --> Phase3
    M3 -->|Yes| Phase4[Phase 4: Final Adjustments<br/>Days 5-7]

    Phase4 --> M4{Milestone 4:<br/>All Adjustments Posted?}
    M4 -->|No| Review4[Review Variances<br/>Post Final JEs]
    Review4 --> Phase4
    M4 -->|Yes| Phase5[Phase 5: BIR Filing & Close<br/>Day 8]

    Phase5 --> FinalCheck{All Requirements<br/>Complete?}
    FinalCheck -->|No| Escalate2[Escalate to GVKC/CFO]
    Escalate2 --> ExtendClose[Extend Close Period]
    FinalCheck -->|Yes| LockPeriod[Lock GL Period]

    LockPeriod --> IssueReports[Issue Financial Statements]
    IssueReports --> Archive[Archive Documentation]
    Archive --> End([Close Complete])

    style Start fill:#90EE90
    style End fill:#90EE90
    style M1 fill:#FFD700
    style M2 fill:#FFD700
    style M3 fill:#FFD700
    style M4 fill:#FFD700
    style FinalCheck fill:#FFD700
    style LockPeriod fill:#FF6B6B
    style Escalate1 fill:#FF6B6B
    style Escalate2 fill:#FF6B6B
```

---

## 2. Swimlane Diagram - Overall Close Process

```mermaid
graph TB
    subgraph "Finance Director (GVKC)"
        A1[Review Pre-Close Requirements]
        A2[Approve Phase 1 Transactions]
        A3[Approve Phase 2 Project Entries]
        A4[Approve Tax Returns]
        A5[Approve Final Adjustments]
        A6[Lock GL Period]
        A7[Issue Financial Statements]
    end

    subgraph "Tax Specialist (JPL)"
        B1[Process Payroll]
        B2[Calculate VAT & EWT]
        B3[Prepare Tax Returns]
        B4[File BIR Returns]
    end

    subgraph "Senior Accountant - Corporate (RM)"
        C1[Bank Reconciliations]
        C2[Process Accruals]
        C3[Calculate Depreciation]
        C4[Review Tax Returns]
        C5[Analytical Review P&L]
    end

    subgraph "Project Accountant (BOM)"
        D1[Client Billings]
        D2[WIP Reconciliation]
        D3[AR Aging]
        D4[CA Management]
        D5[Project P&L]
    end

    subgraph "Senior Accountant - Assets (LAS)"
        E1[Capitalize Assets]
        E2[Process Depreciation]
        E3[Reclassifications]
    end

    Start([Day 1]) --> A1
    A1 --> B1
    A1 --> C1
    B1 --> A2
    C1 --> C2
    C2 --> A2
    A2 --> C3
    A2 --> D1
    C3 --> A3
    D1 --> D2
    D2 --> A3
    A3 --> B2
    A3 --> D3
    B2 --> B3
    B3 --> C4
    C4 --> A4
    D3 --> D4
    D4 --> D5
    D5 --> C5
    A4 --> E1
    E1 --> E2
    E2 --> E3
    E3 --> C5
    C5 --> A5
    A5 --> B4
    B4 --> A6
    A6 --> A7
    A7 --> End([Close Complete])

    style Start fill:#90EE90
    style End fill:#90EE90
```

---

## 3. Detailed Sub-Process: Payroll Processing

```mermaid
flowchart TD
    Start([Start: Day 1]) --> GetPayroll[Obtain Approved Payroll Register<br/>from HR]
    GetPayroll --> Verify{Payroll<br/>Complete &<br/>Approved?}

    Verify -->|No| RequestCorrection[Request Correction from HR]
    RequestCorrection --> GetPayroll

    Verify -->|Yes| Calculate[Calculate Journal Entry:<br/>- Gross Salaries<br/>- SSS, PhilHealth, Pag-IBIG<br/>- Withholding Tax<br/>- Net Pay]

    Calculate --> PrepareJE[Prepare Payroll JE]
    PrepareJE --> ReviewCNVC[Review by Finance Supervisor<br/>CNVC]

    ReviewCNVC --> ReviewOK{Review<br/>Approved?}
    ReviewOK -->|No - Errors Found| CorrectJE[Correct Journal Entry]
    CorrectJE --> PrepareJE

    ReviewOK -->|Yes| ApprovalGVKC[Submit for Approval<br/>GVKC]
    ApprovalGVKC --> ApprovalDecision{Approved?}

    ApprovalDecision -->|No - Rejected| CorrectJE
    ApprovalDecision -->|Yes| PostGL[Post to General Ledger]

    PostGL --> RecordCommissions{Commissions<br/>This Period?}
    RecordCommissions -->|Yes| ProcessCommissions[Process Commission JE]
    ProcessCommissions --> ReviewCommissions[Review & Approve]
    ReviewCommissions --> PostCommissions[Post Commission JE]
    PostCommissions --> SettlementAdj

    RecordCommissions -->|No| SettlementAdj{Salary Settlement<br/>Adjustments?}
    SettlementAdj -->|Yes| ProcessSettlement[Process Settlement JE]
    ProcessSettlement --> PostSettlement[Post Settlement JE]
    PostSettlement --> Complete

    SettlementAdj -->|No| Complete([Payroll Complete])

    style Start fill:#90EE90
    style Complete fill:#90EE90
    style Verify fill:#FFD700
    style ReviewOK fill:#FFD700
    style ApprovalDecision fill:#FFD700
```

---

## 4. Detailed Sub-Process: WIP/POP Reconciliation

```mermaid
flowchart TD
    Start([Start: Day 2-3]) --> ExtractData[Extract Project Cost Data<br/>from ERP]
    ExtractData --> ContactPM[Contact Project Managers<br/>for POC Estimates]

    ContactPM --> ReceivePOC{POC Estimates<br/>Received?}
    ReceivePOC -->|No - Delayed| Escalate[Escalate to<br/>Project Director]
    Escalate --> ReceivePOC

    ReceivePOC -->|Yes| PrepareWIP[Prepare WIP Schedule:<br/>- Costs Incurred<br/>- Revenue Recognized POC<br/>- Billings to Date<br/>- Over/Under Billing]

    PrepareWIP --> ReconcileGL[Reconcile WIP Schedule<br/>to GL Balance]
    ReconcileGL --> Variance{Variance<br/>>PHP 100k?}

    Variance -->|Yes| Investigate[Investigate Root Cause:<br/>- Missing Costs?<br/>- Incorrect Billing?<br/>- POC Error?]
    Investigate --> Identify[Identify Adjustment Needed]
    Identify --> PrepareAdj[Prepare Adjustment JE]
    PrepareAdj --> ReviewAdj[Review Adjustment]
    ReviewAdj --> ApproveAdj{Approve?}
    ApproveAdj -->|No| CorrectAdj[Correct Adjustment]
    CorrectAdj --> PrepareAdj
    ApproveAdj -->|Yes| PostAdj[Post Adjustment JE]
    PostAdj --> ReconcileGL

    Variance -->|No - Within Tolerance| CheckUnbilled{Unbilled<br/>Revenue<br/>Exists?}

    CheckUnbilled -->|Yes| CalculateUnbilled[Calculate Unbilled Revenue<br/>under POC Method]
    CalculateUnbilled --> PrepareUnbilled[Prepare Unbilled Revenue JE:<br/>DR Unbilled Receivables<br/>CR Revenue]
    PrepareUnbilled --> ReviewUnbilled[Review & Approve]
    ReviewUnbilled --> PostUnbilled[Post Unbilled Revenue]
    PostUnbilled --> FinalWIP

    CheckUnbilled -->|No| FinalWIP[Prepare Final WIP Schedule<br/>per Job]
    FinalWIP --> ProjectPL[Prepare Project P&L Reports]
    ProjectPL --> VarianceAnalysis[Analyze Variances:<br/>- Actual vs Budget<br/>- Prior Month Comparison]

    VarianceAnalysis --> Material{Material<br/>Variances?}
    Material -->|Yes| ExplainVariances[Prepare Variance<br/>Explanation Memo]
    ExplainVariances --> Complete
    Material -->|No| Complete([WIP Reconciliation Complete])

    style Start fill:#90EE90
    style Complete fill:#90EE90
    style ReceivePOC fill:#FFD700
    style Variance fill:#FFD700
    style ApproveAdj fill:#FFD700
    style Material fill:#FFD700
```

---

## 5. Detailed Sub-Process: VAT Computation and Filing

```mermaid
flowchart TD
    Start([Start: Day 3]) --> CompileSales[Compile Sales Register<br/>Extract from GL]
    CompilePurchases[Compile Purchases Register<br/>Extract from GL]

    Start --> CompilePurchases

    CompileSales --> CalcOutput[Calculate Output VAT:<br/>Sales × 12%]
    CompilePurchases --> ReviewInput[Review Input VAT Claims:<br/>- Valid VAT Invoice?<br/>- Business Purpose?<br/>- TIN Verification]

    ReviewInput --> Disallow{Disallowances<br/>Identified?}
    Disallow -->|Yes| RemoveInvalid[Remove Invalid Claims:<br/>- Non-VAT Purchases<br/>- Missing Invoices<br/>- Personal Expenses]
    RemoveInvalid --> CalcInput
    Disallow -->|No| CalcInput[Calculate Input VAT:<br/>Valid Purchases × 12%]

    CalcOutput --> Reconcile[Reconcile VAT Accounts to GL]
    CalcInput --> Reconcile

    Reconcile --> GLMatch{GL<br/>Reconciled?}
    GLMatch -->|No| InvestigateGL[Investigate Differences]
    InvestigateGL --> AdjustGL[Post Reconciliation Adjustments]
    AdjustGL --> Reconcile

    GLMatch -->|Yes| CalcNet[Calculate Net VAT:<br/>Output VAT - Input VAT - Withholding VAT]

    CalcNet --> NetResult{Net<br/>Result?}
    NetResult -->|Payable| RecordPayable[DR Output VAT<br/>CR Input VAT<br/>CR WHT VAT<br/>CR VAT Payable]
    NetResult -->|Excess Input| RecordExcess[DR Output VAT<br/>DR VAT Excess Input<br/>CR Input VAT<br/>CR WHT VAT]

    RecordPayable --> PrepareBIR
    RecordExcess --> PrepareBIR[Prepare BIR Form 2550M]

    PrepareBIR --> ReviewRM[Review by Senior Accountant<br/>RM]
    ReviewRM --> ReviewResult{Review<br/>Passed?}
    ReviewResult -->|No| CorrectReturn[Correct Errors]
    CorrectReturn --> PrepareBIR

    ReviewResult -->|Yes| ApproveGVKC[Approve by Finance Director<br/>GVKC]
    ApproveGVKC --> ApprovalResult{Approved?}
    ApprovalResult -->|No| CorrectReturn

    ApprovalResult -->|Yes| PreparePayment{Net VAT<br/>Payable?}
    PreparePayment -->|Yes| CreateVoucher[Prepare Payment Voucher]
    CreateVoucher --> ApprovePayment[Approve Payment<br/>GVKC]
    ApprovePayment --> FileReturn
    PreparePayment -->|No - Excess| FileReturn[File via BIR eFPS<br/>Deadline: 20th of following month]

    FileReturn --> RemitPayment{Payment<br/>Required?}
    RemitPayment -->|Yes| PayBank[Remit Payment via<br/>Authorized Agent Bank]
    PayBank --> ObtainConfirm
    RemitPayment -->|No| ObtainConfirm[Obtain Filing Confirmation]

    ObtainConfirm --> ArchiveDoc[Archive BIR Form & Confirmation]
    ArchiveDoc --> Complete([VAT Filing Complete])

    style Start fill:#90EE90
    style Complete fill:#90EE90
    style Disallow fill:#FFD700
    style GLMatch fill:#FFD700
    style NetResult fill:#FFD700
    style ReviewResult fill:#FFD700
    style ApprovalResult fill:#FFD700
```

---

## 6. Tax Filing Workflow (Generic)

```mermaid
flowchart LR
    subgraph "Step 1: Preparation BIR Deadline - 4 Days"
        A1[Gather Source Data] --> A2[Prepare BIR Form]
        A2 --> A3[Complete Form]
        A3 --> A4[Draft Payment Request]
        A4 --> A5[Prepare Supporting Schedules]
    end

    subgraph "Step 2: Report Approval BIR Deadline - 2 Days"
        B1[Submit to Senior Finance Manager] --> B2[SFM Reviews Form]
        B2 --> B3{Approved?}
        B3 -->|No| B4[Return for Correction]
        B4 --> A2
        B3 -->|Yes| B5[Submit File Request to FD]
    end

    subgraph "Step 3: Payment Approval BIR Deadline - 1 Day"
        C1[Finance Director Reviews] --> C2{Payment<br/>Approved?}
        C2 -->|No| C3[Return for Review]
        C3 --> B1
        C2 -->|Yes| C4[Approve Payment Release]
    end

    subgraph "Step 4: Filing & Payment BIR Deadline"
        D1[File Return via eFPS] --> D2[Generate Reference Number]
        D2 --> D3[Remit Payment to Bank]
        D3 --> D4[Obtain Payment Confirmation]
        D4 --> D5[Archive Documents]
    end

    A5 --> B1
    B5 --> C1
    C4 --> D1

    style A1 fill:#E8F4F8
    style B1 fill:#FFF4E6
    style C1 fill:#FFF0F5
    style D1 fill:#F0FFF0
    style B3 fill:#FFD700
    style C2 fill:#FFD700
```

---

## 7. Decision Tree: Accrual vs. Actual Expense

```mermaid
flowchart TD
    Start([Expense Identified]) --> InvoiceReceived{Invoice<br/>Received?}

    InvoiceReceived -->|Yes| CheckPeriod{Invoice Date<br/>in Current<br/>Period?}

    CheckPeriod -->|Yes| RecordActual[Record as Actual Expense:<br/>DR Expense<br/>CR Accounts Payable]
    RecordActual --> End1([Post Entry])

    CheckPeriod -->|No - Prior Period| PriorPeriodAdj[Record as Prior Period<br/>Adjustment with Memo]
    PriorPeriodAdj --> RequireApproval[Requires FD Approval]
    RequireApproval --> End2([Post Entry])

    InvoiceReceived -->|No - Not Yet Received| Incurred{Expense<br/>Incurred in<br/>This Period?}

    Incurred -->|No| NoAction[No Action Needed]
    NoAction --> End3([Wait for Invoice])

    Incurred -->|Yes| EstimateAvailable{Reliable<br/>Estimate<br/>Available?}

    EstimateAvailable -->|No| UseHistorical{Historical<br/>Pattern<br/>Available?}
    UseHistorical -->|No| ConsultDept[Consult with Department<br/>for Estimate]
    ConsultDept --> EstimateAvailable

    UseHistorical -->|Yes| UseAverage[Use Historical Average]
    UseAverage --> PrepareAccrual

    EstimateAvailable -->|Yes| SourceEstimate{Estimate<br/>Source?}

    SourceEstimate -->|Contract/PO| ContractBased[Use Contract Terms:<br/>Monthly Rate × Period]
    SourceEstimate -->|Progress Billing| POCBased[Use POC Calculation]
    SourceEstimate -->|Meter Reading| MeterBased[Use Meter Reading × Rate]
    SourceEstimate -->|Other| OtherBasis[Use Other Reasonable Basis]

    ContractBased --> PrepareAccrual
    POCBased --> PrepareAccrual
    MeterBased --> PrepareAccrual
    OtherBasis --> PrepareAccrual

    PrepareAccrual[Prepare Accrual Entry:<br/>DR Expense<br/>CR Accrued Expenses]

    PrepareAccrual --> Material{Amount<br/>>PHP 50k?}
    Material -->|Yes| DeptApproval[Require Department Head<br/>Sign-off]
    DeptApproval --> ReviewAccrual
    Material -->|No| ReviewAccrual[Review & Approve<br/>GVKC]

    ReviewAccrual --> UpdateTracker[Update Accrual Tracker<br/>for Next Month Reversal]
    UpdateTracker --> End4([Post Entry])

    style Start fill:#90EE90
    style End1 fill:#90EE90
    style End2 fill:#90EE90
    style End3 fill:#90EE90
    style End4 fill:#90EE90
    style InvoiceReceived fill:#FFD700
    style CheckPeriod fill:#FFD700
    style Incurred fill:#FFD700
    style EstimateAvailable fill:#FFD700
    style Material fill:#FFD700
```

---

## 8. Exception Handling Process

```mermaid
flowchart TD
    Issue([Exception/Issue Identified]) --> Category{Issue<br/>Category?}

    Category -->|Missing Document| MissingDoc[Contact Originator<br/>Request Document]
    MissingDoc --> DocReceived{Received<br/>Within 24h?}
    DocReceived -->|Yes| Process[Process Transaction]
    DocReceived -->|No| EscFS[Escalate to Finance Supervisor]
    EscFS --> HoldPosting[Hold Posting Until Resolved]

    Category -->|Reconciliation Variance| CheckAmount{Variance<br/>>PHP 10k?}
    CheckAmount -->|No| Investigate[Investigate & Resolve]
    Investigate --> DocumentRes[Document Resolution]
    DocumentRes --> Process
    CheckAmount -->|Yes| EscGVKC[Escalate to Finance Director]
    EscGVKC --> RootCause[Root Cause Analysis<br/>Timeline: 48h]
    RootCause --> PrepareAdj[Prepare Adjustment Entry]
    PrepareAdj --> Process

    Category -->|Prior Period Invoice| ReviewMaterial{Material<br/>Amount?}
    ReviewMaterial -->|No - <PHP 25k| CurrentPeriod[Record in Current Period<br/>with Note]
    CurrentPeriod --> Process
    ReviewMaterial -->|Yes - >PHP 25k| PriorAdj[Prepare Prior Period<br/>Adjustment Memo]
    PriorAdj --> FDApproval[Finance Director Approval<br/>Required]
    FDApproval --> Process

    Category -->|Client Billing Dispute| ContactCS[Consult with Client Service]
    ContactCS --> HoldRevenue[Hold Revenue Recognition]
    HoldRevenue --> PMReview[Project Director Reviews]
    PMReview --> Resolution{Resolved?}
    Resolution -->|Yes| Process
    Resolution -->|No - Within 72h| ContinueHold[Continue Holding<br/>Escalate to GVKC]
    ContinueHold --> Resolution

    Category -->|System/GL Error| LogTicket[Log IT Support Ticket]
    LogTicket --> Urgent{Impacts<br/>Close?}
    Urgent -->|Yes - Critical| Workaround[Implement Manual<br/>Workaround]
    Workaround --> NotifyGVKC[Notify Finance Director]
    NotifyGVKC --> ITResolve{Resolved<br/>Within 4h?}
    ITResolve -->|No| Escalate[Escalate to IT Manager<br/>& CFO]
    ITResolve -->|Yes| Process
    Urgent -->|No| ITQueue[Follow Standard IT Queue]
    ITQueue --> Process

    Category -->|CA Liquidation Overdue| CheckDays{Days<br/>Outstanding?}
    CheckDays -->|30-60 days| Reminder[Send Reminder to Employee]
    Reminder --> Monitor[Monitor for Submission]
    CheckDays -->|61-90 days| EscManager[Escalate to Department Manager]
    EscManager --> Monitor
    CheckDays -->|>90 days| HRAction[Escalate to HR<br/>Salary Deduction Process]
    HRAction --> Process

    Category -->|Missed BIR Deadline| FileMissed[File Immediately<br/>Even if Late]
    FileMissed --> CalcPenalty[Calculate Penalties:<br/>- 25% Surcharge<br/>- 12% Annual Interest]
    CalcPenalty --> PrepareMemo[Prepare Incident Memo]
    PrepareMemo --> NotifyCFO[Notify Finance Director & CFO]
    NotifyCFO --> Process

    Process --> Document[Document Resolution<br/>in Issue Log]
    Document --> Close([Issue Closed])

    style Issue fill:#FF6B6B
    style Close fill:#90EE90
    style Process fill:#90EE90
```

---

## 9. Period Close Final Checklist Flow

```mermaid
flowchart TD
    Start([Day 8: Final Close]) --> C1{All BIR Forms<br/>Filed?}
    C1 -->|No| FilePending[Complete BIR Filing]
    FilePending --> C1
    C1 -->|Yes| C2{All Tax Payments<br/>Remitted?}

    C2 -->|No| RemitPending[Complete Tax Payments]
    RemitPending --> C2
    C2 -->|Yes| C3{All Suspense Accounts<br/>Cleared?}

    C3 -->|No| ClearSuspense[Clear Suspense Accounts]
    ClearSuspense --> C3
    C3 -->|Yes| C4{All Control Accounts<br/>Reconciled?}

    C4 -->|No| ReconcileControl[Complete Reconciliations]
    ReconcileControl --> C4
    C4 -->|Yes| C5{All Intercompany<br/>Accounts Balanced?}

    C5 -->|No| BalanceIC[Reconcile Intercompany]
    BalanceIC --> C5
    C5 -->|Yes| C6{All Sub-Ledgers<br/>to GL Reconciled?}

    C6 -->|No| ReconcileSub[Reconcile Sub-Ledgers]
    ReconcileSub --> C6
    C6 -->|Yes| C7{Final Financial<br/>Statements Reviewed?}

    C7 -->|No| ReviewFS[Review Financial Statements]
    ReviewFS --> C7
    C7 -->|Yes| C8{All Documentation<br/>Archived?}

    C8 -->|No| ArchiveDocs[Complete Archiving]
    ArchiveDocs --> C8
    C8 -->|Yes| FinalApproval[Finance Director<br/>Final Sign-off]

    FinalApproval --> LockGL[Lock GL Period<br/>GVKC Only]
    LockGL --> ExportGL[Export GL Detail]
    ExportGL --> IssueFS[Issue Financial Statements<br/>to Stakeholders]
    IssueFS --> Complete([Period Close Complete])

    style Start fill:#90EE90
    style Complete fill:#90EE90
    style LockGL fill:#FF6B6B
    style FinalApproval fill:#FFD700
```

---

## 10. Monthly BIR Filing Calendar Flow

```mermaid
gantt
    title BIR Filing Schedule (Example: October 2025 Close)
    dateFormat  YYYY-MM-DD
    section Monthly Returns
    1601-C Compensation - Prepare     :a1, 2025-11-06, 1d
    1601-C - Review & Approve          :a2, after a1, 1d
    1601-C - File by Nov 10            :milestone, a3, 2025-11-10, 0d

    0619-E Gov't Remit - Prepare       :b1, 2025-11-06, 1d
    0619-E - Review & Approve          :b2, after b1, 1d
    0619-E - File by Nov 10            :milestone, b3, 2025-11-10, 0d

    1601-E EWT - Prepare               :c1, 2025-11-06, 1d
    1601-E - Review & Approve          :c2, after c1, 1d
    1601-E - File by Nov 10            :milestone, c3, 2025-11-10, 0d

    2550M VAT - Prepare                :d1, 2025-11-16, 1d
    2550M - Review & Approve           :d2, after d1, 1d
    2550M - File by Nov 20             :milestone, d3, 2025-11-20, 0d

    section Quarterly Returns (if Q-end)
    1702-Q Income Tax - Prepare        :e1, 2025-11-26, 2d
    1702-Q - Review & Approve          :e2, after e1, 1d
    1702-Q - File by Nov 30            :milestone, e3, 2025-11-30, 0d

    2550-Q Quarterly VAT - Prepare     :f1, 2025-11-21, 2d
    2550-Q - Review & Approve          :f2, after f1, 1d
    2550-Q - File by Nov 25            :milestone, f3, 2025-11-25, 0d
```

---

## How to Use These Diagrams

### Rendering in Documentation Platforms

**Supported Platforms:**
- **GitHub/GitLab**: Mermaid is natively supported in markdown files
- **Notion**: Use Mermaid embed or third-party integrations
- **Confluence**: Install Mermaid plugin
- **Docusaurus**: Native Mermaid support with `@docusaurus/theme-mermaid`
- **VS Code**: Install Mermaid preview extension

### Exporting Diagrams

**To PNG/SVG:**
```bash
# Using mermaid-cli (mmdc)
npm install -g @mermaid-js/mermaid-cli
mmdc -i BPMN.md -o diagrams/
```

**To PowerPoint/Visio:**
1. Render diagram in browser
2. Copy to clipboard
3. Paste into PowerPoint/Visio as image
4. Or use online converters like mermaid.live

### Customizing Diagrams

**Change Colors:**
```mermaid
%%{init: {'theme':'forest'}}%%
flowchart TD
    ...
```

**Available Themes:**
- `default` (light)
- `dark`
- `forest` (green)
- `neutral` (gray)

---

## Process Improvement Recommendations

Based on the process diagrams, the following improvements are recommended:

### Bottleneck Identification

1. **WIP Reconciliation (Day 3):**
   - **Issue:** Dependent on Project Manager POC estimates
   - **Recommendation:** Implement automated POC calculation tool; establish hard deadline for PM input

2. **VAT Compilation (Day 3-4):**
   - **Issue:** Manual validation of input VAT invoices
   - **Recommendation:** Implement pre-validation at invoice approval stage; automate TIN verification

3. **Final Approval (Day 7):**
   - **Issue:** Single point of approval (GVKC)
   - **Recommendation:** Implement dual approval system for non-critical items; escalation protocol if GVKC unavailable

### Automation Opportunities

1. **Bank Reconciliation:** Implement automated bank feed integration
2. **Depreciation Calculation:** Automate from fixed asset register
3. **VAT Reconciliation:** Auto-reconcile Output/Input VAT to GL
4. **Accrual Tracking:** Implement automated reversal in following month
5. **BIR Filing:** Use API integration for eFPS (if available)

### Control Enhancements

1. **Add Pre-Close Validation:** System check before Day 1 starts
2. **Real-Time Dashboard:** Live status tracking of close progress
3. **Automated Alerts:** Email notifications for approaching deadlines
4. **Audit Trail:** Enhanced logging of all approvals and changes

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-11-15 | Finance Team | Initial BPMN documentation with Mermaid diagrams |

---

**END OF DOCUMENT**
