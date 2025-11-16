/**
 * WebToDesign Plugin - HTML to Figma Converter
 */

import type { CapturedElement, PageSnapshot, ConversionResult, RGB } from './types'
import {
  parseColor,
  sanitizeName,
  loadFontSafely,
  shouldUseAutoLayout,
  getLayoutMode,
  isTransparent
} from './utils'

export class HTMLToFigmaConverter {
  private stats = {
    nodesCreated: 0,
    textNodes: 0,
    imageNodes: 0,
    stylesCreated: 0
  }

  private colorMap = new Map<string, string>() // CSS color -> Figma style ID
  private textStyleMap = new Map<string, string>() // Font key -> Figma style ID

  /**
   * Convert page snapshot to Figma frame
   */
  async convert(snapshot: PageSnapshot): Promise<ConversionResult> {
    const startTime = Date.now()

    // Create root frame
    const rootFrame = figma.createFrame()
    rootFrame.name = `${snapshot.title || 'Page'} - ${snapshot.viewport.name}`
    rootFrame.resize(snapshot.viewport.width, snapshot.viewport.height)

    // Set light gray background
    rootFrame.fills = [{
      type: 'SOLID',
      color: { r: 0.98, g: 0.98, b: 0.98 }
    }]

    this.stats.nodesCreated++

    // Convert elements recursively
    for (const element of snapshot.elements) {
      await this.convertElement(rootFrame, element)
    }

    // Extract and create design tokens
    await this.createColorStyles(snapshot.colors)
    await this.createTextStyles(snapshot.fonts)

    // Select and zoom to frame
    figma.currentPage.selection = [rootFrame]
    figma.viewport.scrollAndZoomIntoView([rootFrame])

    const duration = Date.now() - startTime

    return {
      frameId: rootFrame.id,
      stats: {
        ...this.stats,
        duration
      }
    }
  }

  /**
   * Convert single element to Figma node
   */
  private async convertElement(
    parent: BaseNode & ChildrenMixin,
    element: CapturedElement
  ): Promise<SceneNode | null> {
    const { type, rect, styles, children = [] } = element

    // Skip zero-size elements
    if (rect.width === 0 || rect.height === 0) return null

    // Convert based on type
    if (type === 'text') {
      return await this.createTextNode(parent, element)
    } else if (type === 'image') {
      return await this.createImageNode(parent, element)
    } else if (type === 'box' || type === 'container') {
      return await this.createBoxNode(parent, element)
    }

    return null
  }

  /**
   * Create text node
   */
  private async createTextNode(
    parent: BaseNode & ChildrenMixin,
    element: CapturedElement
  ): Promise<TextNode> {
    const textNode = figma.createText()
    const { rect, styles, text = '' } = element

    // Load font
    const fontFamily = styles.fontFamily?.split(',')[0]?.trim().replace(/['"]/g, '') || 'Inter'
    const fontWeight = styles.fontWeight?.toString() || '400'
    const figmaFont = await loadFontSafely(fontFamily, this.mapWeight(fontWeight))

    textNode.fontName = figmaFont

    // Set text content
    textNode.characters = text.trim() || 'Text'

    // Set size
    textNode.fontSize = styles.fontSize || 14
    if (styles.lineHeight) {
      textNode.lineHeight = { value: styles.lineHeight, unit: 'PIXELS' }
    }

    // Set color
    if (styles.color && !isTransparent(styles.color)) {
      textNode.fills = [{
        type: 'SOLID',
        color: parseColor(styles.color)
      }]
    }

    // Position
    textNode.x = rect.x
    textNode.y = rect.y

    // Try to constrain size
    if (rect.width > 0) {
      textNode.resize(rect.width, textNode.height)
    }

    parent.appendChild(textNode)
    this.stats.nodesCreated++
    this.stats.textNodes++

    return textNode
  }

  /**
   * Create image node (placeholder rectangle for now)
   */
  private async createImageNode(
    parent: BaseNode & ChildrenMixin,
    element: CapturedElement
  ): Promise<RectangleNode> {
    const rect = figma.createRectangle()
    const { rect: bounds, src } = element

    rect.name = src ? `Image: ${src.split('/').pop()}` : 'Image'
    rect.resize(bounds.width, bounds.height)
    rect.x = bounds.x
    rect.y = bounds.y

    // Placeholder fill (light gray)
    rect.fills = [{
      type: 'SOLID',
      color: { r: 0.9, g: 0.9, b: 0.9 }
    }]

    // TODO: Fetch and load actual image
    // This would require additional network access and image encoding

    parent.appendChild(rect)
    this.stats.nodesCreated++
    this.stats.imageNodes++

    return rect
  }

  /**
   * Create box/container node
   */
  private async createBoxNode(
    parent: BaseNode & ChildrenMixin,
    element: CapturedElement
  ): Promise<FrameNode> {
    const frame = figma.createFrame()
    const { rect, styles, children = [] } = element

    frame.name = sanitizeName(element.tag || 'Box')
    frame.resize(rect.width, rect.height)
    frame.x = rect.x
    frame.y = rect.y

    // Check if should use auto-layout
    if (shouldUseAutoLayout(element)) {
      const layoutMode = getLayoutMode(styles.flexDirection)

      if (layoutMode !== 'NONE') {
        frame.layoutMode = layoutMode

        // Spacing
        if (styles.gap) {
          frame.itemSpacing = styles.gap
        }

        // Padding
        if (styles.padding) {
          frame.paddingLeft = styles.padding.left
          frame.paddingRight = styles.padding.right
          frame.paddingTop = styles.padding.top
          frame.paddingBottom = styles.padding.bottom
        }

        // Alignment
        this.applyAlignment(frame, styles)
      }
    }

    // Background color
    if (styles.backgroundColor && !isTransparent(styles.backgroundColor)) {
      frame.fills = [{
        type: 'SOLID',
        color: parseColor(styles.backgroundColor)
      }]
    } else {
      frame.fills = [] // Transparent
    }

    // Border radius
    if (styles.borderRadius) {
      frame.cornerRadius = styles.borderRadius
    }

    parent.appendChild(frame)
    this.stats.nodesCreated++

    // Convert children
    for (const child of children) {
      await this.convertElement(frame, child)
    }

    return frame
  }

  /**
   * Apply flex alignment to frame
   */
  private applyAlignment(frame: FrameNode, styles: CapturedElement['styles']) {
    const { justifyContent, alignItems } = styles

    // Primary axis
    if (justifyContent === 'center') {
      frame.primaryAxisAlignItems = 'CENTER'
    } else if (justifyContent === 'flex-end' || justifyContent === 'end') {
      frame.primaryAxisAlignItems = 'MAX'
    } else if (justifyContent === 'space-between') {
      frame.primaryAxisAlignItems = 'SPACE_BETWEEN'
    } else {
      frame.primaryAxisAlignItems = 'MIN'
    }

    // Counter axis
    if (alignItems === 'center') {
      frame.counterAxisAlignItems = 'CENTER'
    } else if (alignItems === 'flex-end' || alignItems === 'end') {
      frame.counterAxisAlignItems = 'MAX'
    } else {
      frame.counterAxisAlignItems = 'MIN'
    }
  }

  /**
   * Create color styles from palette
   */
  private async createColorStyles(colors: string[]) {
    // Take top colors (limit to avoid clutter)
    const topColors = colors.slice(0, 10)

    topColors.forEach((cssColor, index) => {
      try {
        const rgb = parseColor(cssColor)
        const style = figma.createPaintStyle()

        style.name = `Imported/Color ${index + 1}`
        style.paints = [{
          type: 'SOLID',
          color: rgb
        }]

        this.colorMap.set(cssColor, style.id)
        this.stats.stylesCreated++
      } catch (error) {
        console.warn('Failed to create color style:', cssColor, error)
      }
    })
  }

  /**
   * Create text styles from fonts
   */
  private async createTextStyles(fonts: Array<{ family: string; weights: string[] }>) {
    // Limit to top fonts
    const topFonts = fonts.slice(0, 5)

    for (const font of topFonts) {
      for (const weight of font.weights.slice(0, 3)) {
        try {
          const figmaFont = await loadFontSafely(font.family, this.mapWeight(weight))
          const style = figma.createTextStyle()

          style.name = `Imported/${font.family}/${weight}`
          style.fontName = figmaFont

          const key = `${font.family}-${weight}`
          this.textStyleMap.set(key, style.id)
          this.stats.stylesCreated++
        } catch (error) {
          console.warn('Failed to create text style:', font.family, weight, error)
        }
      }
    }
  }

  /**
   * Map numeric font weight to Figma style name
   */
  private mapWeight(weight: string | number): string {
    const weightNum = typeof weight === 'string' ? parseInt(weight) : weight

    const map: Record<number, string> = {
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

    return map[weightNum] || 'Regular'
  }
}
