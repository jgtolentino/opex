/**
 * DOM Snapshot Capture - Extracts DOM structure and computed styles
 */

import type { Page } from 'puppeteer'
import type { CapturedElement, PageSnapshot, ViewportSize } from './types.js'

/**
 * Capture page snapshot with DOM structure and styles
 */
export async function capturePageSnapshot(
  page: Page,
  url: string,
  viewport: ViewportSize,
  options: { fullPage?: boolean; includeImages?: boolean } = {}
): Promise<PageSnapshot> {
  const startTime = Date.now()

  // Extract data from page
  const pageData = await page.evaluate((opts) => {
    const elements: any[] = []
    const colorSet = new Set<string>()
    const fontMap = new Map<string, Set<string>>()

    /**
     * Extract computed styles for an element
     */
    function getComputedStyles(el: Element) {
      const computed = window.getComputedStyle(el)
      const rect = el.getBoundingClientRect()

      return {
        rect: {
          x: Math.round(rect.x),
          y: Math.round(rect.y),
          width: Math.round(rect.width),
          height: Math.round(rect.height)
        },
        styles: {
          color: computed.color,
          backgroundColor: computed.backgroundColor,
          fontSize: parseFloat(computed.fontSize),
          fontFamily: computed.fontFamily,
          fontWeight: computed.fontWeight,
          lineHeight: parseFloat(computed.lineHeight),
          borderRadius: parseFloat(computed.borderRadius),
          display: computed.display,
          flexDirection: computed.flexDirection as any,
          justifyContent: computed.justifyContent,
          alignItems: computed.alignItems,
          gap: parseFloat(computed.gap) || undefined,
          padding: {
            top: parseFloat(computed.paddingTop),
            right: parseFloat(computed.paddingRight),
            bottom: parseFloat(computed.paddingBottom),
            left: parseFloat(computed.paddingLeft)
          },
          margin: {
            top: parseFloat(computed.marginTop),
            right: parseFloat(computed.marginRight),
            bottom: parseFloat(computed.marginBottom),
            left: parseFloat(computed.marginLeft)
          }
        }
      }
    }

    /**
     * Collect colors and fonts
     */
    function collectDesignTokens(el: Element, styles: any) {
      // Collect colors
      if (styles.color && styles.color !== 'rgba(0, 0, 0, 0)') {
        colorSet.add(rgbToHex(styles.color))
      }
      if (styles.backgroundColor && styles.backgroundColor !== 'rgba(0, 0, 0, 0)') {
        colorSet.add(rgbToHex(styles.backgroundColor))
      }

      // Collect fonts
      if (styles.fontFamily) {
        const family = styles.fontFamily.split(',')[0].trim().replace(/['"]/g, '')
        if (!fontMap.has(family)) {
          fontMap.set(family, new Set())
        }
        fontMap.get(family)!.add(styles.fontWeight?.toString() || '400')
      }
    }

    /**
     * Convert rgb(a) to hex
     */
    function rgbToHex(rgb: string): string {
      const match = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
      if (!match) return rgb

      const r = parseInt(match[1]).toString(16).padStart(2, '0')
      const g = parseInt(match[2]).toString(16).padStart(2, '0')
      const b = parseInt(match[3]).toString(16).padStart(2, '0')

      return `#${r}${g}${b}`
    }

    /**
     * Determine element type
     */
    function getElementType(el: Element): 'text' | 'box' | 'image' | 'container' {
      // Image elements
      if (el.tagName === 'IMG' || el.tagName === 'SVG') return 'image'

      // Text-only elements (no children or only text nodes)
      const hasOnlyText = Array.from(el.childNodes).every(
        node => node.nodeType === Node.TEXT_NODE
      )
      const hasText = el.textContent?.trim().length || 0 > 0

      if (hasOnlyText && hasText && el.children.length === 0) {
        return 'text'
      }

      // Container with children
      if (el.children.length > 0) return 'container'

      // Box (no children, no text)
      return 'box'
    }

    /**
     * Extract element and children recursively
     */
    function extractElement(el: Element, depth = 0): any {
      // Skip invisible elements
      const computed = window.getComputedStyle(el)
      if (
        computed.display === 'none' ||
        computed.visibility === 'hidden' ||
        computed.opacity === '0'
      ) {
        return null
      }

      const { rect, styles } = getComputedStyles(el)

      // Skip zero-size elements
      if (rect.width === 0 || rect.height === 0) return null

      // Collect design tokens
      collectDesignTokens(el, styles)

      const type = getElementType(el)

      const node: any = {
        tag: el.tagName.toLowerCase(),
        type,
        rect,
        styles
      }

      // Text content
      if (type === 'text') {
        node.text = el.textContent?.trim() || ''
      }

      // Image source
      if (type === 'image' && el.tagName === 'IMG') {
        node.src = (el as HTMLImageElement).src
      }

      // Recursively extract children (limit depth to prevent infinite recursion)
      if (type === 'container' && depth < 20) {
        node.children = []
        for (const child of Array.from(el.children)) {
          const childNode = extractElement(child, depth + 1)
          if (childNode) {
            node.children.push(childNode)
          }
        }
      }

      return node
    }

    // Start extraction from body
    const body = document.body
    const rootElement = extractElement(body)

    return {
      title: document.title,
      elements: rootElement ? [rootElement] : [],
      colors: Array.from(colorSet),
      fonts: Array.from(fontMap.entries()).map(([family, weights]) => ({
        family,
        weights: Array.from(weights)
      }))
    }
  }, options)

  const snapshot: PageSnapshot = {
    url,
    title: pageData.title || 'Untitled',
    viewport,
    elements: pageData.elements,
    colors: pageData.colors,
    fonts: pageData.fonts,
    metadata: {
      capturedAt: new Date().toISOString(),
      userAgent: await page.evaluate(() => navigator.userAgent)
    }
  }

  const duration = Date.now() - startTime
  console.log(`Snapshot captured in ${duration}ms: ${pageData.elements.length} elements, ${pageData.colors.length} colors, ${pageData.fonts.length} fonts`)

  return snapshot
}

/**
 * Validate URL before fetching
 */
export function validateUrl(url: string): { valid: boolean; error?: string } {
  try {
    const parsed = new URL(url)

    // Only allow http and https
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return {
        valid: false,
        error: 'Only HTTP and HTTPS URLs are supported'
      }
    }

    // Block localhost/private IPs (for security)
    const hostname = parsed.hostname.toLowerCase()
    if (
      hostname === 'localhost' ||
      hostname.startsWith('127.') ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('10.') ||
      hostname.startsWith('172.')
    ) {
      return {
        valid: false,
        error: 'Private/local URLs are not allowed'
      }
    }

    return { valid: true }
  } catch (error) {
    return {
      valid: false,
      error: 'Invalid URL format'
    }
  }
}
