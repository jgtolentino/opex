/**
 * WebToDesign Backend API
 * Express server with Puppeteer for HTML to Figma conversion
 */

import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import puppeteer, { type Browser } from 'puppeteer'
import { capturePageSnapshot, validateUrl } from './domSnapshot.js'
import type { ConvertRequest, ConvertResponse, HealthResponse, ViewportSize } from './types.js'

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000
const CORS_ORIGINS = process.env.CORS_ORIGINS?.split(',') || ['*']
const PUPPETEER_TIMEOUT = parseInt(process.env.PUPPETEER_TIMEOUT || '30000')

// Server state
let browser: Browser | null = null
const startTime = Date.now()

/**
 * Initialize Puppeteer browser
 */
async function initBrowser() {
  if (browser) return browser

  console.log('Launching Puppeteer browser...')
  browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu'
    ]
  })

  console.log('Browser launched successfully')
  return browser
}

/**
 * Cleanup browser on exit
 */
async function cleanup() {
  if (browser) {
    console.log('Closing browser...')
    await browser.close()
    browser = null
  }
}

process.on('SIGTERM', async () => {
  await cleanup()
  process.exit(0)
})

process.on('SIGINT', async () => {
  await cleanup()
  process.exit(0)
})

// Middleware
app.use(cors({
  origin: CORS_ORIGINS,
  credentials: true
}))
app.use(express.json())

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`)
  next()
})

/**
 * Health check endpoint
 */
app.get('/health', async (req, res) => {
  const memUsage = process.memoryUsage()

  const health: HealthResponse = {
    status: browser ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    uptime: Date.now() - startTime,
    memory: {
      used: Math.round(memUsage.heapUsed / 1024 / 1024),
      total: Math.round(memUsage.heapTotal / 1024 / 1024)
    }
  }

  res.json(health)
})

/**
 * Convert URL to Figma snapshot
 * GET /convert?url=https://example.com&width=1440&height=900&fullPage=true
 */
app.get('/convert', async (req, res) => {
  const startTime = Date.now()

  try {
    // Extract parameters
    const url = req.query.url as string
    const width = parseInt(req.query.width as string) || 1440
    const height = parseInt(req.query.height as string) || 900
    const fullPage = req.query.fullPage === 'true'
    const includeImages = req.query.includeImages !== 'false'

    // Validate URL
    if (!url) {
      const response: ConvertResponse = {
        success: false,
        error: 'URL parameter is required'
      }
      return res.status(400).json(response)
    }

    const validation = validateUrl(url)
    if (!validation.valid) {
      const response: ConvertResponse = {
        success: false,
        error: validation.error
      }
      return res.status(400).json(response)
    }

    // Initialize browser
    const browserInstance = await initBrowser()

    // Create new page
    const page = await browserInstance.newPage()

    try {
      // Set viewport
      await page.setViewport({ width, height })

      // Set timeout
      page.setDefaultTimeout(PUPPETEER_TIMEOUT)
      page.setDefaultNavigationTimeout(PUPPETEER_TIMEOUT)

      // Navigate to URL
      console.log(`Navigating to ${url}...`)
      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: PUPPETEER_TIMEOUT
      })

      console.log('Page loaded, capturing snapshot...')

      // Capture snapshot
      const viewport: ViewportSize = {
        name: `${width}x${height}`,
        width,
        height
      }

      const snapshot = await capturePageSnapshot(page, url, viewport, {
        fullPage,
        includeImages
      })

      const duration = Date.now() - startTime

      const response: ConvertResponse = {
        success: true,
        snapshot,
        duration
      }

      console.log(`Conversion successful in ${duration}ms`)
      res.json(response)
    } catch (error) {
      console.error('Page error:', error)

      const response: ConvertResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to capture page'
      }

      res.status(500).json(response)
    } finally {
      // Always close the page
      await page.close()
    }
  } catch (error) {
    console.error('Server error:', error)

    const response: ConvertResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }

    res.status(500).json(response)
  }
})

/**
 * Batch convert multiple URLs
 * POST /batch-convert
 * Body: { urls: string[], viewport: { width, height } }
 */
app.post('/batch-convert', async (req, res) => {
  try {
    const { urls, viewport } = req.body

    if (!Array.isArray(urls) || urls.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'urls array is required'
      })
    }

    if (urls.length > 10) {
      return res.status(400).json({
        success: false,
        error: 'Maximum 10 URLs per batch'
      })
    }

    const width = viewport?.width || 1440
    const height = viewport?.height || 900

    const results = []

    for (const url of urls) {
      const validation = validateUrl(url)
      if (!validation.valid) {
        results.push({
          url,
          success: false,
          error: validation.error
        })
        continue
      }

      try {
        const browserInstance = await initBrowser()
        const page = await browserInstance.newPage()

        await page.setViewport({ width, height })
        await page.goto(url, { waitUntil: 'networkidle2', timeout: PUPPETEER_TIMEOUT })

        const viewportSize: ViewportSize = {
          name: `${width}x${height}`,
          width,
          height
        }

        const snapshot = await capturePageSnapshot(page, url, viewportSize)
        await page.close()

        results.push({
          url,
          success: true,
          snapshot
        })
      } catch (error) {
        results.push({
          url,
          success: false,
          error: error instanceof Error ? error.message : 'Failed to capture'
        })
      }
    }

    res.json({
      success: true,
      results
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Batch conversion failed'
    })
  }
})

/**
 * Start server
 */
async function start() {
  try {
    // Initialize browser on startup
    await initBrowser()

    app.listen(PORT, () => {
      console.log(`
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║   WebToDesign Backend API                                ║
║   Version: 1.0.0                                         ║
║                                                          ║
║   Server running on http://localhost:${PORT}            ║
║   Health check: http://localhost:${PORT}/health         ║
║                                                          ║
║   Endpoints:                                             ║
║   GET  /convert?url=...&width=...&height=...             ║
║   POST /batch-convert                                    ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
      `)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

// Start the server
start()
