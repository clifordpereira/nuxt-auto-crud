import { useRuntimeConfig } from '#imports'
import type { ModuleOptions } from '../../../types'

/**
 * Merges Public and Private AutoCrud configuration.
 * On the server, it provides the full ModuleOptions.
 * On the client, it provides only the public-safe subset.
 */
export const useAutoCrudConfig = (): ModuleOptions => {
  const config = useRuntimeConfig()
  
  // Return the merged configuration
  // Note: On client-side, the private keys will naturally be undefined
  return {
    ...config.public.autoCrud,
    ...((config as any).autoCrud || {}) 
  } as ModuleOptions
}