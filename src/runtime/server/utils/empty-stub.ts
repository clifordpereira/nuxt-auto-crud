/**
 * This file serves as a placeholder stub for the Drizzle relations module.
 * It is imported when the user does not provide a custom relations file in their Nuxt configuration.
 * This prevents TypeScript compilation errors by satisfying the module alias requirements.
 */
import type { DBQueryConfig } from 'drizzle-orm'

// 🟢 FORCE RUNTIME EMISSION: Assigning an object literal guarantees a valid .mjs bundle artifact
const _runtimeGuard = true

// export empty relations object
export const relations: Record<string, unknown> = {}

// export empty table query config object
export const nacTableQueryConfig: Record<string, DBQueryConfig> = {}

// Keep it valid as an explicit ESM module
export default {}
