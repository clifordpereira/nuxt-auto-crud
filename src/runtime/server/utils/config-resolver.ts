import { useRuntimeConfig } from '#imports'

export const customHiddenFields: Record<string, string[]> = {}

export function getHiddenFields(modelName: string): string[] {
  const { autoCrud } = useRuntimeConfig().public
  const globalHidden = autoCrud.hiddenFields || []
  const custom = customHiddenFields[modelName] || []

  return [...globalHidden, ...custom]
}

export function getProtectedFields(): string[] {
  const { autoCrud } = useRuntimeConfig().public
  return autoCrud.protectedFields || []
}

export function getSystemUserFields(): string[] {
  const { autoCrud } = useRuntimeConfig().public
  return autoCrud.systemUserFields || []
}

export function getPublicColumns(modelName: string): string[] | undefined {
  const { resources } = useRuntimeConfig().public.autoCrud
  return resources?.[modelName]
}