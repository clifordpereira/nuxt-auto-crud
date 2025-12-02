<script setup lang="ts">
import pluralize from 'pluralize'

const props = defineProps<{
  modelValue: string | number | null
  fieldName?: string // case 1: derive from fieldName
  tableName?: string // case 2: directly provided (with query support)
}>()

const emit = defineEmits(['update:modelValue'])

let urlPath = ''
if (props.tableName) {
  urlPath = props.tableName
} else if (props.fieldName) {
  const baseName = props.fieldName.replace(/_id$/, '')
  urlPath = pluralize(baseName) // e.g., user_id → users
}

const config = useRuntimeConfig().public
const crudBaseUrl = config.crudBaseUrl || '/api'

const { data: options } = await useFetch(() => `${crudBaseUrl}/${urlPath}`, {
  key: `crud-${urlPath}`,
  transform: (rows: any[]) =>
    rows?.map(row => ({
      label: row.name || row.title || `#${row.id}`,
      value: row.id,
      extra: row.email
    })),
  lazy: true,
  headers: crudHeaders()
})
</script>

<template>
  <USelectMenu
    :items="options"
    :model-value="modelValue"
    value-key="value"
    placeholder="Select"
    class="w-full"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <template #item-label="{ item }">
      {{ item.label }}
      <span class="text-muted">{{ item.extra }}</span>
    </template>
  </USelectMenu>
</template>
