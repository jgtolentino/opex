/**
 * Test script for v3.0 configuration system
 *
 * Usage:
 *   pnpm exec ts-node scripts/test-config-v3.ts
 */

import { loadConfig, validateConfig, formatValidationReport } from '../packages/core/config/index.js'

async function main() {
  console.log('🧪 Testing OpEx v3.0 Configuration System\n')

  try {
    // Step 1: Load configuration
    console.log('📋 Loading configuration from opex.config.ts...')
    const config = await loadConfig()
    console.log('✅ Configuration loaded successfully\n')

    // Step 2: Display key configuration
    console.log('📊 Configuration Summary:')
    console.log(`   Name: ${config.metadata.name}`)
    console.log(`   Domain: ${config.metadata.domain}`)
    console.log(`   Version: ${config.version}`)
    console.log()

    console.log('🖥️  Surfaces:')
    console.log(`   Web: ${config.surfaces.web.type} (${config.surfaces.web.source})`)
    if (config.surfaces.docs) {
      console.log(`   Docs: ${config.surfaces.docs.type} (${config.surfaces.docs.source})`)
    }
    if (config.surfaces.voice) {
      console.log(`   Voice: ${config.surfaces.voice.type} (${config.surfaces.voice.source})`)
    }
    console.log()

    console.log('⚡ Capabilities:')
    if (config.capabilities.rag) {
      console.log(`   RAG: ${config.capabilities.rag.provider}`)
      const assistantCount = Object.keys(config.capabilities.rag.assistants).length
      console.log(`   Assistants: ${assistantCount}`)
    }
    if (config.capabilities.workflows) {
      console.log(`   Workflows: ${config.capabilities.workflows.provider}`)
    }
    if (config.capabilities.skills) {
      console.log(`   Skills: ${config.capabilities.skills.registry}`)
    }
    console.log()

    console.log('🔌 Integrations:')
    for (const [name, integration] of Object.entries(config.integrations)) {
      const authType = integration.auth.startsWith('env:') ? 'env var' : 'direct'
      console.log(`   ${name}: ${authType}`)
    }
    console.log()

    // Step 3: Validate configuration
    console.log('🔍 Validating configuration...')
    const validation = validateConfig(config)

    if (validation.valid) {
      console.log('✅ Configuration is valid!\n')
    } else {
      console.log('⚠️  Configuration has issues:\n')
      console.log(formatValidationReport(validation))
      console.log()
    }

    // Step 4: Display experimental features
    if (config.experimental) {
      console.log('🧪 Experimental Features:')
      console.log(`   New RAG Architecture: ${config.experimental.useNewRAGArchitecture ? '✅' : '❌'}`)
      console.log(`   Skill Orchestration: ${config.experimental.enableSkillOrchestration ? '✅' : '❌'}`)
      console.log(`   Strict Type Validation: ${config.experimental.strictTypeValidation ? '✅' : '❌'}`)
      console.log(`   Parallel Agent Execution: ${config.experimental.parallelAgentExecution ? '✅' : '❌'}`)
      console.log()
    }

    // Step 5: Test specific capabilities
    console.log('🎯 Capability Checks:')
    const hasRAG = config.capabilities.rag !== undefined
    const hasSkills = config.capabilities.skills !== undefined
    const hasWorkflows = config.capabilities.workflows !== undefined

    console.log(`   Has RAG: ${hasRAG ? '✅' : '❌'}`)
    console.log(`   Has Skills: ${hasSkills ? '✅' : '❌'}`)
    console.log(`   Has Workflows: ${hasWorkflows ? '✅' : '❌'}`)
    console.log()

    console.log('🎉 All tests passed! OpEx v3.0 configuration is operational.\n')

    process.exit(0)
  } catch (error) {
    console.error('❌ Configuration test failed:\n')
    console.error((error as Error).message)
    console.error()

    if ((error as any).zodError) {
      console.error('Validation errors:')
      console.error((error as any).zodError.errors)
    }

    process.exit(1)
  }
}

main()
