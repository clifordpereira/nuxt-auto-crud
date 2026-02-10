import { vi } from 'vitest'

export const useRuntimeConfig = vi.fn(() => ({
  apiSecretToken: 'test_secret',
}))

export const getUserSession = vi.fn()
export const requireUserSession = vi.fn()
export const getHiddenFields = vi.fn(() => [])
export const allows = vi.fn()
