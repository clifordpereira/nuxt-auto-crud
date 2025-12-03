import { useAsyncData, useRequestHeaders } from '#imports'

export const useResourceSchemas = async () => {
  const { data: schemas, status, error, refresh } = await useAsyncData('resource-schemas', () => $fetch<Record<string, { resource: string, fields: { name: string, type: string, required?: boolean, selectOptions?: string[] }[] }>>('/api/_schema', {
    headers: useRequestHeaders(['cookie']),
  }))

  const getSchema = (resource: string) => {
    if (!schemas.value) return undefined
    return schemas.value[resource]
  }

  return {
    schemas,
    getSchema,
    status,
    error,
    refresh,
  }
}
