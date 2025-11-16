/**
 * Tests for DOM snapshot utilities
 */

import { describe, it, expect } from 'vitest'
import { validateUrl } from './domSnapshot.js'

describe('validateUrl', () => {
  it('should accept valid HTTP URLs', () => {
    const result = validateUrl('http://example.com')
    expect(result.valid).toBe(true)
  })

  it('should accept valid HTTPS URLs', () => {
    const result = validateUrl('https://example.com')
    expect(result.valid).toBe(true)
  })

  it('should reject non-HTTP protocols', () => {
    const result = validateUrl('ftp://example.com')
    expect(result.valid).toBe(false)
    expect(result.error).toContain('HTTP')
  })

  it('should reject localhost', () => {
    const result = validateUrl('http://localhost:3000')
    expect(result.valid).toBe(false)
    expect(result.error).toContain('Private')
  })

  it('should reject private IP ranges', () => {
    expect(validateUrl('http://192.168.1.1').valid).toBe(false)
    expect(validateUrl('http://10.0.0.1').valid).toBe(false)
    expect(validateUrl('http://172.16.0.1').valid).toBe(false)
    expect(validateUrl('http://127.0.0.1').valid).toBe(false)
  })

  it('should reject invalid URL formats', () => {
    const result = validateUrl('not a url')
    expect(result.valid).toBe(false)
    expect(result.error).toContain('Invalid')
  })

  it('should accept URLs with paths and params', () => {
    const result = validateUrl('https://example.com/path?foo=bar#hash')
    expect(result.valid).toBe(true)
  })
})
