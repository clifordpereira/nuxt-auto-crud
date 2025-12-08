<script setup lang="ts">
</script>

<template>
  <div class="py-8 border-t border-gray-200 dark:border-gray-800">
    <div class="max-w-7xl mx-auto px-4">
      <UCard class="shadow-lg">
        <template #header>
          <h2 class="text-xl font-semibold flex items-center gap-2">
            <UIcon
              name="i-heroicons-link"
              class="text-primary-500"
            />
            Quick Links
          </h2>
        </template>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          <UButton
            href="https://auto-crud.clifland.in/"
            target="_blank"
            variant="outline"
            block
            icon="i-heroicons-book-open"
          >
            Documentation
          </UButton>
          <UButton
            href="https://github.com/clifordpereira/nuxt-auto-crud"
            target="_blank"
            variant="outline"
            block
            icon="i-simple-icons-github"
          >
            Repository
          </UButton>
          <UButton
            href="https://github.com/clifordpereira/nuxt-auto-crud/issues"
            target="_blank"
            variant="outline"
            block
            icon="i-heroicons-bug-ant"
          >
            Report Issue
          </UButton>
          <UButton
            href="https://github.com/clifordpereira/nuxt-auto-crud/blob/HEAD/CONTRIBUTING.md"
            target="_blank"
            variant="outline"
            block
            icon="i-heroicons-users"
          >
            Collaboration Guide
          </UButton>
          <UButton
            href="https://www.clifland.in/"
            target="_blank"
            variant="outline"
            block
            icon="i-heroicons-globe-alt"
          >
            Creator Website
          </UButton>
        </div>
      </UCard>
    </div>
  </div>
</template>
