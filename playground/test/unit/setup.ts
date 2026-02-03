import { vi } from 'vitest'
import * as autoImports from '#imports'
import * as h3 from 'h3'

// Inject all mocks into globalThis to satisfy Nuxt auto-imports in Vitest node environment
Object.entries(autoImports).forEach(([key, value]) => {
  (globalThis as any)[key] = value
})

Object.entries(h3).forEach(([key, value]) => {
  (globalThis as any)[key] = value
})
