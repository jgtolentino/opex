/**
 * OpEx Platform Configuration Schema
 *
 * This is the single source of truth for all platform configuration.
 * Uses Zod for runtime validation and TypeScript type generation.
 */

import { z } from 'zod'

/**
 * Metadata about the OpEx deployment
 */
const MetadataSchema = z.object({
  name: z.string().min(1),
  domain: z.string().min(1),
  author: z.string().optional(),
  description: z.string().optional(),
  language: z.string().default('en-US'),
  twitter: z.string().optional(),
  github: z.string().optional()
})

/**
 * Notion ID regex - accepts with or without hyphens
 * e.g., "7875426197cf461698809def95960ebf" or "78754261-97cf-4616-9880-9def95960ebf"
 */
const notionIdRegex = /^[0-9a-f]{32}$|^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * Web surface configuration (Next.js + Notion)
 */
const WebSurfaceSchema = z.object({
  type: z.literal('notion-renderer'),
  source: z.string().regex(notionIdRegex, 'Invalid Notion page ID format'),
  spaceId: z.string().regex(notionIdRegex, 'Invalid Notion space ID format').optional(),
  routes: z.record(z.string(), z.string()).optional(),
  features: z.object({
    isPreviewImageSupported: z.boolean().default(true),
    isSearchEnabled: z.boolean().default(true),
    isRedisEnabled: z.boolean().default(false),
    navigationStyle: z.enum(['default', 'custom']).default('default'),
    includeTweetEmbed: z.boolean().default(true),
    includeGitHubEmbed: z.boolean().default(true)
  }).optional()
})

/**
 * Docusaurus documentation surface
 */
const DocsSurfaceSchema = z.object({
  type: z.literal('docusaurus'),
  source: z.string(),
  port: z.number().int().positive().default(3001),
  buildDir: z.string().default('./docs/build')
})

/**
 * Voice agent surface
 */
const VoiceSurfaceSchema = z.object({
  type: z.literal('voice-agent'),
  source: z.string(),
  capabilities: z.array(z.string()),
  port: z.number().int().positive().default(8000)
})

/**
 * All surface configurations
 */
const SurfacesSchema = z.object({
  web: WebSurfaceSchema,
  docs: DocsSurfaceSchema.optional(),
  voice: VoiceSurfaceSchema.optional()
})

/**
 * RAG capability configuration
 */
const RAGCapabilitySchema = z.object({
  provider: z.enum(['openai', 'anthropic', 'local', 'hybrid']),
  assistants: z.record(
    z.string(),
    z.object({
      systemPrompt: z.string(),
      vectorStores: z.array(z.string()),
      model: z.string(),
      temperature: z.number().min(0).max(2).default(0.7),
      maxTokens: z.number().int().positive().optional(),
      topP: z.number().min(0).max(1).optional()
    })
  )
})

/**
 * Workflow automation capability
 */
const WorkflowCapabilitySchema = z.object({
  provider: z.enum(['temporal', 'n8n', 'none']),
  directory: z.string().optional(),
  webhookUrl: z.string().url().optional()
})

/**
 * BPM Skills capability
 */
const SkillsCapabilitySchema = z.object({
  registry: z.string(),
  orchestrator: z.string(),
  enabledSkills: z.array(z.string()).optional()
})

/**
 * All capability configurations
 */
const CapabilitiesSchema = z.object({
  rag: RAGCapabilitySchema.optional(),
  workflows: WorkflowCapabilitySchema.optional(),
  skills: SkillsCapabilitySchema.optional()
})

/**
 * External integration configuration
 */
const IntegrationSchema = z.object({
  endpoint: z.string().url().optional(),
  auth: z.string(), // Format: "env:VAR_NAME" or "secret:key"
  timeout: z.number().int().positive().default(30000),
  retries: z.number().int().nonnegative().default(3)
})

/**
 * Telemetry configuration
 */
const TelemetrySchema = z.object({
  analytics: z.array(z.enum(['fathom', 'posthog', 'plausible'])).optional(),
  logging: z.enum(['supabase', 'console', 'none']).default('console'),
  tracing: z.boolean().default(false),
  errorTracking: z.enum(['sentry', 'none']).default('none')
})

/**
 * Experimental features
 */
const ExperimentalSchema = z.object({
  useNewRAGArchitecture: z.boolean().default(false),
  enableSkillOrchestration: z.boolean().default(false),
  strictTypeValidation: z.boolean().default(true),
  parallelAgentExecution: z.boolean().default(false)
})

/**
 * Complete OpEx Platform Configuration Schema
 */
export const OpExConfigSchema = z.object({
  version: z.literal('3.0'),

  metadata: MetadataSchema,

  surfaces: SurfacesSchema,

  capabilities: CapabilitiesSchema,

  integrations: z.record(z.string(), IntegrationSchema),

  telemetry: TelemetrySchema,

  experimental: ExperimentalSchema.optional()
})

/**
 * TypeScript type inferred from schema
 */
export type OpExConfig = z.infer<typeof OpExConfigSchema>
export type Metadata = z.infer<typeof MetadataSchema>
export type WebSurface = z.infer<typeof WebSurfaceSchema>
export type DocsSurface = z.infer<typeof DocsSurfaceSchema>
export type VoiceSurface = z.infer<typeof VoiceSurfaceSchema>
export type RAGCapability = z.infer<typeof RAGCapabilitySchema>
export type WorkflowCapability = z.infer<typeof WorkflowCapabilitySchema>
export type SkillsCapability = z.infer<typeof SkillsCapabilitySchema>
export type Integration = z.infer<typeof IntegrationSchema>
export type Telemetry = z.infer<typeof TelemetrySchema>
export type Experimental = z.infer<typeof ExperimentalSchema>
