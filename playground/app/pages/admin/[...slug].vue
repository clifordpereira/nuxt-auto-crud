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

</script>

<template>
  <div v-if="resource">
    <CrudTable :resource="resource" />
  </div>
  <div v-else class="p-4">
    Loading Data Table...
  </div>
</template>
