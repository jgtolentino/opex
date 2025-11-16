/**
 * WebToDesign - Main Plugin Code
 * Runs in the Figma plugin sandbox (no DOM access)
 */

import { HTMLToFigmaConverter } from './converter'
import type { PageSnapshot, ImportOptions, PluginMessage } from './types'
import { extractDomain, formatDuration } from './utils'

// Show plugin UI
figma.showUI(__html__, {
  width: 440,
  height: 600,
  themeColors: true
})

// Track current import (for cancellation)
let currentImport: AbortController | null = null

/**
 * Handle messages from UI
 */
figma.ui.onmessage = async (msg: PluginMessage) => {
  try {
    switch (msg.type) {
      case 'import-url':
        await handleImportURL(msg.payload as ImportOptions)
        break

      case 'import-snapshot':
        await handleImportSnapshot(msg.payload as PageSnapshot)
        break

      case 'cancel':
        handleCancel()
        break

      default:
        console.warn('Unknown message type:', msg.type)
    }
  } catch (error) {
    console.error('Error handling message:', error)
    sendToUI({
      type: 'error',
      payload: {
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    })
  }
}

/**
 * Import from URL (requires backend API or browser extension)
 */
async function handleImportURL(options: ImportOptions) {
  const { url, viewport } = options

  try {
    sendToUI({
      type: 'status',
      payload: { message: `Fetching ${extractDomain(url)}...`, progress: 10 }
    })

    // For MVP, we'll create a simple demo/placeholder
    // In production, this would call a backend API
    const snapshot = await fetchPageSnapshot(url, options)

    sendToUI({
      type: 'status',
      payload: { message: 'Converting to Figma...', progress: 50 }
    })

    // Convert to Figma
    const converter = new HTMLToFigmaConverter()
    const result = await converter.convert(snapshot)

    sendToUI({
      type: 'complete',
      payload: {
        message: `Import complete! Created ${result.stats.nodesCreated} nodes in ${formatDuration(result.stats.duration)}`,
        result
      }
    })
  } catch (error) {
    throw new Error(`Failed to import URL: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Import from page snapshot (from browser extension or manual upload)
 */
async function handleImportSnapshot(snapshot: PageSnapshot) {
  try {
    sendToUI({
      type: 'status',
      payload: { message: 'Converting snapshot to Figma...', progress: 20 }
    })

    const converter = new HTMLToFigmaConverter()
    const result = await converter.convert(snapshot)

    sendToUI({
      type: 'complete',
      payload: {
        message: `Import complete! Created ${result.stats.nodesCreated} nodes`,
        result
      }
    })
  } catch (error) {
    throw new Error(`Failed to import snapshot: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Cancel current import
 */
function handleCancel() {
  if (currentImport) {
    currentImport.abort()
    currentImport = null

    sendToUI({
      type: 'status',
      payload: { message: 'Import cancelled', progress: 0 }
    })
  }
}

/**
 * Fetch page snapshot from URL
 * NOTE: This is a placeholder implementation for MVP
 * Production version would call a backend API or use browser extension
 */
async function fetchPageSnapshot(
  url: string,
  options: ImportOptions
): Promise<PageSnapshot> {
  // For MVP/demo, create a simple placeholder snapshot
  // In production, this would make an API call:
  // const response = await fetch(`https://api.webtodesign.com/convert?url=${encodeURIComponent(url)}`)
  // return await response.json()

  return createDemoSnapshot(url, options)
}

/**
 * Create demo snapshot for testing
 */
function createDemoSnapshot(url: string, options: ImportOptions): PageSnapshot {
  const domain = extractDomain(url)

  return {
    url,
    title: `Demo: ${domain}`,
    viewport: options.viewport,
    elements: [
      {
        tag: 'body',
        type: 'container',
        rect: { x: 0, y: 0, width: options.viewport.width, height: 800 },
        styles: {
          backgroundColor: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
          padding: { top: 40, right: 40, bottom: 40, left: 40 }
        },
        children: [
          // Header
          {
            tag: 'header',
            type: 'container',
            rect: { x: 40, y: 40, width: options.viewport.width - 80, height: 60 },
            styles: {
              backgroundColor: '#1a1a1a',
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: { top: 16, right: 24, bottom: 16, left: 24 },
              borderRadius: 8
            },
            children: [
              {
                tag: 'h1',
                type: 'text',
                text: domain.toUpperCase(),
                rect: { x: 64, y: 56, width: 200, height: 32 },
                styles: {
                  color: '#ffffff',
                  fontSize: 24,
                  fontFamily: 'Inter',
                  fontWeight: '700'
                }
              },
              {
                tag: 'nav',
                type: 'container',
                rect: { x: options.viewport.width - 320, y: 56, width: 280, height: 32 },
                styles: {
                  display: 'flex',
                  flexDirection: 'row',
                  gap: 16,
                  alignItems: 'center'
                },
                children: [
                  {
                    tag: 'a',
                    type: 'text',
                    text: 'Home',
                    rect: { x: 0, y: 0, width: 60, height: 24 },
                    styles: {
                      color: '#ffffff',
                      fontSize: 16,
                      fontFamily: 'Inter',
                      fontWeight: '400'
                    }
                  },
                  {
                    tag: 'a',
                    type: 'text',
                    text: 'About',
                    rect: { x: 76, y: 0, width: 60, height: 24 },
                    styles: {
                      color: '#ffffff',
                      fontSize: 16,
                      fontFamily: 'Inter',
                      fontWeight: '400'
                    }
                  },
                  {
                    tag: 'a',
                    type: 'text',
                    text: 'Contact',
                    rect: { x: 152, y: 0, width: 80, height: 24 },
                    styles: {
                      color: '#ffffff',
                      fontSize: 16,
                      fontFamily: 'Inter',
                      fontWeight: '400'
                    }
                  }
                ]
              }
            ]
          },
          // Hero section
          {
            tag: 'section',
            type: 'container',
            rect: { x: 40, y: 124, width: options.viewport.width - 80, height: 300 },
            styles: {
              backgroundColor: '#f5f5f5',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              padding: { top: 60, right: 60, bottom: 60, left: 60 },
              borderRadius: 12
            },
            children: [
              {
                tag: 'h2',
                type: 'text',
                text: 'Welcome to WebToDesign',
                rect: { x: 100, y: 184, width: 400, height: 48 },
                styles: {
                  color: '#1a1a1a',
                  fontSize: 36,
                  fontFamily: 'Inter',
                  fontWeight: '700'
                }
              },
              {
                tag: 'p',
                type: 'text',
                text: 'This is a demo of HTML to Figma conversion. Connect a backend API or browser extension to import real websites!',
                rect: { x: 100, y: 248, width: 500, height: 60 },
                styles: {
                  color: '#666666',
                  fontSize: 18,
                  fontFamily: 'Inter',
                  fontWeight: '400',
                  lineHeight: 28
                }
              }
            ]
          },
          // Card grid
          {
            tag: 'section',
            type: 'container',
            rect: { x: 40, y: 448, width: options.viewport.width - 80, height: 280 },
            styles: {
              display: 'flex',
              flexDirection: 'row',
              gap: 20
            },
            children: Array.from({ length: 3 }, (_, i) => ({
              tag: 'div',
              type: 'container',
              rect: {
                x: 40 + (i * ((options.viewport.width - 80) / 3 + 20)),
                y: 448,
                width: (options.viewport.width - 80 - 40) / 3,
                height: 280
              },
              styles: {
                backgroundColor: '#ffffff',
                padding: { top: 24, right: 24, bottom: 24, left: 24 },
                borderRadius: 8,
                display: 'flex',
                flexDirection: 'column',
                gap: 12
              },
              children: [
                {
                  tag: 'h3',
                  type: 'text',
                  text: `Feature ${i + 1}`,
                  rect: { x: 0, y: 0, width: 200, height: 32 },
                  styles: {
                    color: '#1a1a1a',
                    fontSize: 24,
                    fontFamily: 'Inter',
                    fontWeight: '600'
                  }
                },
                {
                  tag: 'p',
                  type: 'text',
                  text: 'Convert websites to Figma with auto-layout, design tokens, and editable layers.',
                  rect: { x: 0, y: 44, width: 240, height: 80 },
                  styles: {
                    color: '#666666',
                    fontSize: 14,
                    fontFamily: 'Inter',
                    fontWeight: '400',
                    lineHeight: 20
                  }
                }
              ]
            }))
          }
        ]
      }
    ],
    colors: ['#1a1a1a', '#ffffff', '#f5f5f5', '#666666', '#18A0FB'],
    fonts: [
      { family: 'Inter', weights: ['400', '600', '700'] }
    ],
    metadata: {
      capturedAt: new Date().toISOString(),
      userAgent: 'WebToDesign Figma Plugin v1.0.0'
    }
  }
}

/**
 * Send message to UI
 */
function sendToUI(msg: PluginMessage) {
  figma.ui.postMessage(msg)
}

/**
 * Plugin lifecycle
 */
figma.on('close', () => {
  // Cleanup
  if (currentImport) {
    currentImport.abort()
  }
})
