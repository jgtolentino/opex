# BPM Landing Page – AI Agent Prompt Snippets

This file contains **ready-to-paste prompts** for each tile on the BPM landing page. These prompts are designed to work with Claude Code and invoke the appropriate BPM sub-agent skills.

## How to Use

1. **Copy the prompt snippet** for the relevant tile
2. **Customize** the placeholders (in `{{double_braces}}`) with your specific context
3. **Paste** into Claude Code chat or your AI agent interface
4. **Submit** to get tailored BPM guidance

---

## Landing Page Tiles & Prompts

### 1. BPM Lifecycle

**Tile**: BPM Lifecycle – Learn more

**Primary Skill**: `bpm_knowledge_agent`

**Prompt Snippets**:

#### Option A: Understand the Lifecycle
```
Use the BPM Knowledge Guide skill to explain the BPM Lifecycle phases and how they apply to my organization.

Context:
- Industry: {{e.g., Finance SSC, HR Operations}}
- Current challenges: {{e.g., inconsistent quality, long cycle times}}
- What I want to know: {{e.g., which phase should we focus on first?}}
```

#### Option B: Diagnose Weaknesses
```
Use the BPM Knowledge Guide skill to help me identify which BPM Lifecycle phase we're weakest at.

Our main problems are:
- {{Problem 1, e.g., processes not documented}}
- {{Problem 2, e.g., no regular process reviews}}
- {{Problem 3, e.g., improvements don't stick}}

Based on the BPM Lifecycle wiki, which phase should we strengthen?
```

#### Option C: Create a Lifecycle Roadmap
```
Use the BPM Transformation Partner skill to create a 6-month roadmap for implementing the full BPM Lifecycle in our organization.

Context:
- Team size: {{e.g., 200 people}}
- Current maturity: {{e.g., ad-hoc, some docs but no formal process}}
- Priority: {{e.g., compliance, efficiency, quality}}
```

---

### 2. Build a BPM Team

**Tile**: Build a BPM Team – Learn more

**Primary Skill**: `bpm_transformation_partner`

**Prompt Snippets**:

#### Option A: Plan Team Build-Out
```
Use the BPM Transformation Partner skill to propose a 3-phase plan for building a BPM team.

Context:
- Organization: {{company name, industry}}
- Size: {{e.g., 500-person Finance SSC}}
- Current state: {{e.g., no dedicated BPM roles, managers do it ad-hoc}}
- Budget: {{e.g., can hire 2-3 people in Year 1}}

Use the "Build a BPM Team" wiki and role pages to recommend:
1. Which roles to hire first and why
2. Sequencing over 12-18 months
3. Quick wins to prove value
```

#### Option B: Compare Team Structures
```
Use the BPM Knowledge Guide skill to compare different BPM team structures.

Show me:
- Centralized BPM team (dedicated analysts/managers)
- Federated model (Process Owners in each department)
- Hybrid approach

Based on the wiki, which structure fits best for a {{team size / industry}}?
```

#### Option C: Create Job Descriptions
```
Use the BPM Copywriter skill to create job descriptions for the core BPM team roles.

Based on the wiki pages for:
- Business Process Analyst
- Business Process Manager
- Business Process Owner

Create tailored JDs for our {{industry}} organization with:
- Clear responsibilities
- Required skills
- Success metrics
```

---

### 3. Business Process Analyst Role

**Tile**: Business Process Analyst – Learn more

**Primary Skill**: `bpm_learning_designer`

**Prompt Snippets**:

#### Option A: Create Analyst Onboarding
```
Use the BPM Learning Designer skill to create a 30-day onboarding plan for a new Business Process Analyst.

Context:
- Industry: {{e.g., Finance, HR, Operations}}
- Team maturity: {{e.g., established BPM team vs new program}}
- Focus areas: {{e.g., process documentation, data analysis, improvement projects}}

Use the "Business Process Analyst Role" wiki page to design:
1. Week 1: Role orientation
2. Week 2-3: Core skills training
3. Week 4: First real assignment
```

#### Option B: Understand the Role
```
Use the BPM Knowledge Guide skill to explain the Business Process Analyst role.

Specifically:
- What are the 5 core responsibilities?
- How does this role differ from a Business Analyst or Data Analyst?
- What skills are most important?
- Where does this role fit in the BPM team?

Use the wiki to provide a clear, practical answer.
```

#### Option C: Create Career Development Path
```
Use the BPM Learning Designer skill to design a career development path for Business Process Analysts.

Create a progression:
- Junior Analyst (0-2 years) → What skills to develop
- Mid-level Analyst (2-4 years) → What projects to lead
- Senior Analyst (4+ years) → What's next (Manager? Owner? Specialist?)

Base this on the BPM role wiki pages.
```

---

### 4. Business Process Manager Role

**Tile**: Business Process Manager – Learn more

**Primary Skill**: `bpm_learning_designer`

**Prompt Snippets**:

#### Option A: Manager Onboarding
```
Use the BPM Learning Designer skill to create a 60-day onboarding plan for a new Business Process Manager.

Context:
- Organization: {{company, industry}}
- Reporting to: {{e.g., COO, Head of Operations}}
- Team size: {{e.g., managing 3 analysts}}
- Maturity: {{e.g., building BPM from scratch vs scaling existing}}

Use the "Business Process Manager Role" wiki to design their first 60 days.
```

#### Option B: Compare Manager vs Analyst
```
Use the BPM Knowledge Guide skill to clearly explain the difference between a Business Process Manager and Business Process Analyst.

Show:
- Responsibilities comparison
- Decision-making authority
- Who reports to whom
- When you need each role

Use the wiki pages for both roles.
```

#### Option C: Manager Leadership Training
```
Use the BPM Learning Designer skill to create a "BPM Manager Leadership Bootcamp" training module.

Focus areas:
- How to prioritize the improvement pipeline
- Managing analysts effectively
- Reporting process performance to executives
- Stakeholder management and influence

Use the BPM Manager Role wiki as the foundation.
```

---

### 5. Business Process Owner Role

**Tile**: Business Process Owner – Learn more

**Primary Skill**: `bpm_knowledge_agent`

**Prompt Snippets**:

#### Option A: Understand Ownership Model
```
Use the BPM Knowledge Guide skill to explain the Business Process Owner role and accountability model.

Questions:
- What does "process ownership" really mean?
- How is this different from being a manager of a team?
- What decisions can/should a Process Owner make?
- How many processes should one person own?

Use the "Business Process Owner Role" wiki to answer.
```

#### Option B: Train Process Owners
```
Use the BPM Learning Designer skill to create a "Process Owner Bootcamp" training program.

Audience: {{e.g., 10 department managers being assigned Process Owner roles}}
Duration: {{e.g., half-day workshop or 3-week email series}}
Goal: Help them understand their new accountability

Use the Process Owner wiki page to design the training.
```

#### Option C: Compare Owner vs Manager
```
Use the BPM Knowledge Guide skill to compare:
- Business Process Owner
- Business Process Manager

Clarify:
- Who owns the process end-to-end? (Owner)
- Who manages the BPM team? (Manager)
- How do they work together?

Use both wiki pages to explain clearly.
```

---

### 6. Automation Developer Role

**Tile**: Automation Developer – Learn more

**Primary Skill**: `bpm_learning_designer`

**Prompt Snippets**:

#### Option A: Automation Developer Onboarding
```
Use the BPM Learning Designer skill to create onboarding for a new Automation Developer in the BPM team.

Context:
- Background: {{e.g., software engineer, RPA developer, low-code specialist}}
- Tools: {{e.g., UiPath, Power Automate, Python}}
- Focus: {{e.g., automating finance processes, HR workflows}}

Use the "Automation Developer Role" wiki to design their first 30 days working with the BPM team.
```

#### Option B: Understand the Role
```
Use the BPM Knowledge Guide skill to explain the Automation Developer role in a BPM context.

Questions:
- How does this differ from a regular software developer or RPA engineer?
- How does the Automation Developer work with Process Analysts and Owners?
- When should automation be part of a BPM project?

Use the wiki to provide clarity.
```

#### Option C: Create Automation Prioritization Guide
```
Use the BPM Copywriter skill to create a simple guide: "How to Prioritize Automation Opportunities"

Based on:
- BPM Lifecycle (when does automation fit?)
- Automation Developer role (what criteria to use?)
- Process Owner input (which processes are highest pain?)

Create a 1-page decision framework for the BPM team.
```

---

### 7. COO Role (in BPM Context)

**Tile**: COO – Learn more

**Primary Skill**: `bpm_transformation_partner`

**Prompt Snippets**:

#### Option A: BPM Strategy for COO
```
Use the BPM Transformation Partner skill to create an executive summary for the COO on launching a BPM program.

Context:
- Organization: {{company, industry, size}}
- Current challenges: {{e.g., scalability, quality, compliance}}
- Budget: {{e.g., can invest $X or hire Y people}}

Provide:
1. Business case for BPM
2. 12-18 month roadmap
3. Expected ROI and success metrics
4. Role build-out plan
```

#### Option B: COO's Role in BPM
```
Use the BPM Knowledge Guide skill to explain the COO's role in supporting a BPM program.

Questions:
- What should the COO sponsor vs delegate?
- How hands-on should the COO be?
- What governance structure works best?
- How to measure BPM program success?

Use the COO and BPM wiki pages to answer.
```

#### Option C: Quarterly BPM Review for COO
```
Use the BPM Transformation Partner skill to design a quarterly BPM review template for the COO.

Include:
- Key metrics to track (efficiency, quality, speed, cost)
- Process performance dashboard
- Improvement pipeline status
- Team capacity and capability

Based on the BPM program structure in the wiki.
```

---

## Multi-Skill Workflows

Some use cases benefit from **chaining multiple skills** together:

### Example 1: Create Complete Role Documentation
```
Step 1: Use the BPM Knowledge Guide to summarize the "Business Process Analyst Role" wiki page.

Step 2: Use the BPM Copywriter to turn that summary into a polished 1-page role overview for candidates.

Step 3: Use the BPM Learning Designer to create a 30-day onboarding checklist for new hires in this role.
```

### Example 2: Launch BPM Program
```
Step 1: Use the BPM Transformation Partner to assess our BPM maturity and create a 12-month roadmap.

Step 2: Use the BPM Copywriter to turn that roadmap into an executive presentation for the COO.

Step 3: Use the BPM Learning Designer to create onboarding for the first BPM Manager hire.
```

---

## Customization Tips

### For Philippines Context
Add this to any prompt:
```
Context: We're a {{industry}} team based in the Philippines, supporting {{region}} operations.
Please consider:
- Local regulations and compliance requirements
- Cultural factors in change management
- Remote/hybrid work considerations
```

### For Specific Industries
Add industry context:
```
Industry-specific considerations:
- Finance SSC: {{e.g., SOX compliance, month-end close}}
- HR Operations: {{e.g., employee experience, data privacy}}
- Customer Service: {{e.g., SLA management, quality monitoring}}
```

### For Different Maturity Levels
Specify your starting point:
```
Current BPM maturity:
- Level 1 (Ad-hoc): No formal processes, all manual, reactive
- Level 2 (Documented): Some processes mapped, inconsistent
- Level 3 (Managed): Formal BPM team, regular reviews
- Level 4 (Optimized): Continuous improvement culture, data-driven
```

---

## Integration with Landing Page UI

### Suggested Button/Link Structure

For each tile on the landing page:

**Primary CTA**: "Learn More" → Wiki article
**Secondary CTA**: "Ask the Agent" → Pre-filled prompt (from above)

Example for "BPM Lifecycle" tile:
- **Button 1**: `Learn More` → `/docs/bpm/lifecycle`
- **Button 2**: `Ask the Agent` → Opens chat with pre-filled prompt:
  ```
  Use the BPM Knowledge Guide skill to explain the BPM Lifecycle phases and how they apply to my organization.
  ```

---

## Feedback & Iteration

As you use these prompts:
1. **Track which prompts are most popular** (analytics on button clicks)
2. **Refine based on user feedback** (are prompts too long? Not specific enough?)
3. **Add new prompts** as common use cases emerge
4. **Update skills** if agent responses aren't meeting user needs

---

**Last Updated**: 2025-11-15
**Maintained By**: InsightPulseAI / OpEx Team
