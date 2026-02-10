import { vi } from 'vitest'

export const getHeader = vi.fn()
export const getQuery = vi.fn(() => ({}))
export const readBody = vi.fn().mockImplementation(event => Promise.resolve(event._body || {}))

// Ensure createError mimics the H3 object structure
export const createError = vi.fn((opts) => {
  const err = new Error(opts.message || opts.statusMessage);
  (err as any).statusCode = opts.statusCode;
  (err as any).statusMessage = opts.statusMessage || opts.message;
  (err as any).data = opts.data
  return err
})
