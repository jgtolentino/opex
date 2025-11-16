/**
 * Plugin Configuration
 * Manages environment-specific settings and backend URL
 */

/**
 * Get backend API URL from environment or use default
 * Priority: process.env > localStorage > default
 */
export function getBackendUrl(): string {
  // In Figma plugin, we can't access process.env directly
  // So we use a compile-time variable or default

  // For development/local builds, this can be set via build tools
  const DEFAULT_BACKEND_URL = 'http://localhost:3000'
  const PRODUCTION_BACKEND_URL = 'https://webtodesign-api.vercel.app'

  // Check if running in production mode (you can set this during build)
  const isProduction = typeof process !== 'undefined' && process.env.NODE_ENV === 'production'

  return isProduction ? PRODUCTION_BACKEND_URL : DEFAULT_BACKEND_URL
}

/**
 * API configuration
 */
export const API_CONFIG = {
  BACKEND_URL: getBackendUrl(),
  TIMEOUT: 60000, // 60 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 2000 // 2 seconds
}

/**
 * Feature flags
 */
export const FEATURES = {
  ENABLE_TELEMETRY: false,
  ENABLE_BATCH_IMPORT: false,
  ENABLE_IMAGE_DOWNLOAD: true,
  MAX_NODES_PER_IMPORT: 10000
}

/**
 * Viewport presets (must match types.ts)
 */
export const VIEWPORT_PRESETS = [
  { name: 'Desktop (1440px)', width: 1440, height: 900 },
  { name: 'Laptop (1280px)', width: 1280, height: 800 },
  { name: 'Tablet (768px)', width: 768, height: 1024 },
  { name: 'Mobile (375px)', width: 375, height: 667 },
  { name: 'Mobile (360px)', width: 360, height: 640 }
]

/**
 * Telemetry helper (if enabled)
 */
export function logEvent(event: string, data?: Record<string, any>) {
  if (!FEATURES.ENABLE_TELEMETRY) return

  console.log('[Telemetry]', event, data)
  // TODO: Send to analytics service
}
