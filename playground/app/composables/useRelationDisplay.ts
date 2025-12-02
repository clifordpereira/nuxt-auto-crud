import pluralize from 'pluralize'

export function useRelationDisplay(
  schema: {
    resource: string
    fields: { name: string, type: string, required?: boolean }[]
  }
) {
  const config = useRuntimeConfig().public
  const crudBaseUrl = config.crudBaseUrl || '/api'
  const relations = ref<Record<string, Record<string, string>>>({});

  const relationFields = computed(() =>
    schema.fields.filter((f) => f.name.endsWith("_id"))
  );

  const fetchRelations = async () => {
    if (relationFields.value.length === 0) return;

    await Promise.all(
      relationFields.value.map(async (field) => {
        const resourceName = pluralize(field.name.replace("_id", ""));
        const { data: relatedData } = await useFetch<Record<string, unknown>[]>(
          `${crudBaseUrl}/${resourceName}`,
          {
            headers: crudHeaders(),
          }
        );
        if (relatedData.value) {
          relations.value[field.name] = relatedData.value.reduce<Record<string, string>>(
            (acc, item) => {
              const id = item.id as number;
              acc[id] = (item.name || item.title || `#${item.id}`) as string;
              return acc;
            },
            {}
          );
        }
      })
    );
  };

  const getDisplayValue = (key: string, value: unknown) => {
    if (relations.value[key] && typeof value === 'number') {
      return relations.value[key][value] || value;
    }
    return isDate(value) ? formatDateForDisplay(value) : value;
  };

  return {
    relations,
    fetchRelations,
    getDisplayValue
  }
}
