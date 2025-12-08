<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
const siteData = {
  title: 'Nuxt Auto CRUD',
  description: 'Automatic CRUD API & UI generation for Nuxt applications',
  footer: 'Built with Nuxt, Drizzle ORM, and nuxt-auto-crud',
}

definePageMeta({
  layout: false,
})

const { loggedIn } = useUserSession()

// Redirect to dashboard if already logged in
if (loggedIn.value) {
  await navigateTo('/resource/users')
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <!-- Header -->
      <div class="text-center">
        <UIcon
          name="i-heroicons-command-line"
          class="mx-auto h-16 w-16 text-primary-500"
        />
        <h1 class="mt-6 text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
          {{ siteData.title }}
        </h1>
        <p class="mt-2 text-lg text-gray-600 dark:text-gray-400">
          {{ siteData.description }}
        </p>
      </div>

      <!-- Main Content & Features Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <!-- Main Content (Left Column) -->
        <LandingMainContent />

        <!-- Features (Right Column) -->
        <LandingFeatures />
      </div>

      <!-- Usage Guide -->
      <LandingUsageGuide />

      <!-- Quick Links -->
      <LandingQuickLinks />

      <!-- Footer -->
      <div class="text-center text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-800 pt-8">
        <p>{{ siteData.footer }}</p>
      </div>
    </div>
  </div>
</template>
