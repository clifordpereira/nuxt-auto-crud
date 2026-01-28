import { useRuntimeConfig } from '#imports'
import type { RuntimeModuleOptions } from '../../../types'

export const useAutoCrudConfig = (): RuntimeModuleOptions => {
  return useRuntimeConfig().public.autoCrud as RuntimeModuleOptions
}
