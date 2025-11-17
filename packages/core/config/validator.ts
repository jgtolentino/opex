/**
 * Configuration Validator
 *
 * Provides detailed validation and health checking for OpEx configuration
 */

import type { OpExConfig } from './schema.js'

export interface ValidationIssue {
  severity: 'error' | 'warning' | 'info'
  path: string
  message: string
  suggestion?: string
}

export interface ValidationResult {
  valid: boolean
  issues: ValidationIssue[]
}

/**
 * Validate configuration and provide actionable feedback
 */
export function validateConfig(config: OpExConfig): ValidationResult {
  const issues: ValidationIssue[] = []

  // Check for common misconfigurations
  checkRAGConfiguration(config, issues)
  checkIntegrations(config, issues)
  checkSurfaceConsistency(config, issues)
  checkExperimentalFeatures(config, issues)

  return {
    valid: !issues.some(issue => issue.severity === 'error'),
    issues
  }
}

function checkRAGConfiguration(config: OpExConfig, issues: ValidationIssue[]): void {
  if (!config.capabilities.rag) return

  const rag = config.capabilities.rag

  // Check if OpenAI provider has necessary integration
  if (rag.provider === 'openai' && !config.integrations['openai']) {
    issues.push({
      severity: 'error',
      path: 'capabilities.rag.provider',
      message: 'OpenAI provider selected but no OpenAI integration configured',
      suggestion: 'Add openai to integrations with auth: "env:OPENAI_API_KEY"'
    })
  }

  // Check if assistants have valid vector stores
  for (const [assistantId, assistant] of Object.entries(rag.assistants)) {
    if (assistant.vectorStores.length === 0) {
      issues.push({
        severity: 'warning',
        path: `capabilities.rag.assistants.${assistantId}.vectorStores`,
        message: 'Assistant has no vector stores configured',
        suggestion: 'Add at least one vector store ID for document retrieval'
      })
    }

    // Check temperature bounds
    if (assistant.temperature > 1.5) {
      issues.push({
        severity: 'warning',
        path: `capabilities.rag.assistants.${assistantId}.temperature`,
        message: `High temperature (${assistant.temperature}) may produce inconsistent results`,
        suggestion: 'Consider using 0.3-0.7 for factual Q&A tasks'
      })
    }
  }
}

function checkIntegrations(config: OpExConfig, issues: ValidationIssue[]): void {
  for (const [name, integration] of Object.entries(config.integrations)) {
    // Check if auth is env: but variable doesn't exist
    if (integration.auth.startsWith('env:')) {
      const varName = integration.auth.slice(4)
      if (!process.env[varName]) {
        issues.push({
          severity: 'error',
          path: `integrations.${name}.auth`,
          message: `Environment variable ${varName} is not set`,
          suggestion: `Set ${varName} in your .env file or environment`
        })
      }
    }

    // Check timeout values
    if (integration.timeout < 1000) {
      issues.push({
        severity: 'warning',
        path: `integrations.${name}.timeout`,
        message: `Very short timeout (${integration.timeout}ms) may cause frequent failures`,
        suggestion: 'Consider using at least 5000ms for external API calls'
      })
    }
  }
}

function checkSurfaceConsistency(config: OpExConfig, issues: ValidationIssue[]): void {
  // Check if docs surface exists but no source directory
  if (config.surfaces.docs && !config.surfaces.docs.source) {
    issues.push({
      severity: 'error',
      path: 'surfaces.docs.source',
      message: 'Docs surface enabled but no source directory specified',
      suggestion: 'Set source to "./docs" or your documentation directory'
    })
  }

  // Check if voice surface has capabilities that aren't enabled
  if (config.surfaces.voice) {
    for (const capability of config.surfaces.voice.capabilities) {
      if (capability === 'rag' && !config.capabilities.rag) {
        issues.push({
          severity: 'error',
          path: 'surfaces.voice.capabilities',
          message: 'Voice surface requires RAG capability but it is not enabled',
          suggestion: 'Enable capabilities.rag or remove "rag" from voice.capabilities'
        })
      }

      if (capability === 'skills' && !config.capabilities.skills) {
        issues.push({
          severity: 'error',
          path: 'surfaces.voice.capabilities',
          message: 'Voice surface requires skills capability but it is not enabled',
          suggestion: 'Enable capabilities.skills or remove "skills" from voice.capabilities'
        })
      }
    }
  }
}

function checkExperimentalFeatures(config: OpExConfig, issues: ValidationIssue[]): void {
  if (!config.experimental) return

  if (config.experimental.useNewRAGArchitecture) {
    issues.push({
      severity: 'info',
      path: 'experimental.useNewRAGArchitecture',
      message: 'Using experimental RAG architecture',
      suggestion: 'Monitor performance and error rates closely'
    })
  }

  if (config.experimental.enableSkillOrchestration && !config.capabilities.skills) {
    issues.push({
      severity: 'warning',
      path: 'experimental.enableSkillOrchestration',
      message: 'Skill orchestration enabled but skills capability not configured',
      suggestion: 'Add capabilities.skills to use skill orchestration'
    })
  }
}

/**
 * Generate a human-readable validation report
 */
export function formatValidationReport(result: ValidationResult): string {
  if (result.valid && result.issues.length === 0) {
    return '✅ Configuration is valid with no issues'
  }

  const lines: string[] = []

  const errors = result.issues.filter(i => i.severity === 'error')
  const warnings = result.issues.filter(i => i.severity === 'warning')
  const infos = result.issues.filter(i => i.severity === 'info')

  if (errors.length > 0) {
    lines.push('❌ Errors:')
    for (const issue of errors) {
      lines.push(`\n  ${issue.path}`)
      lines.push(`    ${issue.message}`)
      if (issue.suggestion) {
        lines.push(`    💡 ${issue.suggestion}`)
      }
    }
  }

  if (warnings.length > 0) {
    lines.push('\n⚠️  Warnings:')
    for (const issue of warnings) {
      lines.push(`\n  ${issue.path}`)
      lines.push(`    ${issue.message}`)
      if (issue.suggestion) {
        lines.push(`    💡 ${issue.suggestion}`)
      }
    }
  }

  if (infos.length > 0) {
    lines.push('\nℹ️  Info:')
    for (const issue of infos) {
      lines.push(`\n  ${issue.path}`)
      lines.push(`    ${issue.message}`)
      if (issue.suggestion) {
        lines.push(`    💡 ${issue.suggestion}`)
      }
    }
  }

  return lines.join('\n')
}

/**
 * Check if configuration can be used in current environment
 */
export async function checkEnvironment(config: OpExConfig): Promise<ValidationIssue[]> {
  const issues: ValidationIssue[] = []

  // Check Node.js version
  const nodeVersion = process.version
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0] || '0')

  if (majorVersion < 18) {
    issues.push({
      severity: 'error',
      path: 'environment.node',
      message: `Node.js ${nodeVersion} is not supported`,
      suggestion: 'OpEx requires Node.js 18 or higher'
    })
  }

  // Check if required files exist
  if (config.surfaces.web) {
    // Could check if package.json has required dependencies
  }

  return issues
}
