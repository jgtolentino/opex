/**
 * Shared types between backend and Figma plugin
 * These should match webtodesign-plugin/src/types.ts
 */

export interface ViewportSize {
  name: string
  width: number
  height: number
}

export interface CapturedElement {
  tag: string
  type: 'text' | 'box' | 'image' | 'container'
  text?: string
  src?: string
  rect: {
    x: number
    y: number
    width: number
    height: number
  }
  styles: {
    color?: string
    backgroundColor?: string
    fontSize?: number
    fontFamily?: string
    fontWeight?: string | number
    lineHeight?: number
    borderRadius?: number
    display?: string
    flexDirection?: string
    justifyContent?: string
    alignItems?: string
    gap?: number
    padding?: {
      top: number
      right: number
      bottom: number
      left: number
    }
    margin?: {
      top: number
      right: number
      bottom: number
      left: number
    }
  }
  children?: CapturedElement[]
}

export interface PageSnapshot {
  url: string
  title: string
  viewport: ViewportSize
  elements: CapturedElement[]
  colors: string[]
  fonts: Array<{ family: string; weights: string[] }>
  metadata?: {
    capturedAt: string
    userAgent: string
  }
}

export interface ConvertRequest {
  url: string
  viewport?: {
    width: number
    height: number
  }
  fullPage?: boolean
  includeImages?: boolean
}

export interface ConvertResponse {
  success: boolean
  snapshot?: PageSnapshot
  error?: string
  duration?: number
}

export interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  version: string
  uptime: number
  memory: {
    used: number
    total: number
  }
}
