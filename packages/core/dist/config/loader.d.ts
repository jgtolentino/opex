/**
 * Configuration Loader
 *
 * Loads and validates opex.config.ts with intelligent defaults
 * and environment variable resolution.
 */
import { type OpExConfig } from './schema.js';
import { ZodError } from 'zod';
/**
 * Error thrown when configuration is invalid
 */
export declare class ConfigValidationError extends Error {
    readonly zodError?: ZodError | undefined;
    constructor(message: string, zodError?: ZodError | undefined);
}
/**
 * Load and validate OpEx configuration
 *
 * @param configPath - Path to config file (default: opex.config.ts)
 * @returns Validated configuration
 * @throws ConfigValidationError if validation fails
 */
export declare function loadConfig(configPath?: string): Promise<OpExConfig>;
/**
 * Get configuration value safely with type inference
 */
export declare function getConfigValue<T extends keyof OpExConfig>(config: OpExConfig, key: T): OpExConfig[T];
/**
 * Check if a capability is enabled
 */
export declare function hasCapability(config: OpExConfig, capability: 'rag' | 'workflows' | 'skills'): boolean;
/**
 * Check if a surface is enabled
 */
export declare function hasSurface(config: OpExConfig, surface: 'web' | 'docs' | 'voice'): boolean;
/**
 * Get integration auth token safely
 */
export declare function getIntegrationAuth(config: OpExConfig, integration: string): string | undefined;
//# sourceMappingURL=loader.d.ts.map