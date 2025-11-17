/**
 * OpEx Core Configuration Module
 *
 * Single source of truth for platform configuration
 */
export { OpExConfigSchema } from './schema.js';
export { loadConfig, getConfigValue, hasCapability, hasSurface, getIntegrationAuth, ConfigValidationError } from './loader.js';
export { validateConfig, formatValidationReport, checkEnvironment } from './validator.js';
//# sourceMappingURL=index.js.map