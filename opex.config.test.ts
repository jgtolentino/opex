/**
 * Test Configuration for OpEx v3.0
 *
 * This config is used for testing without requiring environment variables.
 */

import type { OpExConfig } from './packages/core/config/schema.js'

// Set dummy environment variables for testing
process.env.OPENAI_API_KEY = 'sk-test-key-1234567890'
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key'
process.env.NOTION_API_KEY = 'test-notion-key'
process.env.REDIS_HOST = 'redis://localhost'
process.env.REDIS_PASSWORD = 'test-redis-password'
process.env.ODOO_ENDPOINT = 'https://odoo.test.com'
process.env.ODOO_API_KEY = 'test-odoo-key'

const config: OpExConfig = {
  version: '3.0',

  metadata: {
    name: 'OpEx Platform (Test)',
    domain: 'test.opex.local',
    author: 'Test Suite',
    description: 'Test configuration for validation',
    language: 'en-US'
  },

  surfaces: {
    web: {
      type: 'notion-renderer',
      source: '7875426197cf461698809def95960ebf',
      features: {
        isPreviewImageSupported: true,
        isSearchEnabled: true,
        isRedisEnabled: false,
        navigationStyle: 'default'
      }
    },

    docs: {
      type: 'docusaurus',
      source: './docs',
      port: 3001
    }
  },

  capabilities: {
    rag: {
      provider: 'openai',
      assistants: {
        'test-assistant': {
          systemPrompt: './config/test_prompt.md',
          vectorStores: ['vs_test'],
          model: 'gpt-4-turbo',
          temperature: 0.7
        }
      }
    }
  },

  integrations: {
    openai: {
      auth: 'env:OPENAI_API_KEY',
      timeout: 30000,
      retries: 3
    },
    supabase: {
      endpoint: 'env:NEXT_PUBLIC_SUPABASE_URL',
      auth: 'env:SUPABASE_SERVICE_ROLE_KEY',
      timeout: 30000,
      retries: 3
    }
  },

  telemetry: {
    analytics: [],
    logging: 'console',
    tracing: false
  },

  experimental: {
    useNewRAGArchitecture: false,
    enableSkillOrchestration: false,
    strictTypeValidation: true,
    parallelAgentExecution: false
  }
}

export default config
