/**
 * Backend API Client
 * Handles communication with WebToDesign backend API
 */

import type { PageSnapshot, ImportOptions } from './types'
import { API_CONFIG } from './config'

interface ConvertResponse {
  success: boolean
  snapshot?: PageSnapshot
  error?: string
  duration?: number
}

/**
 * Fetch page snapshot from backend API
 */
export async function fetchPageSnapshotFromAPI(
  url: string,
  options: ImportOptions
): Promise<PageSnapshot> {
  const { viewport, fullPage = false, includeImages = true } = options

  // Build API URL
  const params = new URLSearchParams({
    url,
    width: viewport.width.toString(),
    height: viewport.height.toString(),
    fullPage: fullPage.toString(),
    includeImages: includeImages.toString()
  })

  const apiUrl = `${API_CONFIG.BACKEND_URL}/convert?${params}`

  // Fetch with timeout and retries
  const response = await fetchWithRetry(apiUrl, {
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Backend API error: ${response.status} ${errorText}`)
  }

  const data: ConvertResponse = await response.json()

  if (!data.success || !data.snapshot) {
    throw new Error(data.error || 'Failed to capture page snapshot')
  }

  return data.snapshot
}

/**
 * Fetch with timeout
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeout: number
): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    })
    clearTimeout(timeoutId)
    return response
  } catch (error) {
    clearTimeout(timeoutId)
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeout}ms`)
    }
    throw error
  }
}

/**
 * Fetch with exponential backoff retry
 */
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxAttempts: number = API_CONFIG.RETRY_ATTEMPTS
): Promise<Response> {
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`API request attempt ${attempt}/${maxAttempts}: ${url}`)
      return await fetchWithTimeout(url, options, API_CONFIG.TIMEOUT)
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error')
      console.warn(`Attempt ${attempt} failed:`, lastError.message)

      // Don't retry on client errors (4xx)
      if (lastError.message.includes('400') || lastError.message.includes('404')) {
        throw lastError
      }

      // Wait before retrying (exponential backoff)
      if (attempt < maxAttempts) {
        const delay = API_CONFIG.RETRY_DELAY * Math.pow(2, attempt - 1)
        console.log(`Retrying in ${delay}ms...`)
        await sleep(delay)
      }
    }
  }

  throw lastError || new Error('Failed to fetch after retries')
}

/**
 * Check if backend is healthy
 */
export async function checkBackendHealth(): Promise<{
  healthy: boolean
  error?: string
}> {
  try {
    const response = await fetchWithTimeout(
      `${API_CONFIG.BACKEND_URL}/health`,
      { method: 'GET' },
      5000 // 5 second timeout for health check
    )

    if (response.ok) {
      const data = await response.json()
      return {
        healthy: data.status === 'healthy'
      }
    }

    return {
      healthy: false,
      error: `Backend returned ${response.status}`
    }
  } catch (error) {
    return {
      healthy: false,
      error: error instanceof Error ? error.message : 'Connection failed'
    }
  }
}

/**
 * Sleep helper
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
