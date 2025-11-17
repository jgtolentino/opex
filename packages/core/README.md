# @opex/core

Core configuration and type system for OpEx Platform Runtime v3.0.

## Features

- **Type-safe configuration** - Zod schemas with TypeScript type inference
- **Runtime validation** - Fails fast with actionable error messages
- **Environment resolution** - Automatic env var and secret loading
- **Health checking** - Validate config against current environment
- **Zero dependencies** (except Zod) - Minimal, focused package

## Installation

```bash
pnpm add @opex/core
```

## Usage

### Load Configuration

```typescript
import { loadConfig } from '@opex/core'

const config = await loadConfig() // Loads opex.config.ts
```

### Validate Configuration

```typescript
import { validateConfig, formatValidationReport } from '@opex/core'

const result = validateConfig(config)
console.log(formatValidationReport(result))
```

### Check Capabilities

```typescript
import { hasCapability, hasSurface } from '@opex/core'

if (hasCapability(config, 'rag')) {
  // RAG is enabled
}

if (hasSurface(config, 'voice')) {
  // Voice agent is enabled
}
```

### Get Integration Auth

```typescript
import { getIntegrationAuth } from '@opex/core'

const openaiKey = getIntegrationAuth(config, 'openai')
```

## Configuration Schema

See [schema.ts](./config/schema.ts) for the complete configuration schema.

### Example Configuration

```typescript
// opex.config.ts
import { defineConfig } from '@opex/core'

export default {
  version: '3.0',

  metadata: {
    name: 'OpEx Platform',
    domain: 'opex.example.com',
    author: 'Your Name'
  },

  surfaces: {
    web: {
      type: 'notion-renderer',
      source: '12345678-1234-1234-1234-123456789012'
    }
  },

  capabilities: {
    rag: {
      provider: 'openai',
      assistants: {
        'opex-assistant': {
          systemPrompt: './config/opex_assistant_system_prompt.md',
          vectorStores: ['vs_policies', 'vs_sops'],
          model: 'gpt-4-turbo'
        }
      }
    }
  },

  integrations: {
    openai: {
      auth: 'env:OPENAI_API_KEY',
      timeout: 30000
    },
    supabase: {
      endpoint: 'env:NEXT_PUBLIC_SUPABASE_URL',
      auth: 'env:SUPABASE_SERVICE_ROLE_KEY'
    }
  },

  telemetry: {
    analytics: ['fathom'],
    logging: 'supabase'
  }
}
```

## API Reference

### loadConfig(configPath?)

Load and validate configuration from file.

**Parameters:**
- `configPath` (optional) - Path to config file (default: `opex.config.ts`)

**Returns:** `Promise<OpExConfig>`

**Throws:** `ConfigValidationError` if validation fails

### validateConfig(config)

Validate configuration and check for common issues.

**Parameters:**
- `config` - Configuration object to validate

**Returns:** `ValidationResult` with issues array

### hasCapability(config, capability)

Check if a capability is enabled.

**Parameters:**
- `config` - Configuration object
- `capability` - Capability name (`'rag'` | `'workflows'` | `'skills'`)

**Returns:** `boolean`

### hasSurface(config, surface)

Check if a surface is enabled.

**Parameters:**
- `config` - Configuration object
- `surface` - Surface name (`'web'` | `'docs'` | `'voice'`)

**Returns:** `boolean`

## License

MIT
