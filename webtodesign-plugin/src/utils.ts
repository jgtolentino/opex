/**
 * WebToDesign Plugin - Utility Functions
 */

import type { RGB, CapturedElement } from './types'

/**
 * Parse CSS color string to Figma RGB format
 */
export function parseColor(cssColor: string): RGB {
  // Remove whitespace
  cssColor = cssColor.trim()

  // Handle hex colors
  if (cssColor.startsWith('#')) {
    const hex = cssColor.slice(1)
    let r = 0, g = 0, b = 0

    if (hex.length === 3) {
      // Short hex (#RGB)
      r = parseInt(hex[0] + hex[0], 16) / 255
      g = parseInt(hex[1] + hex[1], 16) / 255
      b = parseInt(hex[2] + hex[2], 16) / 255
    } else if (hex.length === 6) {
      // Full hex (#RRGGBB)
      r = parseInt(hex.slice(0, 2), 16) / 255
      g = parseInt(hex.slice(2, 4), 16) / 255
      b = parseInt(hex.slice(4, 6), 16) / 255
    }

    return { r, g, b }
  }

  // Handle rgb(a) colors
  const rgbMatch = cssColor.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/)
  if (rgbMatch) {
    return {
      r: parseInt(rgbMatch[1]) / 255,
      g: parseInt(rgbMatch[2]) / 255,
      b: parseInt(rgbMatch[3]) / 255
    }
  }

  // Handle named colors (basic set)
  const namedColors: Record<string, RGB> = {
    'black': { r: 0, g: 0, b: 0 },
    'white': { r: 1, g: 1, b: 1 },
    'red': { r: 1, g: 0, b: 0 },
    'green': { r: 0, g: 1, b: 0 },
    'blue': { r: 0, g: 0, b: 1 },
    'transparent': { r: 0, g: 0, b: 0 }
  }

  if (cssColor.toLowerCase() in namedColors) {
    return namedColors[cssColor.toLowerCase()]
  }

  // Fallback to black
  return { r: 0, g: 0, b: 0 }
}

/**
 * Sanitize name for Figma nodes and styles
 */
export function sanitizeName(name: string, maxLength = 50): string {
  return name
    .replace(/[^\w\s-]/g, '')
    .trim()
    .slice(0, maxLength)
    || 'Unnamed'
}

/**
 * Extract domain from URL
 */
export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url)
    return urlObj.hostname.replace('www.', '')
  } catch {
    return 'website'
  }
}

/**
 * Map CSS font-weight to Figma font style
 */
export function mapFontWeight(weight: string | number): string {
  const weightNum = typeof weight === 'string' ? parseInt(weight) : weight

  const weightMap: Record<number, string> = {
    100: 'Thin',
    200: 'Extra Light',
    300: 'Light',
    400: 'Regular',
    500: 'Medium',
    600: 'Semi Bold',
    700: 'Bold',
    800: 'Extra Bold',
    900: 'Black'
  }

  // Handle string weights
  if (typeof weight === 'string') {
    const lowerWeight = weight.toLowerCase()
    if (lowerWeight === 'normal') return 'Regular'
    if (lowerWeight === 'bold') return 'Bold'
  }

  return weightMap[weightNum] || 'Regular'
}

/**
 * Check if element should use auto-layout
 */
export function shouldUseAutoLayout(element: CapturedElement): boolean {
  const { display, flexDirection } = element.styles || {}
  return display === 'flex' && (flexDirection === 'row' || flexDirection === 'column')
}

/**
 * Get layout mode from CSS flexDirection
 */
export function getLayoutMode(flexDirection?: string): 'HORIZONTAL' | 'VERTICAL' | 'NONE' {
  if (!flexDirection) return 'NONE'

  if (flexDirection === 'row' || flexDirection === 'row-reverse') {
    return 'HORIZONTAL'
  } else if (flexDirection === 'column' || flexDirection === 'column-reverse') {
    return 'VERTICAL'
  }

  return 'NONE'
}

/**
 * Deduplicate colors by similarity
 */
export function deduplicateColors(colors: string[]): string[] {
  const uniqueColors = new Set<string>()
  const rgbColors = colors.map(c => parseColor(c))

  rgbColors.forEach((rgb, i) => {
    const isDuplicate = rgbColors.slice(0, i).some(existing =>
      Math.abs(existing.r - rgb.r) < 0.01 &&
      Math.abs(existing.g - rgb.g) < 0.01 &&
      Math.abs(existing.b - rgb.b) < 0.01
    )

    if (!isDuplicate) {
      uniqueColors.add(colors[i])
    }
  })

  return Array.from(uniqueColors)
}

/**
 * Format duration in ms to human-readable string
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
  return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`
}

/**
 * Truncate text for display
 */
export function truncateText(text: string, maxLength = 100): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

/**
 * Load font safely with fallback
 */
export async function loadFontSafely(
  fontFamily: string,
  fontWeight: string = 'Regular'
): Promise<FontName> {
  const primaryFont: FontName = { family: fontFamily, style: fontWeight }

  try {
    await figma.loadFontAsync(primaryFont)
    return primaryFont
  } catch {
    // Try with Regular style
    if (fontWeight !== 'Regular') {
      try {
        const regularFont: FontName = { family: fontFamily, style: 'Regular' }
        await figma.loadFontAsync(regularFont)
        return regularFont
      } catch {
        // Fall through to fallback
      }
    }

    // Fallback to Inter
    const fallbackFont: FontName = { family: 'Inter', style: 'Regular' }
    try {
      await figma.loadFontAsync(fallbackFont)
      return fallbackFont
    } catch {
      // Last resort: use default font
      const defaultFont: FontName = { family: 'Roboto', style: 'Regular' }
      await figma.loadFontAsync(defaultFont)
      return defaultFont
    }
  }
}

/**
 * Check if color is transparent or nearly transparent
 */
export function isTransparent(cssColor: string): boolean {
  const transparentKeywords = ['transparent', 'rgba(0,0,0,0)', 'rgba(0, 0, 0, 0)']
  if (transparentKeywords.includes(cssColor.replace(/\s/g, ''))) return true

  const rgbaMatch = cssColor.match(/rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*([\d.]+)/)
  if (rgbaMatch && parseFloat(rgbaMatch[1]) < 0.01) return true

  return false
}
