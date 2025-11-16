/**
 * Tests for utility functions
 */

import { describe, it, expect } from 'vitest'
import {
  parseColor,
  sanitizeName,
  mapFontWeight,
  getLayoutMode,
  deduplicateColors,
  isTransparent,
  truncateText,
  extractDomain
} from './utils'

describe('parseColor', () => {
  it('should parse hex colors', () => {
    expect(parseColor('#ff0000')).toEqual({ r: 1, g: 0, b: 0 })
    expect(parseColor('#00ff00')).toEqual({ r: 0, g: 1, b: 0 })
    expect(parseColor('#0000ff')).toEqual({ r: 0, g: 0, b: 1 })
  })

  it('should parse short hex colors', () => {
    expect(parseColor('#f00')).toEqual({ r: 1, g: 0, b: 0 })
    expect(parseColor('#0f0')).toEqual({ r: 0, g: 1, b: 0 })
  })

  it('should parse rgb colors', () => {
    expect(parseColor('rgb(255, 0, 0)')).toEqual({ r: 1, g: 0, b: 0 })
    expect(parseColor('rgb(0, 255, 0)')).toEqual({ r: 0, g: 1, b: 0 })
  })

  it('should handle rgba colors', () => {
    expect(parseColor('rgba(255, 0, 0, 0.5)')).toEqual({ r: 1, g: 0, b: 0 })
  })

  it('should handle named colors', () => {
    expect(parseColor('black')).toEqual({ r: 0, g: 0, b: 0 })
    expect(parseColor('white')).toEqual({ r: 1, g: 1, b: 1 })
    expect(parseColor('red')).toEqual({ r: 1, g: 0, b: 0 })
  })

  it('should fallback to black for unknown colors', () => {
    expect(parseColor('invalid')).toEqual({ r: 0, g: 0, b: 0 })
  })
})

describe('sanitizeName', () => {
  it('should remove special characters', () => {
    expect(sanitizeName('Hello @#$ World!')).toBe('Hello  World')
  })

  it('should trim whitespace', () => {
    expect(sanitizeName('  Spaced Out  ')).toBe('Spaced Out')
  })

  it('should truncate long names', () => {
    const longName = 'a'.repeat(100)
    expect(sanitizeName(longName)).toHaveLength(50)
  })

  it('should return "Unnamed" for empty strings', () => {
    expect(sanitizeName('')).toBe('Unnamed')
    expect(sanitizeName('   ')).toBe('Unnamed')
  })
})

describe('mapFontWeight', () => {
  it('should map numeric weights to style names', () => {
    expect(mapFontWeight(100)).toBe('Thin')
    expect(mapFontWeight(400)).toBe('Regular')
    expect(mapFontWeight(700)).toBe('Bold')
    expect(mapFontWeight(900)).toBe('Black')
  })

  it('should handle string weights', () => {
    expect(mapFontWeight('normal')).toBe('Regular')
    expect(mapFontWeight('bold')).toBe('Bold')
    expect(mapFontWeight('400')).toBe('Regular')
  })

  it('should fallback to Regular for unknown weights', () => {
    expect(mapFontWeight(450)).toBe('Regular')
    expect(mapFontWeight('unknown')).toBe('Regular')
  })
})

describe('getLayoutMode', () => {
  it('should detect horizontal layouts', () => {
    expect(getLayoutMode('row')).toBe('HORIZONTAL')
    expect(getLayoutMode('row-reverse')).toBe('HORIZONTAL')
  })

  it('should detect vertical layouts', () => {
    expect(getLayoutMode('column')).toBe('VERTICAL')
    expect(getLayoutMode('column-reverse')).toBe('VERTICAL')
  })

  it('should return NONE for other values', () => {
    expect(getLayoutMode('block')).toBe('NONE')
    expect(getLayoutMode(undefined)).toBe('NONE')
  })
})

describe('deduplicateColors', () => {
  it('should remove duplicate colors', () => {
    const colors = ['#ff0000', '#ff0000', '#00ff00']
    expect(deduplicateColors(colors)).toEqual(['#ff0000', '#00ff00'])
  })

  it('should handle similar colors (within threshold)', () => {
    const colors = ['#ff0000', '#ff0001'] // Very close reds
    const result = deduplicateColors(colors)
    expect(result).toHaveLength(1)
  })
})

describe('isTransparent', () => {
  it('should detect transparent keyword', () => {
    expect(isTransparent('transparent')).toBe(true)
  })

  it('should detect rgba with 0 alpha', () => {
    expect(isTransparent('rgba(0, 0, 0, 0)')).toBe(true)
    expect(isTransparent('rgba(255, 0, 0, 0)')).toBe(true)
  })

  it('should not flag opaque colors as transparent', () => {
    expect(isTransparent('#ff0000')).toBe(false)
    expect(isTransparent('rgb(255, 0, 0)')).toBe(false)
    expect(isTransparent('rgba(255, 0, 0, 1)')).toBe(false)
  })
})

describe('truncateText', () => {
  it('should truncate long text', () => {
    const text = 'a'.repeat(200)
    expect(truncateText(text)).toHaveLength(103) // 100 + '...'
  })

  it('should not truncate short text', () => {
    const text = 'Short text'
    expect(truncateText(text)).toBe(text)
  })
})

describe('extractDomain', () => {
  it('should extract domain from URL', () => {
    expect(extractDomain('https://example.com/path')).toBe('example.com')
    expect(extractDomain('https://www.example.com')).toBe('example.com')
    expect(extractDomain('http://subdomain.example.com')).toBe('subdomain.example.com')
  })

  it('should handle invalid URLs', () => {
    expect(extractDomain('not a url')).toBe('website')
  })
})
