<script setup lang="ts">
import pluralize from 'pluralize'

const props = defineProps<{
  resource: string
  schema: {
    resource: string
    fields: { name: string, type: string, required?: boolean }[]
  }
}>()

const config = useRuntimeConfig().public
const crudBaseUrl = config.crudBaseUrl || '/api'

const { data } = await useFetch(`${crudBaseUrl}/${props.resource}`, {
  headers: crudHeaders()
})

// Fetch relations
const { fetchRelations, getDisplayValue } = useRelationDisplay(props.schema)
await fetchRelations()

async function onDelete(id: number) {
  if (!confirm('Are you sure you want to delete this row?')) return

  await useCrudFetch('DELETE', props.resource, id)
}

const paginatedItems = ref<any[]>([])
</script>

<template>
  <div class="overflow-x-auto">
    <h1 class="text-2xl font-bold text-center mt-3">
      List {{ resource }}
    </h1>
    <CrudCreateRow :resource="resource" :schema="schema" />

    <CommonPagination
      :data="data || []"
      :items-per-page="10"
      @update:paginated="paginatedItems = $event"
    />

    <table class="min-w-full border-collapse border border-gray-300 mt-1">
      <!-- Table Head -->
      <thead v-if="data?.length">
        <tr>
          <th
            v-for="(value, key) in data[0]"
            :key="key"
            class="border border-gray-300 px-4 py-2 text-left bg-gray-500"
          >
            {{ key }}
          </th>
          <th class="border border-gray-300 px-4 py-2 text-left bg-gray-500">
            &nbsp;
          </th>
        </tr>
      </thead>
      <tbody v-else>
        <tr>
          <td colspan="100%" class="px-4 py-2 text-center text-gray-500">
            No records found.
          </td>
        </tr>
      </tbody>

      <!-- Table Body -->
      <tbody>
        <tr v-for="(row, i) in paginatedItems" :key="i">
          <td
            v-for="(value, key) in row"
            :key="key"
            class="border border-gray-300 px-4 py-2"
          >
            {{ getDisplayValue(key as string, value) }}
          </td>
          <td class="border border-gray-300 px-4 py-2">
            <UPopover
              :content="{ align: 'start', side: 'left' }"
              class="relative"
            >
              <!-- Trigger button (kebab menu) -->
              <UButton
                icon="i-lucide-more-vertical"
                color="neutral"
                variant="outline"
                size="sm"
                class="p-1"
              />

              <template #content>
                <div
                  class="bg-slate-200 border rounded shadow-md p-2 flex flex-col gap-1 min-w-[120px]"
                >
                  <CrudViewRow :row="row" />
                  <CrudEditRow :resource="resource" :row="row" :schema="schema" />
                  <UButton
                    label="Delete"
                    color="error"
                    variant="outline"
                    size="sm"
                    @click="onDelete(row.id)"
                  />
                </div>
              </template>
            </UPopover>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
