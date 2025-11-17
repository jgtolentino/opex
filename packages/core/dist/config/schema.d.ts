/**
 * OpEx Platform Configuration Schema
 *
 * This is the single source of truth for all platform configuration.
 * Uses Zod for runtime validation and TypeScript type generation.
 */
import { z } from 'zod';
/**
 * Metadata about the OpEx deployment
 */
declare const MetadataSchema: z.ZodObject<{
    name: z.ZodString;
    domain: z.ZodString;
    author: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    language: z.ZodDefault<z.ZodString>;
    twitter: z.ZodOptional<z.ZodString>;
    github: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    domain: string;
    language: string;
    author?: string | undefined;
    description?: string | undefined;
    twitter?: string | undefined;
    github?: string | undefined;
}, {
    name: string;
    domain: string;
    author?: string | undefined;
    description?: string | undefined;
    language?: string | undefined;
    twitter?: string | undefined;
    github?: string | undefined;
}>;
/**
 * Web surface configuration (Next.js + Notion)
 */
declare const WebSurfaceSchema: z.ZodObject<{
    type: z.ZodLiteral<"notion-renderer">;
    source: z.ZodString;
    spaceId: z.ZodOptional<z.ZodString>;
    routes: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    features: z.ZodOptional<z.ZodObject<{
        isPreviewImageSupported: z.ZodDefault<z.ZodBoolean>;
        isSearchEnabled: z.ZodDefault<z.ZodBoolean>;
        isRedisEnabled: z.ZodDefault<z.ZodBoolean>;
        navigationStyle: z.ZodDefault<z.ZodEnum<["default", "custom"]>>;
        includeTweetEmbed: z.ZodDefault<z.ZodBoolean>;
        includeGitHubEmbed: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        isPreviewImageSupported: boolean;
        isSearchEnabled: boolean;
        isRedisEnabled: boolean;
        navigationStyle: "custom" | "default";
        includeTweetEmbed: boolean;
        includeGitHubEmbed: boolean;
    }, {
        isPreviewImageSupported?: boolean | undefined;
        isSearchEnabled?: boolean | undefined;
        isRedisEnabled?: boolean | undefined;
        navigationStyle?: "custom" | "default" | undefined;
        includeTweetEmbed?: boolean | undefined;
        includeGitHubEmbed?: boolean | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    type: "notion-renderer";
    source: string;
    spaceId?: string | undefined;
    routes?: Record<string, string> | undefined;
    features?: {
        isPreviewImageSupported: boolean;
        isSearchEnabled: boolean;
        isRedisEnabled: boolean;
        navigationStyle: "custom" | "default";
        includeTweetEmbed: boolean;
        includeGitHubEmbed: boolean;
    } | undefined;
}, {
    type: "notion-renderer";
    source: string;
    spaceId?: string | undefined;
    routes?: Record<string, string> | undefined;
    features?: {
        isPreviewImageSupported?: boolean | undefined;
        isSearchEnabled?: boolean | undefined;
        isRedisEnabled?: boolean | undefined;
        navigationStyle?: "custom" | "default" | undefined;
        includeTweetEmbed?: boolean | undefined;
        includeGitHubEmbed?: boolean | undefined;
    } | undefined;
}>;
/**
 * Docusaurus documentation surface
 */
declare const DocsSurfaceSchema: z.ZodObject<{
    type: z.ZodLiteral<"docusaurus">;
    source: z.ZodString;
    port: z.ZodDefault<z.ZodNumber>;
    buildDir: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "docusaurus";
    source: string;
    port: number;
    buildDir: string;
}, {
    type: "docusaurus";
    source: string;
    port?: number | undefined;
    buildDir?: string | undefined;
}>;
/**
 * Voice agent surface
 */
declare const VoiceSurfaceSchema: z.ZodObject<{
    type: z.ZodLiteral<"voice-agent">;
    source: z.ZodString;
    capabilities: z.ZodArray<z.ZodString, "many">;
    port: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    type: "voice-agent";
    source: string;
    port: number;
    capabilities: string[];
}, {
    type: "voice-agent";
    source: string;
    capabilities: string[];
    port?: number | undefined;
}>;
/**
 * RAG capability configuration
 */
declare const RAGCapabilitySchema: z.ZodObject<{
    provider: z.ZodEnum<["openai", "anthropic", "local", "hybrid"]>;
    assistants: z.ZodRecord<z.ZodString, z.ZodObject<{
        systemPrompt: z.ZodString;
        vectorStores: z.ZodArray<z.ZodString, "many">;
        model: z.ZodString;
        temperature: z.ZodDefault<z.ZodNumber>;
        maxTokens: z.ZodOptional<z.ZodNumber>;
        topP: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        systemPrompt: string;
        vectorStores: string[];
        model: string;
        temperature: number;
        maxTokens?: number | undefined;
        topP?: number | undefined;
    }, {
        systemPrompt: string;
        vectorStores: string[];
        model: string;
        temperature?: number | undefined;
        maxTokens?: number | undefined;
        topP?: number | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    provider: "openai" | "anthropic" | "local" | "hybrid";
    assistants: Record<string, {
        systemPrompt: string;
        vectorStores: string[];
        model: string;
        temperature: number;
        maxTokens?: number | undefined;
        topP?: number | undefined;
    }>;
}, {
    provider: "openai" | "anthropic" | "local" | "hybrid";
    assistants: Record<string, {
        systemPrompt: string;
        vectorStores: string[];
        model: string;
        temperature?: number | undefined;
        maxTokens?: number | undefined;
        topP?: number | undefined;
    }>;
}>;
/**
 * Workflow automation capability
 */
declare const WorkflowCapabilitySchema: z.ZodObject<{
    provider: z.ZodEnum<["temporal", "n8n", "none"]>;
    directory: z.ZodOptional<z.ZodString>;
    webhookUrl: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    provider: "temporal" | "n8n" | "none";
    directory?: string | undefined;
    webhookUrl?: string | undefined;
}, {
    provider: "temporal" | "n8n" | "none";
    directory?: string | undefined;
    webhookUrl?: string | undefined;
}>;
/**
 * BPM Skills capability
 */
declare const SkillsCapabilitySchema: z.ZodObject<{
    registry: z.ZodString;
    orchestrator: z.ZodString;
    enabledSkills: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    registry: string;
    orchestrator: string;
    enabledSkills?: string[] | undefined;
}, {
    registry: string;
    orchestrator: string;
    enabledSkills?: string[] | undefined;
}>;
/**
 * External integration configuration
 */
declare const IntegrationSchema: z.ZodObject<{
    endpoint: z.ZodOptional<z.ZodString>;
    auth: z.ZodString;
    timeout: z.ZodDefault<z.ZodNumber>;
    retries: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    auth: string;
    timeout: number;
    retries: number;
    endpoint?: string | undefined;
}, {
    auth: string;
    endpoint?: string | undefined;
    timeout?: number | undefined;
    retries?: number | undefined;
}>;
/**
 * Telemetry configuration
 */
declare const TelemetrySchema: z.ZodObject<{
    analytics: z.ZodOptional<z.ZodArray<z.ZodEnum<["fathom", "posthog", "plausible"]>, "many">>;
    logging: z.ZodDefault<z.ZodEnum<["supabase", "console", "none"]>>;
    tracing: z.ZodDefault<z.ZodBoolean>;
    errorTracking: z.ZodDefault<z.ZodEnum<["sentry", "none"]>>;
}, "strip", z.ZodTypeAny, {
    logging: "none" | "supabase" | "console";
    tracing: boolean;
    errorTracking: "none" | "sentry";
    analytics?: ("fathom" | "posthog" | "plausible")[] | undefined;
}, {
    analytics?: ("fathom" | "posthog" | "plausible")[] | undefined;
    logging?: "none" | "supabase" | "console" | undefined;
    tracing?: boolean | undefined;
    errorTracking?: "none" | "sentry" | undefined;
}>;
/**
 * Experimental features
 */
declare const ExperimentalSchema: z.ZodObject<{
    useNewRAGArchitecture: z.ZodDefault<z.ZodBoolean>;
    enableSkillOrchestration: z.ZodDefault<z.ZodBoolean>;
    strictTypeValidation: z.ZodDefault<z.ZodBoolean>;
    parallelAgentExecution: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    useNewRAGArchitecture: boolean;
    enableSkillOrchestration: boolean;
    strictTypeValidation: boolean;
    parallelAgentExecution: boolean;
}, {
    useNewRAGArchitecture?: boolean | undefined;
    enableSkillOrchestration?: boolean | undefined;
    strictTypeValidation?: boolean | undefined;
    parallelAgentExecution?: boolean | undefined;
}>;
/**
 * Complete OpEx Platform Configuration Schema
 */
export declare const OpExConfigSchema: z.ZodObject<{
    version: z.ZodLiteral<"3.0">;
    metadata: z.ZodObject<{
        name: z.ZodString;
        domain: z.ZodString;
        author: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        language: z.ZodDefault<z.ZodString>;
        twitter: z.ZodOptional<z.ZodString>;
        github: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        domain: string;
        language: string;
        author?: string | undefined;
        description?: string | undefined;
        twitter?: string | undefined;
        github?: string | undefined;
    }, {
        name: string;
        domain: string;
        author?: string | undefined;
        description?: string | undefined;
        language?: string | undefined;
        twitter?: string | undefined;
        github?: string | undefined;
    }>;
    surfaces: z.ZodObject<{
        web: z.ZodObject<{
            type: z.ZodLiteral<"notion-renderer">;
            source: z.ZodString;
            spaceId: z.ZodOptional<z.ZodString>;
            routes: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
            features: z.ZodOptional<z.ZodObject<{
                isPreviewImageSupported: z.ZodDefault<z.ZodBoolean>;
                isSearchEnabled: z.ZodDefault<z.ZodBoolean>;
                isRedisEnabled: z.ZodDefault<z.ZodBoolean>;
                navigationStyle: z.ZodDefault<z.ZodEnum<["default", "custom"]>>;
                includeTweetEmbed: z.ZodDefault<z.ZodBoolean>;
                includeGitHubEmbed: z.ZodDefault<z.ZodBoolean>;
            }, "strip", z.ZodTypeAny, {
                isPreviewImageSupported: boolean;
                isSearchEnabled: boolean;
                isRedisEnabled: boolean;
                navigationStyle: "custom" | "default";
                includeTweetEmbed: boolean;
                includeGitHubEmbed: boolean;
            }, {
                isPreviewImageSupported?: boolean | undefined;
                isSearchEnabled?: boolean | undefined;
                isRedisEnabled?: boolean | undefined;
                navigationStyle?: "custom" | "default" | undefined;
                includeTweetEmbed?: boolean | undefined;
                includeGitHubEmbed?: boolean | undefined;
            }>>;
        }, "strip", z.ZodTypeAny, {
            type: "notion-renderer";
            source: string;
            spaceId?: string | undefined;
            routes?: Record<string, string> | undefined;
            features?: {
                isPreviewImageSupported: boolean;
                isSearchEnabled: boolean;
                isRedisEnabled: boolean;
                navigationStyle: "custom" | "default";
                includeTweetEmbed: boolean;
                includeGitHubEmbed: boolean;
            } | undefined;
        }, {
            type: "notion-renderer";
            source: string;
            spaceId?: string | undefined;
            routes?: Record<string, string> | undefined;
            features?: {
                isPreviewImageSupported?: boolean | undefined;
                isSearchEnabled?: boolean | undefined;
                isRedisEnabled?: boolean | undefined;
                navigationStyle?: "custom" | "default" | undefined;
                includeTweetEmbed?: boolean | undefined;
                includeGitHubEmbed?: boolean | undefined;
            } | undefined;
        }>;
        docs: z.ZodOptional<z.ZodObject<{
            type: z.ZodLiteral<"docusaurus">;
            source: z.ZodString;
            port: z.ZodDefault<z.ZodNumber>;
            buildDir: z.ZodDefault<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            type: "docusaurus";
            source: string;
            port: number;
            buildDir: string;
        }, {
            type: "docusaurus";
            source: string;
            port?: number | undefined;
            buildDir?: string | undefined;
        }>>;
        voice: z.ZodOptional<z.ZodObject<{
            type: z.ZodLiteral<"voice-agent">;
            source: z.ZodString;
            capabilities: z.ZodArray<z.ZodString, "many">;
            port: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            type: "voice-agent";
            source: string;
            port: number;
            capabilities: string[];
        }, {
            type: "voice-agent";
            source: string;
            capabilities: string[];
            port?: number | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        web: {
            type: "notion-renderer";
            source: string;
            spaceId?: string | undefined;
            routes?: Record<string, string> | undefined;
            features?: {
                isPreviewImageSupported: boolean;
                isSearchEnabled: boolean;
                isRedisEnabled: boolean;
                navigationStyle: "custom" | "default";
                includeTweetEmbed: boolean;
                includeGitHubEmbed: boolean;
            } | undefined;
        };
        docs?: {
            type: "docusaurus";
            source: string;
            port: number;
            buildDir: string;
        } | undefined;
        voice?: {
            type: "voice-agent";
            source: string;
            port: number;
            capabilities: string[];
        } | undefined;
    }, {
        web: {
            type: "notion-renderer";
            source: string;
            spaceId?: string | undefined;
            routes?: Record<string, string> | undefined;
            features?: {
                isPreviewImageSupported?: boolean | undefined;
                isSearchEnabled?: boolean | undefined;
                isRedisEnabled?: boolean | undefined;
                navigationStyle?: "custom" | "default" | undefined;
                includeTweetEmbed?: boolean | undefined;
                includeGitHubEmbed?: boolean | undefined;
            } | undefined;
        };
        docs?: {
            type: "docusaurus";
            source: string;
            port?: number | undefined;
            buildDir?: string | undefined;
        } | undefined;
        voice?: {
            type: "voice-agent";
            source: string;
            capabilities: string[];
            port?: number | undefined;
        } | undefined;
    }>;
    capabilities: z.ZodObject<{
        rag: z.ZodOptional<z.ZodObject<{
            provider: z.ZodEnum<["openai", "anthropic", "local", "hybrid"]>;
            assistants: z.ZodRecord<z.ZodString, z.ZodObject<{
                systemPrompt: z.ZodString;
                vectorStores: z.ZodArray<z.ZodString, "many">;
                model: z.ZodString;
                temperature: z.ZodDefault<z.ZodNumber>;
                maxTokens: z.ZodOptional<z.ZodNumber>;
                topP: z.ZodOptional<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                systemPrompt: string;
                vectorStores: string[];
                model: string;
                temperature: number;
                maxTokens?: number | undefined;
                topP?: number | undefined;
            }, {
                systemPrompt: string;
                vectorStores: string[];
                model: string;
                temperature?: number | undefined;
                maxTokens?: number | undefined;
                topP?: number | undefined;
            }>>;
        }, "strip", z.ZodTypeAny, {
            provider: "openai" | "anthropic" | "local" | "hybrid";
            assistants: Record<string, {
                systemPrompt: string;
                vectorStores: string[];
                model: string;
                temperature: number;
                maxTokens?: number | undefined;
                topP?: number | undefined;
            }>;
        }, {
            provider: "openai" | "anthropic" | "local" | "hybrid";
            assistants: Record<string, {
                systemPrompt: string;
                vectorStores: string[];
                model: string;
                temperature?: number | undefined;
                maxTokens?: number | undefined;
                topP?: number | undefined;
            }>;
        }>>;
        workflows: z.ZodOptional<z.ZodObject<{
            provider: z.ZodEnum<["temporal", "n8n", "none"]>;
            directory: z.ZodOptional<z.ZodString>;
            webhookUrl: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            provider: "temporal" | "n8n" | "none";
            directory?: string | undefined;
            webhookUrl?: string | undefined;
        }, {
            provider: "temporal" | "n8n" | "none";
            directory?: string | undefined;
            webhookUrl?: string | undefined;
        }>>;
        skills: z.ZodOptional<z.ZodObject<{
            registry: z.ZodString;
            orchestrator: z.ZodString;
            enabledSkills: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            registry: string;
            orchestrator: string;
            enabledSkills?: string[] | undefined;
        }, {
            registry: string;
            orchestrator: string;
            enabledSkills?: string[] | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        rag?: {
            provider: "openai" | "anthropic" | "local" | "hybrid";
            assistants: Record<string, {
                systemPrompt: string;
                vectorStores: string[];
                model: string;
                temperature: number;
                maxTokens?: number | undefined;
                topP?: number | undefined;
            }>;
        } | undefined;
        workflows?: {
            provider: "temporal" | "n8n" | "none";
            directory?: string | undefined;
            webhookUrl?: string | undefined;
        } | undefined;
        skills?: {
            registry: string;
            orchestrator: string;
            enabledSkills?: string[] | undefined;
        } | undefined;
    }, {
        rag?: {
            provider: "openai" | "anthropic" | "local" | "hybrid";
            assistants: Record<string, {
                systemPrompt: string;
                vectorStores: string[];
                model: string;
                temperature?: number | undefined;
                maxTokens?: number | undefined;
                topP?: number | undefined;
            }>;
        } | undefined;
        workflows?: {
            provider: "temporal" | "n8n" | "none";
            directory?: string | undefined;
            webhookUrl?: string | undefined;
        } | undefined;
        skills?: {
            registry: string;
            orchestrator: string;
            enabledSkills?: string[] | undefined;
        } | undefined;
    }>;
    integrations: z.ZodRecord<z.ZodString, z.ZodObject<{
        endpoint: z.ZodOptional<z.ZodString>;
        auth: z.ZodString;
        timeout: z.ZodDefault<z.ZodNumber>;
        retries: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        auth: string;
        timeout: number;
        retries: number;
        endpoint?: string | undefined;
    }, {
        auth: string;
        endpoint?: string | undefined;
        timeout?: number | undefined;
        retries?: number | undefined;
    }>>;
    telemetry: z.ZodObject<{
        analytics: z.ZodOptional<z.ZodArray<z.ZodEnum<["fathom", "posthog", "plausible"]>, "many">>;
        logging: z.ZodDefault<z.ZodEnum<["supabase", "console", "none"]>>;
        tracing: z.ZodDefault<z.ZodBoolean>;
        errorTracking: z.ZodDefault<z.ZodEnum<["sentry", "none"]>>;
    }, "strip", z.ZodTypeAny, {
        logging: "none" | "supabase" | "console";
        tracing: boolean;
        errorTracking: "none" | "sentry";
        analytics?: ("fathom" | "posthog" | "plausible")[] | undefined;
    }, {
        analytics?: ("fathom" | "posthog" | "plausible")[] | undefined;
        logging?: "none" | "supabase" | "console" | undefined;
        tracing?: boolean | undefined;
        errorTracking?: "none" | "sentry" | undefined;
    }>;
    experimental: z.ZodOptional<z.ZodObject<{
        useNewRAGArchitecture: z.ZodDefault<z.ZodBoolean>;
        enableSkillOrchestration: z.ZodDefault<z.ZodBoolean>;
        strictTypeValidation: z.ZodDefault<z.ZodBoolean>;
        parallelAgentExecution: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        useNewRAGArchitecture: boolean;
        enableSkillOrchestration: boolean;
        strictTypeValidation: boolean;
        parallelAgentExecution: boolean;
    }, {
        useNewRAGArchitecture?: boolean | undefined;
        enableSkillOrchestration?: boolean | undefined;
        strictTypeValidation?: boolean | undefined;
        parallelAgentExecution?: boolean | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    capabilities: {
        rag?: {
            provider: "openai" | "anthropic" | "local" | "hybrid";
            assistants: Record<string, {
                systemPrompt: string;
                vectorStores: string[];
                model: string;
                temperature: number;
                maxTokens?: number | undefined;
                topP?: number | undefined;
            }>;
        } | undefined;
        workflows?: {
            provider: "temporal" | "n8n" | "none";
            directory?: string | undefined;
            webhookUrl?: string | undefined;
        } | undefined;
        skills?: {
            registry: string;
            orchestrator: string;
            enabledSkills?: string[] | undefined;
        } | undefined;
    };
    version: "3.0";
    metadata: {
        name: string;
        domain: string;
        language: string;
        author?: string | undefined;
        description?: string | undefined;
        twitter?: string | undefined;
        github?: string | undefined;
    };
    surfaces: {
        web: {
            type: "notion-renderer";
            source: string;
            spaceId?: string | undefined;
            routes?: Record<string, string> | undefined;
            features?: {
                isPreviewImageSupported: boolean;
                isSearchEnabled: boolean;
                isRedisEnabled: boolean;
                navigationStyle: "custom" | "default";
                includeTweetEmbed: boolean;
                includeGitHubEmbed: boolean;
            } | undefined;
        };
        docs?: {
            type: "docusaurus";
            source: string;
            port: number;
            buildDir: string;
        } | undefined;
        voice?: {
            type: "voice-agent";
            source: string;
            port: number;
            capabilities: string[];
        } | undefined;
    };
    integrations: Record<string, {
        auth: string;
        timeout: number;
        retries: number;
        endpoint?: string | undefined;
    }>;
    telemetry: {
        logging: "none" | "supabase" | "console";
        tracing: boolean;
        errorTracking: "none" | "sentry";
        analytics?: ("fathom" | "posthog" | "plausible")[] | undefined;
    };
    experimental?: {
        useNewRAGArchitecture: boolean;
        enableSkillOrchestration: boolean;
        strictTypeValidation: boolean;
        parallelAgentExecution: boolean;
    } | undefined;
}, {
    capabilities: {
        rag?: {
            provider: "openai" | "anthropic" | "local" | "hybrid";
            assistants: Record<string, {
                systemPrompt: string;
                vectorStores: string[];
                model: string;
                temperature?: number | undefined;
                maxTokens?: number | undefined;
                topP?: number | undefined;
            }>;
        } | undefined;
        workflows?: {
            provider: "temporal" | "n8n" | "none";
            directory?: string | undefined;
            webhookUrl?: string | undefined;
        } | undefined;
        skills?: {
            registry: string;
            orchestrator: string;
            enabledSkills?: string[] | undefined;
        } | undefined;
    };
    version: "3.0";
    metadata: {
        name: string;
        domain: string;
        author?: string | undefined;
        description?: string | undefined;
        language?: string | undefined;
        twitter?: string | undefined;
        github?: string | undefined;
    };
    surfaces: {
        web: {
            type: "notion-renderer";
            source: string;
            spaceId?: string | undefined;
            routes?: Record<string, string> | undefined;
            features?: {
                isPreviewImageSupported?: boolean | undefined;
                isSearchEnabled?: boolean | undefined;
                isRedisEnabled?: boolean | undefined;
                navigationStyle?: "custom" | "default" | undefined;
                includeTweetEmbed?: boolean | undefined;
                includeGitHubEmbed?: boolean | undefined;
            } | undefined;
        };
        docs?: {
            type: "docusaurus";
            source: string;
            port?: number | undefined;
            buildDir?: string | undefined;
        } | undefined;
        voice?: {
            type: "voice-agent";
            source: string;
            capabilities: string[];
            port?: number | undefined;
        } | undefined;
    };
    integrations: Record<string, {
        auth: string;
        endpoint?: string | undefined;
        timeout?: number | undefined;
        retries?: number | undefined;
    }>;
    telemetry: {
        analytics?: ("fathom" | "posthog" | "plausible")[] | undefined;
        logging?: "none" | "supabase" | "console" | undefined;
        tracing?: boolean | undefined;
        errorTracking?: "none" | "sentry" | undefined;
    };
    experimental?: {
        useNewRAGArchitecture?: boolean | undefined;
        enableSkillOrchestration?: boolean | undefined;
        strictTypeValidation?: boolean | undefined;
        parallelAgentExecution?: boolean | undefined;
    } | undefined;
}>;
/**
 * TypeScript type inferred from schema
 */
export type OpExConfig = z.infer<typeof OpExConfigSchema>;
export type Metadata = z.infer<typeof MetadataSchema>;
export type WebSurface = z.infer<typeof WebSurfaceSchema>;
export type DocsSurface = z.infer<typeof DocsSurfaceSchema>;
export type VoiceSurface = z.infer<typeof VoiceSurfaceSchema>;
export type RAGCapability = z.infer<typeof RAGCapabilitySchema>;
export type WorkflowCapability = z.infer<typeof WorkflowCapabilitySchema>;
export type SkillsCapability = z.infer<typeof SkillsCapabilitySchema>;
export type Integration = z.infer<typeof IntegrationSchema>;
export type Telemetry = z.infer<typeof TelemetrySchema>;
export type Experimental = z.infer<typeof ExperimentalSchema>;
export {};
//# sourceMappingURL=schema.d.ts.map