<script setup lang="ts">
const props = defineProps<{
  resourceCounts: Record<string, number>
}>()

const iconMap: Record<string, string> = {
  users: 'i-lucide-user'
}

const stats = computed(() =>
  Object.entries(props.resourceCounts).map(([resource, count]) => ({
    title: resource.charAt(0).toUpperCase() + resource.slice(1),
    icon: iconMap[resource] || 'i-lucide-database',
    value: count,
    to: `/resource/${resource}`
  }))
)
</script>

<template>
  <UPageGrid class="lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-px">
    <UPageCard
      v-for="(stat, index) in stats"
      :key="index"
      :icon="stat.icon"
      :title="stat.title"
      :to="stat.to"
      variant="subtle"
      :ui="{
        container: 'gap-y-1.5',
        wrapper: 'items-start',
        leading: 'p-2.5 rounded-full bg-primary/10 ring ring-inset ring-primary/25 flex-col',
        title: 'font-normal text-muted text-xs uppercase'
      }"
      class="lg:rounded-none first:rounded-l-lg last:rounded-r-lg hover:z-1"
    >
      <div class="flex items-center gap-2">
        <span class="text-2xl font-semibold text-highlighted">
          {{ stat.value }}
        </span>
      </div>
    </UPageCard>
  </UPageGrid>
</template>
