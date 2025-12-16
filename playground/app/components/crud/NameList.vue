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
        extra: r.email
      }
    }),
  lazy: true,
  headers: crudHeaders()
})

const selected = computed({
  get: () => options.value?.find(opt => opt.value == props.modelValue),
  set: (val: { value: string | number } | null) => {
    emit('update:modelValue', val?.value)
  }
})
</script>

<template>
  <USelectMenu
    v-model="selected"
    :items="options || []"
    option-attribute="label"
    placeholder="Select"
    class="w-full"
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
