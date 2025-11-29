import { useRuntimeConfig } from '#imports'
import type { ModuleOptions } from '../../../types'

export const useAutoCrudConfig = (): ModuleOptions => {
  return useRuntimeConfig().autoCrud as ModuleOptions
}
