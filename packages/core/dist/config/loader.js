/**
 * Configuration Loader
 *
 * Loads and validates opex.config.ts with intelligent defaults
 * and environment variable resolution.
 */
import { pathToFileURL } from 'url';
import { resolve } from 'path';
import { OpExConfigSchema } from './schema.js';
import { ZodError } from 'zod';
/**
 * Error thrown when configuration is invalid
 */
export class ConfigValidationError extends Error {
    zodError;
    constructor(message, zodError) {
        super(message);
        this.zodError = zodError;
        this.name = 'ConfigValidationError';
    }
}
/**
 * Resolve auth value from environment or secret
 *
 * Supports formats:
 * - "env:VAR_NAME" → process.env.VAR_NAME
 * - "secret:key" → TODO: fetch from secret manager
 * - Direct value → returned as-is
 */
function resolveAuth(authSpec) {
    if (authSpec.startsWith('env:')) {
        const varName = authSpec.slice(4);
        const value = process.env[varName];
        if (!value) {
            throw new ConfigValidationError(`Environment variable "${varName}" is required but not set`);
        }
        return value;
    }
    if (authSpec.startsWith('secret:')) {
        // TODO: Implement secret manager integration
        throw new ConfigValidationError('Secret manager integration not yet implemented. Use env: instead.');
    }
    return authSpec;
}
/**
 * Resolve all auth specs in integrations
 */
function resolveIntegrations(integrations) {
    const resolved = {};
    for (const [key, integration] of Object.entries(integrations)) {
        resolved[key] = {
            ...integration,
            auth: resolveAuth(integration.auth)
        };
    }
    return resolved;
}
/**
 * Load configuration from file
 */
async function loadConfigFile(configPath) {
    try {
        const absolutePath = resolve(process.cwd(), configPath);
        const configUrl = pathToFileURL(absolutePath).href;
        const module = await import(configUrl);
        return module.default || module.config;
    }
    catch (error) {
        if (error.code === 'ERR_MODULE_NOT_FOUND') {
            throw new ConfigValidationError(`Configuration file not found: ${configPath}\n\n` +
                'Please create an opex.config.ts file in your project root.\n' +
                'See: https://docs.opex.dev/config for examples.');
        }
        throw new ConfigValidationError(`Failed to load configuration: ${error.message}`);
    }
}
/**
 * Validate and resolve configuration
 */
function validateConfig(rawConfig) {
    try {
        // Validate schema
        const parsed = OpExConfigSchema.parse(rawConfig);
        // Resolve environment variables and secrets
        const resolvedIntegrations = resolveIntegrations(parsed.integrations);
        return {
            ...parsed,
            integrations: resolvedIntegrations
        };
    }
    catch (error) {
        if (error instanceof ZodError) {
            const errorMessages = error.errors.map(err => {
                const path = err.path.join('.');
                return `  • ${path}: ${err.message}`;
            });
            throw new ConfigValidationError('Configuration validation failed:\n\n' +
                errorMessages.join('\n') +
                '\n\nSee: https://docs.opex.dev/config/reference', error);
        }
        throw error;
    }
}
/**
 * Load and validate OpEx configuration
 *
 * @param configPath - Path to config file (default: opex.config.ts)
 * @returns Validated configuration
 * @throws ConfigValidationError if validation fails
 */
export async function loadConfig(configPath = 'opex.config.ts') {
    const rawConfig = await loadConfigFile(configPath);
    return validateConfig(rawConfig);
}
/**
 * Get configuration value safely with type inference
 */
export function getConfigValue(config, key) {
    return config[key];
}
/**
 * Check if a capability is enabled
 */
export function hasCapability(config, capability) {
    return config.capabilities[capability] !== undefined;
}
/**
 * Check if a surface is enabled
 */
export function hasSurface(config, surface) {
    return config.surfaces[surface] !== undefined;
}
/**
 * Get integration auth token safely
 */
export function getIntegrationAuth(config, integration) {
    return config.integrations[integration]?.auth;
}
//# sourceMappingURL=loader.js.map