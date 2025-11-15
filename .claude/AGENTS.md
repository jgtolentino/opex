# BPM Agent Skills Configuration

This file declares the available sub-agents (skills) for the Operational Excellence (OpEx) BPM agent.

## Overview

The OpEx BPM agent orchestrates four specialized sub-agents, each designed to handle specific aspects of Business Process Management:

1. **BPM Copywriter** – Documentation and content creation
2. **BPM Knowledge Guide** – Wiki navigation and knowledge retrieval
3. **BPM Learning Designer** – Training and onboarding materials
4. **BPM Transformation Partner** – Strategic planning and roadmaps

## Sub-Agents

### 1. BPM Copywriter

**Skill Name**: `bpm_copywriter`
**Location**: `.claude/skills/bpm_copywriter/SKILL.md`

**Purpose**: Transforms raw BPM notes, spreadsheets, and wikis into clear, enterprise-ready documentation for the OpEx Docs site.

**Use Cases**:
- Polish landing page copy (headlines, taglines, cards)
- Create "Learn more" sections for BPM lifecycle and roles
- Draft how-to guides and FAQs for HR/Finance/BPM workflows
- Convert bullet lists and process diagrams into readable wiki pages

**When to Invoke**:
- User needs to rewrite or improve existing BPM content
- Creating new documentation for wiki pages
- Polishing job descriptions or role descriptions
- Making technical content accessible to non-technical audiences

**Example Prompt**:
```
Use the BPM Copywriter skill to turn this rough outline into a polished "Learn more" section for the BPM Lifecycle page.
```

---

### 2. BPM Knowledge Guide

**Skill Name**: `bpm_knowledge_agent`
**Location**: `.claude/skills/bpm_knowledge_agent/SKILL.md`

**Purpose**: Acts as an intelligent guide through the BPM wiki, helping users find relevant articles, compare concepts, and navigate the knowledge base.

**Use Cases**:
- Answer questions about BPM concepts using wiki content
- Compare BPM roles (Analyst vs Manager vs Owner)
- Suggest relevant wiki pages based on user questions
- Provide quick summaries of BPM topics

**When to Invoke**:
- User asks "What is..." or "How do I..." questions about BPM
- User needs help finding relevant wiki articles
- User wants to understand relationships between BPM concepts
- "Ask an expert" interactions from wiki pages

**Example Prompt**:
```
Use the BPM Knowledge Guide to explain the difference between a Process Analyst and Process Owner, and point me to the relevant wiki pages.
```

---

### 3. BPM Learning Designer

**Skill Name**: `bpm_learning_designer`
**Location**: `.claude/skills/bpm_learning_designer/SKILL.md`

**Purpose**: Converts BPM wiki content into structured learning experiences: onboarding paths, training modules, and micro-lessons.

**Use Cases**:
- Create onboarding modules for new BPM team members
- Design role-specific learning paths (Analyst, Manager, Owner)
- Turn wiki pages into 30-60 minute self-study modules
- Develop micro-lessons for email/Slack delivery
- Create exercises and assessments

**When to Invoke**:
- User needs training materials for BPM roles
- Creating onboarding programs for new hires
- Designing learning paths or career development plans
- Converting documentation into actionable learning experiences

**Example Prompt**:
```
Use the BPM Learning Designer to create a 3-day onboarding program for a new Business Process Analyst.
```

---

### 4. BPM Transformation Partner

**Skill Name**: `bpm_transformation_partner`
**Location**: `.claude/skills/bpm_transformation_partner/SKILL.md`

**Purpose**: Helps COOs, BPM Leads, and Transformation teams plan and sequence BPM initiatives, turning wiki content into actionable roadmaps.

**Use Cases**:
- Assess BPM maturity and create improvement roadmaps
- Design 3-5 phase transformation plans
- Sequence BPM team hiring and capability building
- Create RACI matrices for BPM roles
- Develop change management plans
- Build executive presentations on BPM strategy

**When to Invoke**:
- User needs to plan a BPM program launch or scale-up
- Assessing organizational BPM maturity
- Creating strategic roadmaps for process transformation
- Determining which BPM roles to hire first and why
- Building business cases for BPM investment

**Example Prompt**:
```
Use the BPM Transformation Partner to create a 12-month roadmap for launching a BPM program in our 300-person Finance SSC.
```

---

## Integration with Landing Page

Each skill is designed to complement specific sections of the BPM landing page:

| Landing Page Section | Primary Skill | Secondary Skills |
|---------------------|---------------|------------------|
| BPM Lifecycle | Knowledge Guide | Transformation Partner |
| Build a BPM Team | Transformation Partner | Learning Designer |
| Business Process Analyst Role | Learning Designer | Knowledge Guide, Copywriter |
| Business Process Manager Role | Learning Designer | Knowledge Guide, Copywriter |
| Business Process Owner Role | Knowledge Designer | Knowledge Guide, Copywriter |
| Automation Developer Role | Learning Designer | Knowledge Guide, Copywriter |
| COO Role | Transformation Partner | Knowledge Guide |

## Skill Invocation Patterns

### Pattern 1: Direct Invocation
User explicitly requests a skill:
```
"Use the BPM Copywriter to polish this text..."
```

### Pattern 2: Context-Based Invocation
System detects user intent and suggests appropriate skill:
```
User: "How do I create training for new Process Analysts?"
System: "This looks like a learning design task. Let me use the BPM Learning Designer skill..."
```

### Pattern 3: Multi-Skill Workflow
Complex tasks may require multiple skills in sequence:
```
1. Knowledge Guide → Find relevant wiki content
2. Learning Designer → Convert to training module
3. Copywriter → Polish final deliverable
```

## Maintenance

**Skill Updates**: Each skill can be updated independently by modifying its `SKILL.md` file.

**Version Control**: Skills follow semantic versioning (currently all v1).

**Testing**: Test each skill with sample prompts to ensure quality and consistency.

**Monitoring**: Track which skills are most frequently used to inform future development.

---

## Quick Reference

**To use a skill**, include it in your prompt:
```
"Use the [skill name] to [task]..."
```

**Available Skills**:
- `bpm_copywriter` – Polish and write BPM content
- `bpm_knowledge_agent` – Navigate and summarize BPM wiki
- `bpm_learning_designer` – Create training and onboarding
- `bpm_transformation_partner` – Plan BPM initiatives and roadmaps
