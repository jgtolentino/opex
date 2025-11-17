/**
 * OpEx Platform Runtime Configuration
 *
 * This is the single source of truth for all platform configuration.
 * Version: 3.0
 *
 * Migration from v2.0:
 * - Replaces site.config.ts
 * - Replaces lib/config.ts scattered config
 * - Consolidates all .env variables
 * - Provides type safety via Zod validation
 */

import type { OpExConfig } from './packages/core/config/schema.js'

const config: OpExConfig = {
  version: '3.0',

  // ============================================================================
  // Metadata - Basic site information
  // ============================================================================
  metadata: {
    name: 'OpEx Platform',
    domain: 'nextjs-notion-starter-kit.transitivebullsh.it',
    author: 'Jake Tolentino',
    description: 'Operational Excellence Platform - Finance SSC + BPM Automation',
    language: 'en-US',
    twitter: 'transitive_bs',
    github: 'jgtolentino/opex'
  },

  // ============================================================================
  // Surfaces - User-facing interfaces
  // ============================================================================
  surfaces: {
    // Primary web application (Next.js + Notion rendering)
    web: {
      type: 'notion-renderer',
      source: '7875426197cf461698809def95960ebf', // Root Notion page ID
      spaceId: undefined, // Optional: restrict to single workspace
      routes: {
        // Custom URL overrides (optional)
        // '/about': 'notion-page-id-here'
      },
      features: {
        isPreviewImageSupported: true,
        isSearchEnabled: true,
        isRedisEnabled: false,
        navigationStyle: 'default',
        includeTweetEmbed: true,
        includeGitHubEmbed: true
      }
    },

    // Documentation site (Docusaurus)
    docs: {
      type: 'docusaurus',
      source: './docs',
      port: 3001,
      buildDir: './docs/build'
    },

    // Voice agent (Python + OpenAI Agents SDK)
    voice: {
      type: 'voice-agent',
      source: './voice_agent.py',
      capabilities: ['rag', 'workflows', 'web_search'],
      port: 8000
    }
  },

  // ============================================================================
  // Capabilities - What the platform can do
  // ============================================================================
  capabilities: {
    // RAG (Retrieval-Augmented Generation) system
    rag: {
      provider: 'openai',
      assistants: {
        // OpEx Assistant - HR, Finance, Operations
        'opex': {
          systemPrompt: './config/opex_assistant_system_prompt.md',
          vectorStores: [
            'vs_policies',          // BIR forms, regulations
            'vs_sops_workflows',    // SOPs and workflows
            'vs_examples_systems'   // Templates and examples
          ],
          model: 'gpt-4-turbo',
          temperature: 0.7,
          maxTokens: 4000
        },

        // PH Tax Assistant - Philippine BIR compliance
        'ph-tax': {
          systemPrompt: './config/ph_tax_assistant_system_prompt.md',
          vectorStores: [
            'vs_policies'  // BIR forms and tax regulations
          ],
          model: 'gpt-4-turbo',
          temperature: 0.3,  // Lower temperature for factual tax advice
          maxTokens: 3000
        }
      }
    },

    // Workflow automation (currently n8n, future: Temporal)
    workflows: {
      provider: 'n8n',
      directory: './workflows/n8n',
      webhookUrl: undefined // Set if using n8n cloud
    },

    // BPM Agent Skills system
    skills: {
      registry: './skills',
      orchestrator: 'bpm-team-orchestrator',
      enabledSkills: [
        'bpm-analyst',
        'bpm-process-manager',
        'bpm-process-owner',
        'bpm-automation-dev',
        'bpm-coo'
      ]
    }
  },

  // ============================================================================
  // Integrations - External services
  // ============================================================================
  integrations: {
    // OpenAI - RAG, Voice, Embeddings
    openai: {
      auth: 'env:OPENAI_API_KEY',
      timeout: 60000, // 60s for long-running assistants
      retries: 3
    },

    // Supabase - Database, Edge Functions, Vector Storage
    supabase: {
      endpoint: 'env:NEXT_PUBLIC_SUPABASE_URL',
      auth: 'env:SUPABASE_SERVICE_ROLE_KEY',
      timeout: 30000,
      retries: 3
    },

    // Notion - Content source
    notion: {
      auth: 'env:NOTION_API_KEY',
      timeout: 30000,
      retries: 3
    },

    // Redis - Optional caching layer
    redis: {
      endpoint: 'env:REDIS_HOST',
      auth: 'env:REDIS_PASSWORD',
      timeout: 5000,
      retries: 2
    },

    // Odoo - ERP integration (future)
    odoo: {
      endpoint: 'env:ODOO_ENDPOINT',
      auth: 'env:ODOO_API_KEY',
      timeout: 30000,
      retries: 3
    }
  },

  // ============================================================================
  // Telemetry - Observability and analytics
  // ============================================================================
  telemetry: {
    analytics: ['fathom', 'posthog'],
    logging: 'supabase',
    tracing: false,
    errorTracking: 'none'
  },

  // ============================================================================
  // Experimental Features - Enable at your own risk
  // ============================================================================
  experimental: {
    useNewRAGArchitecture: false,      // Phase 2 feature
    enableSkillOrchestration: false,   // Phase 4 feature
    strictTypeValidation: true,        // Phase 3 feature
    parallelAgentExecution: false      // Phase 4 feature
  }
}

export default config
