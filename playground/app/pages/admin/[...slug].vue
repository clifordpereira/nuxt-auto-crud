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

const { data: schema, error } = await useFetch(() => `/api/_nac/_schema/${resource.value}`)
</script>

<template>
  <div v-if="schema && resource">
    <CrudTable :resource="resource" :schema="schema" />
  </div>
  <div v-else-if="error" class="p-4 text-red-500">
    Error loading schema: {{ error.statusMessage || 'Not Found' }}
  </div>
  <div v-else class="p-4">
    Loading schema...
  </div>
</template>
