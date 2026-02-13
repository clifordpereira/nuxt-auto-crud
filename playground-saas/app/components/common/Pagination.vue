<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
const props = defineProps<{
  data: Record<string, unknown>[] // full dataset passed from parent
  itemsPerPage?: number
}>()

const emit = defineEmits<{
  (e: 'update:paginated', value: Record<string, unknown>[]): void
}>()

// defaults
const page = ref(1)
const search = ref('')
const itemsPerPage = ref(props.itemsPerPage ?? 10)

// filter
const searchedItems = computed(() => {
  if (!search.value) return props.data ?? []
  return (props.data ?? []).filter(row =>
    Object.values(row)
      .join(' ')
      .toLowerCase()
      .includes(search.value.toLowerCase()),
  )
})

// pagination
const paginatedItems = computed(() => {
  const start = (page.value - 1) * itemsPerPage.value
  return searchedItems.value.slice(start, start + itemsPerPage.value)
})

// keep parent updated
watch(
  [paginatedItems],
  () => {
    emit('update:paginated', paginatedItems.value)
  },
  { immediate: true },
)

watch([search], () => {
  page.value = 1
})

watch([searchedItems], () => {
  const maxPage
    = Math.ceil(searchedItems.value.length / itemsPerPage.value) || 1
  if (page.value > maxPage) {
    page.value = maxPage
  }
})
</script>

<template>
  <div class="flex justify-between items-center my-2">
    <UPagination
      v-model:page="page"
      :total="searchedItems.length"
      :items-per-page="itemsPerPage"
    />
    <CommonSearchButton v-model="search" />
  </div>
</template>
