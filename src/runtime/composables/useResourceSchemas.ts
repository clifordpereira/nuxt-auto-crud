import { useAsyncData, useRequestHeaders, useRuntimeConfig } from '#imports'
import type { Ref } from 'vue'
import type { AsyncData } from '#app'

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
  error: AsyncData<ResourceSchemas, Error | null>['error']
  refresh: AsyncData<ResourceSchemas, Error | null>['refresh']
}> => {
  const endpointPrefix = useRuntimeConfig().public.autoCrud?.endpointPrefix || '/api/nac'
  const { data: schemas, status, error, refresh } = await useAsyncData<ResourceSchemas>('resource-schemas', () => $fetch(`${endpointPrefix}/_schema`, {
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
