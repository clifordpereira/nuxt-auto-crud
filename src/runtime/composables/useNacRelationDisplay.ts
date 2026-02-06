// @ts-ignore - provided by nuxt-authorization in consumer app
import { ref, useFetch, useRequestHeaders, useRuntimeConfig } from '#imports'

export const useNacRelationDisplay = (
  schema: {
    resource: string
    fields: { name: string, type: string, required?: boolean }[]
  },
) => {
  const resourceName = schema.resource
  const relationsMap = ref<Record<string, Record<string, string>>>({})
  const displayValues = ref<Record<string, Record<string, string>>>({})
  const headers = useRequestHeaders(['cookie'])

  const fetchRelations = async () => {
    const { endpointPrefix } = useRuntimeConfig().public.autoCrud
    // Reset display values to prevent stale data
    displayValues.value = {}
    
    // 1. Fetch relations metadata
    const { data: relations } = await useFetch<Record<string, Record<string, string>>>(`${endpointPrefix}/_relations`)
    if (relations.value) {
      relationsMap.value = relations.value
    }

    // 2. Identify relation fields for this resource
    const resourceRelations = relationsMap.value[resourceName] || {}
    const relationFields = Object.keys(resourceRelations)

    if (relationFields.length === 0) return

    // 3. Fetch data for each relation
    await Promise.all(
      relationFields.map(async (fieldName) => {
        const targetTable = resourceRelations[fieldName]
        
        try {
          const relatedData = await $fetch<Record<string, unknown>[]>(`${endpointPrefix}/${targetTable}`, { headers })

          if (relatedData) {
            displayValues.value[fieldName] = relatedData.reduce<Record<string, string>>(
              (acc, item) => {
                const id = String(item.id)
                // Try to find a good display name
                const label = (item.name || item.title || item.email || item.username || `#${item.id}`) as string
                acc[id] = label
                return acc
              },
              {},
            )
          }
        }
        catch (error: any) {
          // Ignore 403 Forbidden (User not allowed to list this relation)
          if (error.statusCode === 403) return
          console.error(`Failed to fetch relation data for ${targetTable}:`, error)
        }
      }),
    )
  }

  const getDisplayValue = (key: string, value: unknown) => {
    if (displayValues.value[key] && (typeof value === 'number' || typeof value === 'string')) {
      return displayValues.value[key][String(value)] || value
    }
    return value
  }

  return {
    fetchRelations,
    getDisplayValue,
    relationsMap,
  }
}
