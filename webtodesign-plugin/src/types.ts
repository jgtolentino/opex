/**
 * WebToDesign Plugin - Type Definitions
 */

export interface ImportOptions {
  url: string
  viewport: ViewportSize
  theme: 'light' | 'dark' | 'auto'
  includeImages: boolean
  fullPage: boolean
  maxHeight?: number
}

export interface ViewportSize {
  name: string
  width: number
  height: number
}

export const VIEWPORT_PRESETS: ViewportSize[] = [
  { name: 'Desktop (1440px)', width: 1440, height: 900 },
  { name: 'Laptop (1280px)', width: 1280, height: 800 },
  { name: 'Tablet (768px)', width: 768, height: 1024 },
  { name: 'Mobile (375px)', width: 375, height: 667 },
  { name: 'Mobile (360px)', width: 360, height: 640 }
]

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

export interface ConversionResult {
  frameId: string
  stats: {
    nodesCreated: number
    textNodes: number
    imageNodes: number
    stylesCreated: number
    duration: number
  }
}

export interface PluginMessage {
  type: 'import-url' | 'import-snapshot' | 'cancel' | 'status' | 'complete' | 'error'
  payload?: any
}

export interface RGB {
  r: number
  g: number
  b: number
}

export interface ColorStyle {
  name: string
  color: RGB
  usage: number
}

export interface TextStyleData {
  name: string
  fontFamily: string
  fontSize: number
  fontWeight: string
  lineHeight: number
  usage: number
}
