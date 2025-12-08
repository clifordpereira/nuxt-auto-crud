<script setup lang="ts">
defineOptions({
  name: 'DashboardPage',
})

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
})

await navigateTo('/resource/users')
</script>

<template>
  <div class="flex items-center justify-center h-full">
    <div class="text-center">
      <UIcon
        name="i-heroicons-wrench-screwdriver"
        class="w-16 h-16 mx-auto text-gray-400 mb-4"
      />
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
        Under Construction
      </h1>
      <p class="mt-2 text-gray-500">
        This dashboard is currently being built.
      </p>
    </div>
  </div>
</template>
