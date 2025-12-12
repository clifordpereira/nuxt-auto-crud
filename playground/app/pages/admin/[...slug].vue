<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
definePageMeta({
  middleware: ['auth'],
  layout: 'dashboard',
})

const route = useRoute()
const resource = computed(() => {
  const slug = route.params.slug
  return Array.isArray(slug) ? slug[0] : slug
})

const { getSchema } = await useResourceSchemas()
const schema = computed(() => (resource.value ? getSchema(resource.value) : undefined))
</script>

<template>
  <CrudTable
    v-if="schema && resource"
    :resource="resource"
    :schema="schema"
  />
  <div
    v-else
    class="p-4 text-red-500"
  >
    Schema not found for resource: {{ resource }}
  </div>
</template>
