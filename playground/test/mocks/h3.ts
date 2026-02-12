import { vi } from 'vitest'

export const getHeader = vi.fn()
export const getQuery = vi.fn(() => ({}))
export const readBody = vi.fn().mockImplementation(event => Promise.resolve(event._body || {}))

// Ensure createError mimics the H3 object structure
export const createError = vi.fn((opts) => {
  const err = new Error(opts.message || opts.statusMessage) as Error & { statusCode?: number, statusMessage?: string, data?: any }
  err.statusCode = opts.statusCode
  err.statusMessage = opts.statusMessage || opts.message
  err.data = opts.data
  return err
})
