import { ref, useFetch, useRequestHeaders } from '#imports'

export const useRelationDisplay = (
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
    // 1. Fetch relations metadata
    const { data: relations } = await useFetch<Record<string, Record<string, string>>>('/api/_relations')
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
        // We assume the API for targetTable is /api/[targetTable]
        try {
          const relatedData = await $fetch<Record<string, unknown>[]>(`/api/${targetTable}`, { headers })

          if (relatedData) {
            displayValues.value[fieldName] = relatedData.reduce<Record<string, string>>(
              (acc, item) => {
                const id = item.id as number
                // Try to find a good display name
                const label = (item.name || item.title || item.email || item.username || `#${item.id}`) as string
                acc[id] = label
                return acc
              },
              {},
            )
          }
        }
        catch (error) {
          console.error(`Failed to fetch relation data for ${targetTable}:`, error)
        }
      }),
    )
  }

  const getDisplayValue = (key: string, value: unknown) => {
    if (displayValues.value[key] && (typeof value === 'number' || typeof value === 'string')) {
      return displayValues.value[key][value as string] || value
    }
    return value
  }

  return {
    fetchRelations,
    getDisplayValue,
    relationsMap,
  }
}
