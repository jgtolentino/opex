/**
 * OpEx Core Configuration Module
 *
 * Single source of truth for platform configuration
 */

export {
  OpExConfigSchema,
  type OpExConfig,
  type Metadata,
  type WebSurface,
  type DocsSurface,
  type VoiceSurface,
  type RAGCapability,
  type WorkflowCapability,
  type SkillsCapability,
  type Integration,
  type Telemetry,
  type Experimental
} from './schema.js'

export {
  loadConfig,
  getConfigValue,
  hasCapability,
  hasSurface,
  getIntegrationAuth,
  ConfigValidationError
} from './loader.js'

export {
  validateConfig,
  formatValidationReport,
  checkEnvironment,
  type ValidationIssue,
  type ValidationResult
} from './validator.js'
