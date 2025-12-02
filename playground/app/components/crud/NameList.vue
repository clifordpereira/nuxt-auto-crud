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
}
else if (props.fieldName) {
  const baseName = props.fieldName.replace(/(_id|Id)$/, '')
  urlPath = pluralize(baseName) // e.g., user_id → users
}

const config = useRuntimeConfig().public
const crudBaseUrl = config.crudBaseUrl || '/api'

const { data: options } = await useFetch(() => `${crudBaseUrl}/${urlPath}`, {
  key: `crud-${urlPath}`,
  transform: (rows: Record<string, unknown>[]) =>
    rows?.map((row) => {
      const r = row as { id: string | number, name?: string, title?: string, email?: string }
      return {
        label: r.name || r.title || `#${r.id}`,
        value: r.id,
        extra: r.email,
      }
    }),
  lazy: true,
  headers: crudHeaders(),
})

function handleUpdate(value: unknown) {
  if (value && typeof value === 'object') {
    // If USelectMenu returns the full object despite value-attribute, extract the ID
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const id = (value as any).value || (value as any).id
    emit('update:modelValue', id)
  }
  else {
    emit('update:modelValue', value)
  }
}
</script>

<template>
  <USelectMenu
    :items="options || []"
    :model-value="modelValue as any"
    value-attribute="value"
    option-attribute="label"
    placeholder="Select"
    class="w-full"
    @update:model-value="handleUpdate"
  >
    <template #item-label="{ item }">
      <span>{{ item.label }}</span>
      <span
        v-if="item.extra"
        class="text-gray-400 text-xs ml-2"
      >({{ item.extra }})</span>
    </template>
  </USelectMenu>
</template>
