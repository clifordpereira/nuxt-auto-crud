<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { useChangeCase } from '@vueuse/integrations/useChangeCase'
import resourceAbility from '~~/shared/utils/abilities'

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
  headers: crudHeaders(),
})

// Fetch relations
const { fetchRelations, getDisplayValue } = useRelationDisplay(props.schema)
await fetchRelations()

async function onDelete(id: number) {
  if (!confirm('Are you sure you want to delete this row?')) return

  await useCrudFetch('DELETE', props.resource, id)
}

const paginatedItems = ref<Record<string, unknown>[]>([])
</script>

<template>
  <UCard
    class="w-full"
    :ui="{
      root: 'divide-y divide-gray-200 dark:divide-gray-700',
      header: 'px-4 py-5',
      body: 'divide-y divide-gray-200 dark:divide-gray-700',
      footer: 'p-4',
    }"
  >
    <!-- Filters / Pagination Area -->
    <div class="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <CommonPagination
        :data="data || []"
        :items-per-page="10"
        @update:paginated="paginatedItems = $event"
      />
      <Can :ability="resourceAbility" :args="[resource, 'create']">
        <CrudCreateRow
          :resource="resource"
          :schema="schema"
        />
      </Can>
    </div>

    <!-- Table -->
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
        <thead
          v-if="data?.length"
          class="bg-gray-50 dark:bg-gray-800"
        >
          <tr>
            <th
              v-for="(value, key) in data[0]"
              :key="key"
              scope="col"
              class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white"
            >
              {{ useChangeCase(String(key), 'capitalCase').value }}
            </th>
            <th
              scope="col"
              class="relative py-3.5 pl-3 pr-4 sm:pr-6"
            >
              <span class="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody v-else>
          <tr>
            <td
              colspan="100%"
              class="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
            >
              No records found.
            </td>
          </tr>
        </tbody>

        <tbody class="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
          <tr
            v-for="(row, i) in paginatedItems"
            :key="i"
            class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
          >
            <td
              v-for="(value, key) in row"
              :key="key"
              class="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400"
            >
              {{ getDisplayValue(String(key), value) }}
            </td>
            <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
              <UPopover
                :content="{ align: 'end', side: 'bottom' }"
              >
                <UButton
                  icon="i-lucide-more-vertical"
                  color="neutral"
                  variant="ghost"
                  size="xs"
                />

                <template #content>
                  <div class="p-1 flex flex-col gap-1 min-w-[120px]">
                    <Can :ability="resourceAbility" :args="[resource, 'read']">
                      <CrudViewRow
                        :row="row"
                        :schema="schema"
                      />
                    </Can>
                    <Can :ability="resourceAbility" :args="[resource, 'update']">
                      <CrudEditRow
                        :resource="resource"
                        :row="row"
                        :schema="schema"
                      />
                    </Can>
                    <Can :ability="resourceAbility" :args="[resource, 'delete']">
                      <UButton
                        label="Delete"
                        color="error"
                        variant="ghost"
                        size="xs"
                        icon="i-lucide-trash"
                        class="justify-start"
                        @click="onDelete(row.id as number)"
                      />
                    </Can>
                  </div>
                </template>
              </UPopover>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </UCard>
</template>
