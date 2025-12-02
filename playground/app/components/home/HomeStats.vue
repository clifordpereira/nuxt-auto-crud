<script setup lang="ts">
const props = defineProps<{
  usersCount: number
  customersCount: number
  productsCount: number
}>()

const stats = computed(() => [{
  title: 'Users',
  icon: 'i-lucide-user',
  value: props.usersCount,
  to: '/resource/users',
}, {
  title: 'Customers',
  icon: 'i-lucide-users',
  value: props.customersCount,
  to: '/resource/customers',
}, {
  title: 'Products',
  icon: 'i-lucide-package',
  value: props.productsCount,
  to: '/resource/products',
}])
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
        title: 'font-normal text-muted text-xs uppercase',
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
