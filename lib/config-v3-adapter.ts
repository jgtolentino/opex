/**
 * OpEx v3.0 Configuration Adapter
 *
 * This file provides backwards compatibility between v3.0 unified config
 * and v2.0 scattered config pattern.
 *
 * Usage in migration:
 * 1. Import from this file instead of './config'
 * 2. Gradually migrate to direct @opex/core imports
 * 3. Eventually remove this adapter
 */

import { parsePageId } from 'notion-utils'
import type { OpExConfig } from '../packages/core/config/schema.js'

// Load v3.0 config
let _config: OpExConfig | null = null

async function getV3Config(): Promise<OpExConfig> {
  if (_config) return _config

  try {
    const configModule = await import('../opex.config.js')
    _config = configModule.default
    return _config
  } catch (error) {
    console.error('Failed to load opex.config.ts:', error)
    throw new Error(
      'OpEx v3.0 configuration not found. Please create opex.config.ts in project root.'
    )
  }
}

/**
 * Adapter: Map v3 config to v2 format
 */
export async function getLegacyConfig() {
  const config = await getV3Config()

  return {
    // Site basics
    rootNotionPageId: parsePageId(config.surfaces.web.source, { uuid: false })!,
    rootNotionSpaceId: config.surfaces.web.spaceId
      ? parsePageId(config.surfaces.web.spaceId, { uuid: true })
      : null,

    name: config.metadata.name,
    domain: config.metadata.domain,
    author: config.metadata.author,
    description: config.metadata.description,

    // Social links
    twitter: config.metadata.twitter,
    github: config.metadata.github,

    // Features
    isPreviewImageSupportEnabled: config.surfaces.web.features?.isPreviewImageSupported ?? true,
    isRedisEnabled: config.surfaces.web.features?.isRedisEnabled ?? false,
    isSearchEnabled: config.surfaces.web.features?.isSearchEnabled ?? true,
    navigationStyle: config.surfaces.web.features?.navigationStyle ?? 'default',

    // URL overrides
    pageUrlOverrides: config.surfaces.web.routes || null,

    // Analytics (from telemetry)
    fathomId: config.telemetry.analytics?.includes('fathom')
      ? process.env.NEXT_PUBLIC_FATHOM_ID
      : undefined,
    posthogId: config.telemetry.analytics?.includes('posthog')
      ? process.env.NEXT_PUBLIC_POSTHOG_ID
      : undefined,

    // Redis (from integrations)
    redis: config.integrations['redis']
      ? {
          host: process.env.REDIS_HOST,
          password: process.env.REDIS_PASSWORD,
          user: process.env.REDIS_USER || 'default',
          namespace: process.env.REDIS_NAMESPACE || 'preview-images'
        }
      : undefined,

    // Raw config for advanced use
    _v3Config: config
  }
}

/**
 * Synchronous version for immediate use (requires config to be preloaded)
 */
export function getLegacyConfigSync(): any {
  if (!_config) {
    throw new Error(
      'Config not loaded. Call getLegacyConfig() first or use loadConfig() at app startup.'
    )
  }

  // Same mapping as async version
  return {
    rootNotionPageId: parsePageId(_config.surfaces.web.source, { uuid: false })!,
    rootNotionSpaceId: _config.surfaces.web.spaceId
      ? parsePageId(_config.surfaces.web.spaceId, { uuid: true })
      : null,

    name: _config.metadata.name,
    domain: _config.metadata.domain,
    author: _config.metadata.author,
    description: _config.metadata.description,

    twitter: _config.metadata.twitter,
    github: _config.metadata.github,

    isPreviewImageSupportEnabled:
      _config.surfaces.web.features?.isPreviewImageSupported ?? true,
    isRedisEnabled: _config.surfaces.web.features?.isRedisEnabled ?? false,
    isSearchEnabled: _config.surfaces.web.features?.isSearchEnabled ?? true,
    navigationStyle: _config.surfaces.web.features?.navigationStyle ?? 'default',

    pageUrlOverrides: _config.surfaces.web.routes || null,

    fathomId: _config.telemetry.analytics?.includes('fathom')
      ? process.env.NEXT_PUBLIC_FATHOM_ID
      : undefined,
    posthogId: _config.telemetry.analytics?.includes('posthog')
      ? process.env.NEXT_PUBLIC_POSTHOG_ID
      : undefined,

    redis: _config.integrations['redis']
      ? {
          host: process.env.REDIS_HOST,
          password: process.env.REDIS_PASSWORD,
          user: process.env.REDIS_USER || 'default',
          namespace: process.env.REDIS_NAMESPACE || 'preview-images'
        }
      : undefined,

    _v3Config: _config
  }
}

/**
 * Preload config at app startup (for synchronous access later)
 */
export async function loadConfig(): Promise<void> {
  await getV3Config()
}

/**
 * Access raw v3 config (for new code)
 */
export function getConfig(): OpExConfig {
  if (!_config) {
    throw new Error('Config not loaded. Call loadConfig() first.')
  }
  return _config
}

/**
 * Check if a capability is enabled
 */
export function hasCapability(capability: 'rag' | 'workflows' | 'skills'): boolean {
  if (!_config) return false
  return _config.capabilities[capability] !== undefined
}

/**
 * Check if a surface is enabled
 */
export function hasSurface(surface: 'web' | 'docs' | 'voice'): boolean {
  if (!_config) return false
  return _config.surfaces[surface] !== undefined
}

/**
 * Get integration auth token
 */
export function getIntegrationAuth(integration: string): string | undefined {
  if (!_config) return undefined
  return _config.integrations[integration]?.auth
}
