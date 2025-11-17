# OpEx Platform Runtime v3.0 - Implementation Plan

**Version:** 3.0.0
**Start Date:** 2025-11-17
**Target Completion:** 2025-12-29 (6 weeks)
**Architecture Lead:** The Architect
**Strategy:** Strangler Fig Pattern - Incrementally replace, never rewrite

---

## Executive Summary

Transform OpEx from "five integrated platforms" into "one platform runtime with five surfaces."

**Core Philosophy:**
> Every subsystem becomes a first-class capability declared in unified config.
> Every deployment becomes a single command.
> Every integration becomes a typed contract.

---

## Architecture Vision

### Current State (v2.0)
```
┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│  Next.js    │  │ Docusaurus  │  │  Supabase   │  │     n8n     │  │   Python    │
│   + Notion  │  │    Docs     │  │    Edge     │  │  Workflows  │  │   Voice     │
└──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘
       │                │                │                │                │
       └────────────────┴────────────────┴────────────────┴────────────────┘
                              37 Markdown Files
                         (Documentation as Glue)
```

### Target State (v3.0)
```
                          ┌─────────────────────────┐
                          │   opex.config.ts        │
                          │  (Single Source of      │
                          │   Truth)                │
                          └────────────┬────────────┘
                                       │
                    ┌──────────────────┼──────────────────┐
                    │                  │                  │
             ┌──────▼──────┐   ┌──────▼──────┐   ┌──────▼──────┐
             │  Surfaces   │   │ Capabilities│   │ Integrations│
             └──────┬──────┘   └──────┬──────┘   └──────┬──────┘
                    │                  │                  │
        ┌───────────┼───────┐         │         ┌────────┼────────┐
        │           │       │         │         │        │        │
   ┌────▼───┐  ┌───▼────┐  │    ┌────▼────┐   │   ┌────▼───┐ ┌──▼─────┐
   │  Web   │  │ Voice  │  │    │   RAG   │   │   │ Notion │ │ Odoo   │
   │(Notion)│  │ Agent  │  │    │Provider │   │   │  API   │ │  API   │
   └────────┘  └────────┘  │    └─────────┘   │   └────────┘ └────────┘
                            │                  │
                       ┌────▼────┐        ┌────▼────┐
                       │  Docs   │        │ Skills  │
                       │ (Docus) │        │Orchestr.│
                       └─────────┘        └─────────┘
```

**Key Difference:** Configuration replaces documentation as integration layer.

---

## Phase Breakdown

### Phase 1: Unified Configuration Service (Week 1)
**Goal:** Single source of truth for all configuration
**Duration:** 5 days
**Risk:** Medium (touches many files)

#### 1.1 Package Structure Setup
```
/packages/
  core/
    config/
      schema.ts           # Zod schemas
      loader.ts           # Config loading logic
      validator.ts        # Validation rules
      types.ts            # Generated TypeScript types
    index.ts              # Public API
    package.json
    tsconfig.json
```

#### 1.2 Config Schema Design
```typescript
// packages/core/config/schema.ts
import { z } from 'zod'

export const OpExConfigSchema = z.object({
  version: z.literal('3.0'),

  surfaces: z.object({
    web: z.object({
      type: z.literal('notion-renderer'),
      source: z.string().uuid(),
      routes: z.record(z.string()),
      features: z.object({
        isPreviewImageSupported: z.boolean().default(true),
        navigationStyle: z.enum(['default', 'custom']).default('default')
      }).optional()
    }),
    docs: z.object({
      type: z.literal('docusaurus'),
      source: z.string(),
      port: z.number().default(3001)
    }).optional(),
    voice: z.object({
      type: z.literal('voice-agent'),
      source: z.string(),
      capabilities: z.array(z.string())
    }).optional()
  }),

  capabilities: z.object({
    rag: z.object({
      provider: z.enum(['openai', 'anthropic', 'local', 'hybrid']),
      assistants: z.record(z.object({
        systemPrompt: z.string(),
        vectorStores: z.array(z.string()),
        model: z.string(),
        temperature: z.number().min(0).max(2).default(0.7)
      }))
    }).optional(),

    workflows: z.object({
      provider: z.enum(['temporal', 'n8n']),
      directory: z.string()
    }).optional(),

    skills: z.object({
      registry: z.string(),
      orchestrator: z.string()
    }).optional()
  }),

  integrations: z.record(z.object({
    endpoint: z.string().url().optional(),
    auth: z.string(),
    timeout: z.number().default(30000)
  })),

  telemetry: z.object({
    analytics: z.array(z.enum(['fathom', 'posthog'])).optional(),
    logging: z.string().default('supabase'),
    tracing: z.boolean().default(false)
  })
})

export type OpExConfig = z.infer<typeof OpExConfigSchema>
```

#### 1.3 Migration Strategy
- **Day 1-2:** Create `/packages/core`, define schemas, loader
- **Day 3:** Migrate `site.config.ts` + `lib/config.ts` → `opex.config.ts`
- **Day 4:** Replace all `process.env` access (38 files) with `config` imports
- **Day 5:** Add validation, tests, documentation

#### 1.4 Backwards Compatibility
Create adapter layer:
```typescript
// lib/config.ts (kept for compatibility)
import { config } from '@opex/core'

export const siteConfig = {
  rootNotionPageId: config.surfaces.web.source,
  name: config.metadata.name,
  domain: config.metadata.domain,
  // ... map old structure to new
}
```

#### 1.5 Success Metrics
- [ ] Zero direct `process.env` access outside config package
- [ ] `pnpm dev` fails fast with actionable errors if config invalid
- [ ] All existing tests pass
- [ ] Config file reduces from 5 files to 1

---

### Phase 2: RAG Provider Abstraction (Week 2)
**Goal:** Decouple OpenAI from business logic
**Duration:** 5 days
**Risk:** High (core functionality)

#### 2.1 Package Structure
```
/packages/
  rag/
    providers/
      base.ts             # RAGProvider interface
      openai.ts           # OpenAIProvider implementation
      anthropic.ts        # Placeholder for future
    orchestrator/
      index.ts            # RAGOrchestrator
      filters.ts          # Domain/process filtering
      telemetry.ts        # Query logging
    types.ts              # Shared types (protocol)
    index.ts
```

#### 2.2 Provider Interface
```typescript
// packages/rag/providers/base.ts
export interface RAGProvider {
  name: string

  query(request: RAGQueryProtocol): Promise<RAGResponseProtocol>

  embed(content: string): Promise<Embedding>

  healthCheck(): Promise<ProviderHealth>
}

export interface RAGQueryProtocol {
  assistant: string
  question: string
  domain?: Domain
  process?: string
  metadata?: Record<string, unknown>
}

export interface RAGResponseProtocol {
  answer: string
  citations: Citation[]
  metadata: ResponseMetadata
}
```

#### 2.3 Migration Strategy
- **Day 1:** Define provider interface + protocol types
- **Day 2:** Implement OpenAIProvider (extract from edge function)
- **Day 3:** Create RAGOrchestrator, wire to edge function
- **Day 4:** Move assistant configs to Supabase table
- **Day 5:** Update `ragClient.ts` to use new architecture

#### 2.4 Database Schema
```sql
-- Migration: 002_rag_assistants_config.sql
CREATE TABLE opex.rag_assistants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  provider TEXT NOT NULL CHECK (provider IN ('openai', 'anthropic', 'local')),
  system_prompt TEXT NOT NULL,
  vector_stores JSONB NOT NULL,
  model TEXT NOT NULL,
  temperature DECIMAL DEFAULT 0.7,
  routing_rules JSONB,
  version INTEGER NOT NULL DEFAULT 1,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_rag_assistants_active ON opex.rag_assistants (active);
```

#### 2.5 Success Metrics
- [ ] Can swap provider in config without code changes
- [ ] Assistant prompts editable in database (no deployment)
- [ ] All RAG tests pass with new architecture
- [ ] Response times unchanged or improved

---

### Phase 3: Type System Hardening (Week 3)
**Goal:** Eliminate `any`, validate all boundaries
**Duration:** 5 days
**Risk:** Low (additive changes)

#### 3.1 Domain Model Types
```typescript
// packages/core/types/domain.ts

// Branded types for safety
export type NotionPageId = string & { readonly __brand: 'NotionPageId' }
export type NotionSpaceId = string & { readonly __brand: 'NotionSpaceId' }
export type AssistantId = string & { readonly __brand: 'AssistantId' }

// Philippine tax forms
export type BIRForm = '1601-C' | '2550M' | '2550Q' | '1702' | '1701' | '1701Q'

// Agencies
export type Agency = 'RIM' | 'CKVC' | 'BOM' | 'AGENCY_4' | 'AGENCY_5' |
                     'AGENCY_6' | 'AGENCY_7' | 'AGENCY_8'

// Domain-to-Process mapping (exhaustive, type-safe)
export type ProcessByDomain = {
  hr: 'onboarding' | 'offboarding' | 'requisition' | 'performance_review'
  finance: 'expense' | 'month_end' | 'bank_reconciliation' | 'budget_planning'
  ops: 'procurement' | 'asset_management' | 'vendor_management'
  tax: 'bir_filing' | 'month_end' | 'quarterly_return' | 'annual_return'
  knowledge_base: never
}

export type Domain = keyof ProcessByDomain

// Discriminated union for type-safe domain/process pairing
export type DomainProcessPair<D extends Domain = Domain> = {
  domain: D
  process?: ProcessByDomain[D]
}
```

#### 3.2 Runtime Validation
```typescript
// packages/core/validation/schemas.ts
import { z } from 'zod'

export const CitationSchema = z.object({
  id: z.string(),
  fileName: z.string(),
  pageNumber: z.number().optional(),
  snippet: z.string(),
  score: z.number().min(0).max(1).optional()
})

export const TokenUsageSchema = z.object({
  prompt: z.number().int().nonnegative(),
  completion: z.number().int().nonnegative(),
  total: z.number().int().nonnegative()
})

export const RAGResponseSchema = z.object({
  answer: z.string().min(1),
  citations: z.array(CitationSchema),
  metadata: z.object({
    assistantId: z.string(),
    threadId: z.string(),
    runId: z.string(),
    tokensUsed: TokenUsageSchema.optional(),
    responseTimeMs: z.number().int().positive(),
    model: z.string()
  })
})

export type Citation = z.infer<typeof CitationSchema>
export type TokenUsage = z.infer<typeof TokenUsageSchema>
export type RAGResponse = z.infer<typeof RAGResponseSchema>
```

#### 3.3 Safe HTTP Client
```typescript
// packages/core/utils/http.ts
import { z } from 'zod'

export async function fetchJson<T extends z.ZodType>(
  url: string,
  schema: T,
  options?: RequestInit
): Promise<z.infer<T>> {
  const response = await fetch(url, options)

  if (!response.ok) {
    throw new HttpError(response.status, response.statusText)
  }

  const data = await response.json()
  return schema.parse(data) // Runtime validation
}
```

#### 3.4 Migration Strategy
- **Day 1:** Define domain models, branded types
- **Day 2:** Create Zod schemas for all external data
- **Day 3:** Replace `any` in `/lib` (38 occurrences)
- **Day 4:** Add validation to API routes, edge functions
- **Day 5:** Enable TypeScript strict mode, fix errors

#### 3.5 Success Metrics
- [ ] Zero `any` types in core packages
- [ ] All external boundaries validated (API responses, env vars)
- [ ] TypeScript strict mode enabled
- [ ] Compile-time prevention of invalid domain/process pairs

---

### Phase 4: Skill Orchestration Runtime (Weeks 4-5)
**Goal:** Turn markdown specs into executable workflows
**Duration:** 10 days
**Risk:** High (new subsystem)

#### 4.1 Package Structure
```
/packages/
  skills/
    registry/
      index.ts            # Skill registry service
      loader.ts           # Load skills from filesystem
      validator.ts        # Validate skill definitions
    orchestrator/
      planner.ts          # Intent → workflow planning
      executor.ts         # Execute workflow steps
      state.ts            # Conversation state management
    types.ts              # Skill protocol types
```

#### 4.2 Skill Definition Format (YAML)
```yaml
# skills/bpm-analyst/skill.yaml
skill: bpm-analyst
version: 1.0.0
metadata:
  title: BPM Process Analyst
  description: Expert in process analysis, bottleneck identification, ROI calculation
  category: bpm

capabilities:
  - analyze_process
  - calculate_roi
  - identify_bottlenecks
  - recommend_improvements

runtime:
  model: gpt-4-turbo
  temperature: 0.3
  maxTokens: 4000
  tools:
    - supabase_query
    - odoo_api
    - web_search

dependencies:
  - skill: bpm-process-manager
    reason: "Requires real-time process data"
    optional: false

contracts:
  input:
    processName: string
    focusAreas:
      type: array
      items: string
    timeRange:
      type: string
      format: date-range

  output:
    analysis:
      type: object
      properties:
        bottlenecks: { type: array }
        metrics: { type: object }
        roi: { type: number }
    recommendations:
      type: array
      items: string

prompts:
  system: |
    You are a BPM Process Analyst with expertise in:
    - Lean Six Sigma methodologies
    - Process mining and analysis
    - ROI calculation for automation initiatives

    Your goal: Identify inefficiencies and quantify improvement opportunities.

  examples:
    - input: { processName: "month_end_close", focusAreas: ["speed", "accuracy"] }
      output: { analysis: {...}, recommendations: [...] }
```

#### 4.3 Orchestrator Architecture
```typescript
// packages/skills/orchestrator/planner.ts

export class WorkflowPlanner {
  async createExecutionPlan(
    intent: string,
    context: ConversationContext
  ): Promise<ExecutionPlan> {
    // Step 1: Classify intent using GPT-4
    const classification = await this.classifyIntent(intent)

    // Step 2: Select skills from registry
    const skills = await this.selectSkills(classification)

    // Step 3: Build dependency graph
    const graph = this.buildDependencyGraph(skills)

    // Step 4: Optimize for parallelization
    const plan = this.optimizeExecution(graph)

    return plan
  }

  private buildDependencyGraph(skills: Skill[]): DependencyGraph {
    // Analyze skill dependencies, detect cycles
    // Return DAG (Directed Acyclic Graph)
  }

  private optimizeExecution(graph: DependencyGraph): ExecutionPlan {
    // Identify parallelizable steps
    // Sequence dependent steps
    // Return optimized plan
  }
}
```

#### 4.4 Edge Function Integration
```typescript
// supabase/functions/skill-orchestrator/index.ts

import { createClient } from '@supabase/supabase-js'
import { WorkflowPlanner } from '@opex/skills/orchestrator'
import { WorkflowExecutor } from '@opex/skills/executor'

Deno.serve(async (req) => {
  const { query, context } = await req.json()

  // Step 1: Create execution plan
  const planner = new WorkflowPlanner(registry)
  const plan = await planner.createExecutionPlan(query, context)

  // Step 2: Execute workflow
  const executor = new WorkflowExecutor({
    stateStore: redisClient,
    telemetry: supabaseClient
  })

  const result = await executor.run(plan, {
    streaming: true,
    onProgress: (step) => {
      // Send SSE update to client
    }
  })

  // Step 3: Log execution
  await supabaseClient.from('skill_executions').insert({
    plan_id: plan.id,
    skills_invoked: plan.steps.map(s => s.skillId),
    duration_ms: result.duration,
    tokens_used: result.totalTokens,
    success: result.success
  })

  return new Response(JSON.stringify(result), {
    headers: { 'Content-Type': 'application/json' }
  })
})
```

#### 4.5 Database Schema
```sql
-- Migration: 003_skill_orchestration.sql

CREATE TABLE opex.skills (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  version TEXT NOT NULL,
  metadata JSONB NOT NULL,
  capabilities JSONB NOT NULL,
  runtime JSONB NOT NULL,
  dependencies JSONB,
  contracts JSONB NOT NULL,
  prompts JSONB NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE opex.skill_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id TEXT NOT NULL,
  user_id TEXT,
  query TEXT NOT NULL,
  skills_invoked JSONB NOT NULL,
  execution_trace JSONB,
  duration_ms INTEGER,
  tokens_used INTEGER,
  success BOOLEAN,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_skill_executions_created ON opex.skill_executions (created_at DESC);
```

#### 4.6 Migration Strategy
- **Days 1-2:** Define skill YAML format, create registry
- **Days 3-4:** Build WorkflowPlanner with intent classification
- **Days 5-6:** Build WorkflowExecutor with state management
- **Days 7-8:** Create skill-orchestrator edge function
- **Days 9-10:** Integrate with Next.js chat + voice agent

#### 4.7 Success Metrics
- [ ] Natural language → multi-skill workflow (no hardcoded routing)
- [ ] Skills execute in parallel where possible
- [ ] Conversation state preserved across agents
- [ ] <2s latency for simple queries, <10s for complex workflows

---

### Phase 5: Platform CLI (Week 6)
**Goal:** `opex dev` / `opex deploy` unifies all operations
**Duration:** 5 days
**Risk:** Low (developer tooling)

#### 5.1 Package Structure
```
/packages/
  cli/
    commands/
      dev.ts              # opex dev
      deploy.ts           # opex deploy
      config.ts           # opex config validate|doctor
      skills.ts           # opex skills list|deploy
      db.ts               # opex db migrate|seed
    utils/
      orchestrator.ts     # Service orchestration
      logger.ts           # CLI logging
    index.ts              # CLI entry point
```

#### 5.2 CLI Commands
```typescript
// packages/cli/commands/dev.ts
import { Command } from 'commander'
import { spawn } from 'child_process'
import { loadConfig } from '@opex/core/config'

export const devCommand = new Command('dev')
  .description('Start OpEx platform in development mode')
  .option('-p, --port <port>', 'Port for Next.js', '3000')
  .option('--no-docs', 'Skip Docusaurus')
  .option('--no-functions', 'Skip Supabase functions')
  .action(async (options) => {
    const config = await loadConfig()

    console.log('🚀 Starting OpEx Platform Runtime...\n')

    // Start Next.js
    const nextjs = spawn('pnpm', ['next', 'dev', '-p', options.port], {
      stdio: 'inherit'
    })

    // Start Docusaurus (if enabled)
    if (options.docs && config.surfaces.docs) {
      const docs = spawn('pnpm', ['--filter', 'docs', 'start'], {
        stdio: 'inherit'
      })
    }

    // Start Supabase locally (if functions enabled)
    if (options.functions) {
      const supabase = spawn('supabase', ['functions', 'serve'], {
        stdio: 'inherit'
      })
    }

    // Start voice agent (if configured)
    if (config.surfaces.voice) {
      const voice = spawn('python', ['voice_agent.py'], {
        stdio: 'inherit'
      })
    }

    console.log('\n✅ OpEx Platform Runtime started!')
    console.log(`\n📍 Services:`)
    console.log(`   Web:   http://localhost:${options.port}`)
    console.log(`   Docs:  http://localhost:3001`)
    console.log(`   API:   http://localhost:54321`)

    // Graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n\n🛑 Shutting down...')
      nextjs.kill()
      docs?.kill()
      supabase?.kill()
      voice?.kill()
      process.exit(0)
    })
  })
```

#### 5.3 Config Validation Command
```typescript
// packages/cli/commands/config.ts

export const configCommand = new Command('config')
  .description('Manage OpEx configuration')

configCommand
  .command('validate')
  .description('Validate opex.config.ts')
  .action(async () => {
    try {
      const config = await loadConfig()
      console.log('✅ Configuration is valid')
    } catch (error) {
      console.error('❌ Configuration validation failed:')
      if (error instanceof z.ZodError) {
        error.errors.forEach(err => {
          console.error(`  - ${err.path.join('.')}: ${err.message}`)
        })
      }
      process.exit(1)
    }
  })

configCommand
  .command('doctor')
  .description('Check environment and dependencies')
  .action(async () => {
    console.log('🔍 Running OpEx health checks...\n')

    // Check Node version
    const nodeVersion = process.version
    console.log(`Node.js: ${nodeVersion} ${nodeVersion >= 'v18' ? '✅' : '❌'}`)

    // Check pnpm
    const pnpmVersion = execSync('pnpm --version').toString().trim()
    console.log(`pnpm: ${pnpmVersion} ✅`)

    // Check environment variables
    const config = await loadConfig()
    console.log(`\n📋 Configuration:`)
    console.log(`   Surfaces: ${Object.keys(config.surfaces).join(', ')}`)
    console.log(`   Capabilities: ${Object.keys(config.capabilities).join(', ')}`)
    console.log(`   Integrations: ${Object.keys(config.integrations).join(', ')}`)

    // Check database connectivity
    if (config.integrations.supabase) {
      try {
        const supabase = createClient(
          config.integrations.supabase.endpoint,
          config.integrations.supabase.auth
        )
        await supabase.from('rag_queries').select('count').limit(1)
        console.log(`\n🗄️  Database: Connected ✅`)
      } catch (error) {
        console.log(`\n🗄️  Database: Connection failed ❌`)
      }
    }

    // Check OpenAI API
    if (config.capabilities.rag?.provider === 'openai') {
      try {
        const openai = new OpenAI({ apiKey: config.integrations.openai.auth })
        await openai.models.list()
        console.log(`🤖 OpenAI API: Connected ✅`)
      } catch (error) {
        console.log(`🤖 OpenAI API: Connection failed ❌`)
      }
    }
  })
```

#### 5.4 Deployment Command
```typescript
// packages/cli/commands/deploy.ts

export const deployCommand = new Command('deploy')
  .description('Deploy OpEx platform to production')
  .option('--env <environment>', 'Target environment', 'production')
  .option('--skip-build', 'Skip build step')
  .option('--dry-run', 'Show what would be deployed')
  .action(async (options) => {
    const config = await loadConfig()

    console.log(`🚀 Deploying OpEx to ${options.env}...\n`)

    // Build phase
    if (!options.skipBuild) {
      console.log('📦 Building...')
      execSync('pnpm build', { stdio: 'inherit' })
    }

    // Deploy Next.js to Vercel
    console.log('\n📤 Deploying Next.js app...')
    execSync('vercel deploy --prod', { stdio: 'inherit' })

    // Deploy Supabase functions
    if (config.capabilities.rag || config.capabilities.skills) {
      console.log('\n📤 Deploying Supabase functions...')

      if (config.capabilities.rag) {
        execSync('supabase functions deploy opex-rag-query', { stdio: 'inherit' })
      }

      if (config.capabilities.skills) {
        execSync('supabase functions deploy skill-orchestrator', { stdio: 'inherit' })
      }
    }

    // Deploy Docusaurus (if configured)
    if (config.surfaces.docs) {
      console.log('\n📤 Deploying documentation...')
      execSync('pnpm --filter docs deploy', { stdio: 'inherit' })
    }

    console.log('\n✅ Deployment complete!')
    console.log('\n📍 Live URLs:')
    console.log(`   App:  https://${config.metadata.domain}`)
    console.log(`   Docs: https://docs.${config.metadata.domain}`)
  })
```

#### 5.5 Success Metrics
- [ ] `opex dev` starts all services with one command
- [ ] `opex deploy` deploys entire platform
- [ ] `opex config doctor` catches common setup issues
- [ ] CLI provides actionable error messages

---

## Testing Strategy

### Unit Tests
```
/packages/
  core/
    __tests__/
      config.test.ts
      validation.test.ts
  rag/
    __tests__/
      providers.test.ts
      orchestrator.test.ts
  skills/
    __tests__/
      planner.test.ts
      executor.test.ts
```

**Framework:** Vitest
**Coverage Target:** >80%

### Integration Tests
```
/tests/
  integration/
    rag-query.test.ts          # End-to-end RAG flow
    skill-orchestration.test.ts # Multi-agent workflows
    config-loading.test.ts      # Config validation
```

**Strategy:** Use test Supabase instance, mock OpenAI calls

### E2E Tests
```
/tests/
  e2e/
    user-flows.spec.ts         # Playwright tests
    voice-agent.spec.ts        # Voice interaction tests
```

**Framework:** Playwright

---

## Migration & Rollback Plan

### Incremental Migration (Safe)
Each phase can be rolled out independently:

**Phase 1 → Phase 2:**
- Config changes only, no runtime behavior changes
- Old config files remain as adapters
- Can revert by removing `/packages/core`, restoring old config

**Phase 2 → Phase 3:**
- RAG requests flow through new architecture
- Old edge function kept as fallback
- Feature flag: `USE_NEW_RAG_ARCHITECTURE`

**Phase 3 → Phase 4:**
- Type changes are compile-time only
- No runtime impact
- Can incrementally adopt strict types

**Phase 4 → Phase 5:**
- Skill orchestration is new capability
- Doesn't affect existing features
- Can disable via config: `capabilities.skills = null`

### Rollback Triggers
1. Response time degradation >50%
2. Error rate increase >5%
3. User-reported regressions
4. Failed smoke tests

### Feature Flags
```typescript
// opex.config.ts
experimental: {
  useNewRAGArchitecture: true,
  enableSkillOrchestration: false,
  strictTypeValidation: true
}
```

---

## Success Metrics Dashboard

### Development Metrics
- Lines of documentation required: 1000 → 200 (80% reduction)
- Files to configure deployment: 12 → 1 (92% reduction)
- Commands to start platform: 5 → 1 (80% reduction)
- Time to add new assistant: 30min → 2min (93% faster)

### Runtime Metrics
- Type safety coverage: 60% → 95%
- API error rate: <1%
- RAG query latency: p95 <5s
- Skill orchestration latency: p95 <10s

### Developer Experience
- Onboarding time: 2-3 days → 4 hours
- Config error time-to-resolution: 30min → 2min
- Deployment confidence: Manual checklist → Automated validation

---

## Risk Mitigation

### High-Risk Items
1. **Phase 2: RAG Refactor**
   - Mitigation: Feature flag, A/B test, keep old function
   - Rollback: Single config change

2. **Phase 4: Skill Orchestration**
   - Mitigation: Build as opt-in capability, extensive testing
   - Rollback: Disable in config

### Medium-Risk Items
1. **Phase 1: Config Migration**
   - Mitigation: Adapter layer for backwards compatibility
   - Testing: Verify all existing features work

### Low-Risk Items
1. **Phase 3: Type Hardening** - Compile-time only
2. **Phase 5: CLI** - Developer tooling, doesn't affect runtime

---

## Documentation Strategy

### Generated Documentation
- Config schema → Markdown reference (auto-generated)
- Skill contracts → API documentation
- Type definitions → TypeScript docs

### Human Documentation
- `ARCHITECTURE.md` - High-level vision
- `MIGRATION_GUIDE.md` - v2 → v3 upgrade path
- `DEVELOPER_GUIDE.md` - Onboarding for new developers

### Sunset Old Docs
- Archive 30+ root-level markdown files
- Create `/docs/archive/v2/` for historical reference
- Update README to point to new structure

---

## Timeline

```
Week 1: Phase 1 - Unified Config
├─ Days 1-2: Package setup, schema definition
├─ Days 3-4: Migration, adapter layer
└─ Day 5: Testing, documentation

Week 2: Phase 2 - RAG Provider Abstraction
├─ Days 1-2: Provider interface, OpenAI implementation
├─ Days 3-4: Orchestrator, database migration
└─ Day 5: Integration, testing

Week 3: Phase 3 - Type System Hardening
├─ Days 1-2: Domain models, Zod schemas
├─ Days 3-4: Replace `any`, add validation
└─ Day 5: Strict mode, testing

Week 4-5: Phase 4 - Skill Orchestration
├─ Days 1-2: Skill registry, YAML format
├─ Days 3-4: WorkflowPlanner
├─ Days 5-6: WorkflowExecutor
├─ Days 7-8: Edge function, database
└─ Days 9-10: Integration, testing

Week 6: Phase 5 - Platform CLI
├─ Days 1-2: dev, deploy commands
├─ Days 3-4: config, skills commands
└─ Day 5: Testing, documentation

Ongoing: Documentation, testing, refinement
```

---

## Stakeholder Communication

### Weekly Status Updates
- Progress against plan
- Blockers and risks
- Demonstrations of new capabilities

### Demo Schedule
- End of Week 1: Config validation in action
- End of Week 2: Swap RAG providers live
- End of Week 3: Type-safe API calls
- End of Week 5: Multi-agent skill workflow
- End of Week 6: Single-command deployment

---

## Post-Launch Plan

### Week 7: Stabilization
- Monitor metrics
- Fix bugs
- Optimize performance
- User feedback collection

### Week 8: Documentation Polish
- Video tutorials
- Interactive examples
- Migration assistance for external users

### Week 9+: Community & Extensions
- Open-source packages separately
- Plugin system for capabilities
- Third-party skill marketplace

---

## The Architect's Commitment

> This plan transforms complexity into clarity.
> Every line of code will feel inevitable.
> Every abstraction will feel natural.
> The result will make competitors weep.

**Let's build the future.**

---

**Next Step:** Begin Phase 1 - Unified Configuration Service
