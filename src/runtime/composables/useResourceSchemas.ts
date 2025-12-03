import { useAsyncData, useRequestHeaders } from '#imports'
import type { Ref } from 'vue'

export interface ResourceField {
  name: string
  type: string
  required?: boolean
  selectOptions?: string[]
}

export interface ResourceSchema {
  resource: string
  fields: ResourceField[]
}

export type ResourceSchemas = Record<string, ResourceSchema>

export const useResourceSchemas = async (): Promise<{
  schemas: Ref<ResourceSchemas | null | undefined>
  getSchema: (resource: string) => ResourceSchema | undefined
  status: Ref<'idle' | 'pending' | 'success' | 'error'>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: Ref<any>
  refresh: () => Promise<void>
}> => {
  const { data: schemas, status, error, refresh } = await useAsyncData<ResourceSchemas>('resource-schemas', () => $fetch('/api/_schema', {
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
    refresh: refresh as unknown as () => Promise<void>,
  }
}
