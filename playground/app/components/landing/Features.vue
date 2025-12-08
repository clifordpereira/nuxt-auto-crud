<script setup lang="ts">
defineOptions({
  name: 'LandingFeatures',
})
</script>

<template>
  <!-- Features -->
  <UCard class="shadow-lg">
    <template #header>
      <h2 class="text-xl font-semibold flex items-center gap-2">
        <UIcon
          name="i-heroicons-sparkles"
          class="text-primary-500"
        />
        Features
      </h2>
    </template>
    <ul class="space-y-3 text-sm text-gray-600 dark:text-gray-400">
      <li class="flex items-start gap-2">
        <UIcon
          name="i-heroicons-check-circle"
          class="text-green-500 mt-0.5 shrink-0"
        />
        <span><strong>Authentication:</strong> Built-in session management using <code>nuxt-auth-utils</code></span>
      </li>
      <li class="flex items-start gap-2">
        <UIcon
          name="i-heroicons-check-circle"
          class="text-green-500 mt-0.5 shrink-0"
        />
        <span><strong>Authorization:</strong> Fine-grained access control per resource and action using <code>nuxt-authorization</code></span>
      </li>
      <li class="flex items-start gap-2">
        <UIcon
          name="i-heroicons-check-circle"
          class="text-green-500 mt-0.5 shrink-0"
        />
        <span><strong>Auto-generated APIs:</strong> CRUD endpoints created automatically from Drizzle schema using <code>nuxt-auto-crud</code></span>
      </li>
      <li class="flex items-start gap-2">
        <UIcon
          name="i-heroicons-check-circle"
          class="text-green-500 mt-0.5 shrink-0"
        />
        <span><strong>Relations:</strong> Automatic handling of relationships between resources</span>
      </li>
      <li class="flex items-start gap-2">
        <UIcon
          name="i-heroicons-check-circle"
          class="text-green-500 mt-0.5 shrink-0"
        />
        <span><strong>Dynamic UI:</strong> Reusable Table and Form components that adapt dynamically to any resource or model</span>
      </li>
    </ul>
  </UCard>
</template>
