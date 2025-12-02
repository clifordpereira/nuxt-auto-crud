import { useFetch } from '#imports'

export const useResourceSchemas = async () => {
  const { data: schemas, status, error, refresh } = await useFetch<Record<string, { resource: string, fields: { name: string, type: string, required?: boolean, selectOptions?: string[] }[] }>>('/api/_schema')

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
