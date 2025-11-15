# CTO-Mentor – Example Prompts & Usage Patterns

This file contains **ready-to-use prompts** for the **CTO-Mentor** skill. Use these to get strategic guidance on AI platform architecture, product decisions, and org design.

## How to Use

1. **Copy a prompt** from the sections below
2. **Customize** the placeholders (in `{{double_braces}}`) with your specific context
3. **Paste** into Claude Code or your AI agent interface with the `cto:` prefix
4. **Submit** to get CTO-level strategic guidance

---

## Prompt Categories

### 1. Platform Architecture & Orchestration

#### Design an AI Platform Roadmap
```
cto: design an AI platform roadmap for {{company_name}} for the next 12 months

Context:
- Product: {{e.g., multi-agent orchestration platform for enterprise BPM}}
- Current state: {{e.g., POCs built, need to productize}}
- Team size: {{e.g., 2-5 engineers}}
- Goal: {{e.g., onboard 10+ clients, scale to multi-tenant}}
```

#### Multi-Agent Orchestration Pattern
```
cto: recommend an architecture for multi-agent orchestration with the following requirements:

Requirements:
- Support {{number}} concurrent agents per client
- Agents need to: {{e.g., share context, call tools, hand off tasks}}
- Clients: {{e.g., enterprise BPM teams, Finance SSCs}}
- Constraints: {{e.g., low latency, high reliability, cost-effective}}

Provide architecture diagram, tech stack, and implementation phases.
```

#### LLM Stack Decision
```
cto: compare using OpenAI vs mixed open-weight models for our orchestration layer

Context:
- Use case: {{e.g., agent routing, tool calling, RAG}}
- Volume: {{e.g., 1M requests/month}}
- Budget: {{e.g., $5k/month for inference}}
- Requirements: {{e.g., need structured outputs, reliable tool calling}}
- Compliance: {{e.g., data residency requirements, on-prem needed?}}
```

#### Build vs Buy: Orchestration Framework
```
cto: should we build a custom agent orchestration layer or use LangGraph/CrewAI/AutoGen?

Context:
- Use cases: {{e.g., BPM agents, voice agents, knowledge systems}}
- Team: {{e.g., 1-2 ML engineers, limited LangChain experience}}
- Timeline: {{e.g., need MVP in 3 months}}
- Unique requirements: {{e.g., custom routing logic, integration with legacy systems}}
```

---

### 2. LLM Product Architecture

#### API Design for AI Products
```
cto: design an API architecture for our AI agent platform

Requirements:
- Endpoints needed: {{e.g., /chat, /streaming, /tools, /memory}}
- Features: {{e.g., streaming responses, tool calling, session management}}
- Auth: {{e.g., API keys, OAuth, SSO}}
- Rate limiting: {{e.g., per client, per endpoint}}
- SLA: {{e.g., 99.5% uptime, <2s p95 latency}}

Provide API spec, tech stack, and implementation plan.
```

#### Observability & Evals
```
cto: design an observability and evaluation system for our LLM product

Context:
- Product: {{e.g., multi-agent BPM platform}}
- What to monitor: {{e.g., latency, cost, quality, tool success rate}}
- Evaluation: {{e.g., human-in-the-loop, automated evals, A/B testing}}
- Tools: {{e.g., LangSmith, Arize, custom dashboard}}

Provide metrics to track, tooling recommendations, and rollout plan.
```

#### Safety & Content Filtering
```
cto: design a safety layer for our LLM product to prevent jailbreaks, data leakage, and harmful outputs

Context:
- Use case: {{e.g., enterprise BPM agents handling sensitive data}}
- Risks: {{e.g., prompt injection, data exfiltration, toxic outputs}}
- Compliance: {{e.g., SOC2, GDPR, industry regulations}}
- Users: {{e.g., internal employees, external clients}}

Provide safety architecture, tools, and testing approach.
```

#### RAG Architecture
```
cto: recommend a RAG architecture for {{use_case}}

Context:
- Data sources: {{e.g., Confluence, Google Drive, PDFs, databases}}
- Volume: {{e.g., 10k documents, 100M tokens}}
- Query types: {{e.g., Q&A, summarization, multi-hop reasoning}}
- Latency requirement: {{e.g., <3s end-to-end}}
- Update frequency: {{e.g., real-time, daily, weekly}}

Provide embedding model, vector DB, chunking strategy, and retrieval approach.
```

---

### 3. Org Design & Hiring

#### Hiring Plan for AI Team
```
cto: define hiring plan for {{number}} engineers to support agentic automation for clients

Context:
- Company stage: {{e.g., early startup, scaling, enterprise}}
- Product: {{e.g., AI orchestration platform}}
- Current team: {{e.g., 2 founders, 0 engineers}}
- Budget: {{e.g., $500k/year for salaries}}
- Timeline: {{e.g., hire over 6 months}}

Provide role definitions, hiring sequence, and team structure.
```

#### Role Definitions for AI Team
```
cto: define clear role boundaries and responsibilities for our AI team

Roles to define:
- {{e.g., ML Engineer, AI Product Manager, ML Ops, Research Engineer}}

For each role, provide:
- Responsibilities
- Required skills
- Success metrics
- Who they work with
- Career progression
```

#### Team Topology for AI Product
```
cto: recommend team structure for an AI product company with {{team_size}} people

Context:
- Product: {{e.g., multi-agent platform}}
- Current structure: {{e.g., flat, everyone does everything}}
- Pain points: {{e.g., unclear ownership, duplicate work, slow shipping}}
- Goal: {{e.g., clear ownership, faster iteration, quality}}

Provide team topology (platform, product, infra), reporting structure, and transition plan.
```

---

### 4. Build vs Buy Decisions

#### Fine-Tuning: Build or Use Vendor?
```
cto: should we build our own LLM fine-tuning pipeline or use a vendor?

Context:
- Use case: {{e.g., domain-specific BPM tasks}}
- Frequency: {{e.g., how many training runs per month?}}
- Team: {{e.g., do we have ML Ops expertise?}}
- Models: {{e.g., OpenAI, open-weight models like Llama}}
- Budget: {{e.g., what can we spend on infra vs vendor fees?}}
```

#### Embedding Model: Hosted or Self-Hosted?
```
cto: should we use OpenAI embeddings or self-host an open embedding model?

Context:
- Volume: {{e.g., 10M documents, 100M queries/month}}
- Budget: {{e.g., OpenAI would cost $X/month}}
- Requirements: {{e.g., multilingual, domain-specific, low latency}}
- Team: {{e.g., do we have infra for GPU inference?}}
```

#### Vector Database Selection
```
cto: compare vector databases for our RAG system: Pinecone vs Weaviate vs pgvector

Context:
- Data size: {{e.g., 100k vectors, 1M vectors, 100M vectors}}
- Query volume: {{e.g., 1k/day, 100k/day, 1M/day}}
- Features needed: {{e.g., filtering, hybrid search, multi-tenancy}}
- Budget: {{e.g., $500/month, $5k/month}}
- Team expertise: {{e.g., prefer managed service vs self-hosted}}
```

---

### 5. Product Strategy & Roadmap

#### Feature Prioritization
```
cto: help prioritize these features for our AI product roadmap:

Features:
1. {{e.g., Multi-tenant support}}
2. {{e.g., Advanced RAG with multi-hop reasoning}}
3. {{e.g., Fine-tuning capability}}
4. {{e.g., Voice interface}}
5. {{e.g., Enterprise SSO}}

Context:
- Current users: {{e.g., 5 pilot clients}}
- Goal: {{e.g., get to 20 paying clients in 6 months}}
- Team: {{e.g., 3 engineers}}
- Revenue model: {{e.g., $X per client per month}}

Provide prioritized backlog with reasoning.
```

#### Competitive Moat Strategy
```
cto: how should we build a defensible moat for our AI product?

Context:
- Product: {{e.g., BPM agent platform}}
- Competitors: {{e.g., generic LLM wrappers, enterprise AI platforms}}
- Our advantages: {{e.g., BPM domain expertise, existing client relationships}}
- Risks: {{e.g., easy to replicate, commoditization}}

Provide moat strategy: data, network effects, proprietary tech, vertical integration, etc.
```

#### Pricing & Packaging Strategy
```
cto: recommend pricing and packaging for our AI product

Context:
- Product: {{e.g., multi-agent platform}}
- Target customers: {{e.g., enterprise BPM teams, 100-1000 employees}}
- Value delivered: {{e.g., 30% efficiency gain, $X saved per year}}
- Cost structure: {{e.g., $Y per client per month in LLM costs}}
- Competitors: {{e.g., charge $Z per user per month}}

Provide pricing tiers, packaging (features per tier), and business model.
```

---

### 6. Technical Debt & Refactoring

#### Refactoring Decision
```
cto: should we refactor our agent orchestration codebase or keep building on the current architecture?

Context:
- Current pain points: {{e.g., hard to add new agents, bugs in context sharing, slow to deploy}}
- Technical debt: {{e.g., monolith, tight coupling, no tests}}
- Product pressure: {{e.g., need to ship 3 new features this quarter}}
- Team: {{e.g., 2 engineers, limited time}}

Provide recommendation: refactor now, incremental refactor, or ship features first.
```

#### Migration Planning
```
cto: plan a migration from {{old_system}} to {{new_system}}

Context:
- Old system: {{e.g., custom agent code with OpenAI API calls}}
- New system: {{e.g., LangGraph-based orchestration}}
- Constraints: {{e.g., can't have downtime, 10 clients in production}}
- Timeline: {{e.g., complete in 3 months}}

Provide migration phases, risk mitigation, and rollback plan.
```

---

### 7. Compliance & Security

#### SOC2 Preparation
```
cto: create a technical roadmap to achieve SOC2 compliance for our AI platform

Context:
- Product: {{e.g., multi-agent BPM platform}}
- Current state: {{e.g., early product, no formal security yet}}
- Timeline: {{e.g., need SOC2 in 6 months for enterprise sales}}
- Team: {{e.g., 3 engineers, no security expert}}

Provide checklist, tools (e.g., Vanta, Drata), and implementation plan.
```

#### Data Privacy & Compliance
```
cto: design a data privacy architecture for our AI product to comply with {{regulations}}

Context:
- Regulations: {{e.g., GDPR, CCPA, HIPAA, industry-specific}}
- Data handled: {{e.g., customer PII, financial data, health data}}
- Architecture: {{e.g., multi-tenant, client data isolation}}
- Requirements: {{e.g., data residency, encryption, audit logs}}

Provide architecture, compliance controls, and certification path.
```

---

### 8. Performance & Scaling

#### Latency Optimization
```
cto: our AI agent responses are too slow ({{current_latency}}). How do we optimize to {{target_latency}}?

Context:
- Current architecture: {{e.g., RAG + GPT-4 + 3 tool calls}}
- Bottlenecks: {{e.g., vector search, LLM inference, tool execution}}
- Volume: {{e.g., 1k requests/day, 100k requests/day}}
- Budget: {{e.g., can add caching, use faster models, optimize retrieval}}

Provide optimization strategy and expected latency gains.
```

#### Cost Optimization
```
cto: our LLM inference costs are {{current_cost}}/month. How do we reduce to {{target_cost}}/month?

Context:
- Current usage: {{e.g., 10M tokens/day, mostly GPT-4}}
- Use cases: {{e.g., agent routing, RAG, summarization}}
- Quality requirements: {{e.g., can't degrade user experience}}
- Options: {{e.g., prompt compression, caching, cheaper models for simple tasks}}

Provide cost optimization roadmap with expected savings.
```

#### Scaling Strategy
```
cto: how do we scale our AI platform from {{current_scale}} to {{target_scale}}?

Context:
- Current: {{e.g., 10 clients, 1k requests/day}}
- Target: {{e.g., 100 clients, 100k requests/day}}
- Timeline: {{e.g., 12 months}}
- Constraints: {{e.g., budget, team size, architecture limits}}

Provide scaling roadmap: infra, architecture changes, team growth.
```

---

## Multi-Skill Workflows

Some use cases benefit from **chaining CTO-Mentor with BPM skills**:

### Example 1: Plan AI-Powered BPM Platform
```
Step 1: Use CTO-Mentor to design the platform architecture
cto: design an AI platform for enterprise BPM with agent orchestration, RAG, and workflow automation

Step 2: Use BPM Transformation Partner to plan the go-to-market
Use the BPM Transformation Partner to create a 12-month GTM plan for selling this platform to Finance SSCs

Step 3: Use BPM Copywriter to write the product positioning
Use the BPM Copywriter to turn this architecture and GTM plan into a product landing page
```

### Example 2: Build and Train BPM AI Team
```
Step 1: Use CTO-Mentor to define the technical hiring plan
cto: define hiring plan for 5 engineers to build a BPM agent platform

Step 2: Use BPM Learning Designer to create onboarding for the new team
Use the BPM Learning Designer to create a 2-week onboarding program for new ML engineers joining our BPM AI team

Step 3: Use BPM Knowledge Guide to document the platform
Use the BPM Knowledge Guide to create internal documentation for our agent orchestration architecture
```

---

## When to Use CTO-Mentor vs Other Skills

| Task | Use This Skill | Not This |
|------|---------------|----------|
| Platform architecture decisions | CTO-Mentor | BPM Transformation Partner |
| Hiring ML engineers | CTO-Mentor | BPM Learning Designer |
| Build vs buy for AI tools | CTO-Mentor | BPM Knowledge Guide |
| BPM process roadmaps | BPM Transformation Partner | CTO-Mentor |
| Technical documentation | BPM Copywriter | CTO-Mentor |
| Training materials for BPM roles | BPM Learning Designer | CTO-Mentor |

**Rule of thumb**:
- **CTO-Mentor** → Technology, platform, architecture, AI/ML strategy
- **BPM skills** → Business process, domain knowledge, training, content

---

## Output Format You Can Expect

When you use CTO-Mentor, you'll always get:

1. **Brief diagnosis** (3-5 sentences) – Restate goal and constraints
2. **Recommended path** (2-3 options with trade-offs, then ONE recommendation)
3. **Concrete next steps** (checklist with phases, roles, timeline)
4. **Risks & mitigations** (what could go wrong and how to address it)

This ensures you get **actionable guidance**, not just theory.

---

## Customization Tips

### For Early-Stage Startups
Add this context:
```
Context:
- Stage: Pre-seed / Seed ({{funding amount}})
- Team: {{e.g., 2 founders, 0 engineers}}
- Constraints: Limited budget, need to ship fast, no legacy systems
```

### For Scaling Companies
Add this context:
```
Context:
- Stage: Series A/B ({{team size}} people)
- Product: {{e.g., established product with paying clients}}
- Constraints: Technical debt, need to maintain velocity while scaling
```

### For Enterprise
Add this context:
```
Context:
- Stage: Enterprise ({{revenue}}, {{team size}})
- Product: {{e.g., mature platform with complex requirements}}
- Constraints: Compliance (SOC2, GDPR), legacy integrations, governance
```

### For Philippines Context
Add this context:
```
Context:
- Team location: Philippines-based engineering team
- Considerations: Time zones, remote work, cost optimization, local talent pool
```

---

**Last Updated**: 2025-11-15
**Maintained By**: InsightPulseAI / OpEx Team
