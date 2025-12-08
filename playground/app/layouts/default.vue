<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
const { loggedIn, clear } = useUserSession()

async function onLogout() {
  await clear()
  await navigateTo('/')
}
</script>

<template>
  <div class="min-h-screen bg-gray-200 dark:bg-gray-950">
    <header class="bg-white dark:bg-gray-800 shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div class="flex items-center gap-1.5 font-bold text-xl text-gray-900 dark:text-white">
          <UIcon
            name="i-heroicons-command-line"
            class="w-8 h-8 text-primary-500"
          />
          Nuxt Auto CRUD (Full Stack Example)
        </div>
        <nav>
          <template v-if="loggedIn">
            <UButton
              label="Logout"
              color="neutral"
              variant="ghost"
              size="md"
              class="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white px-3 py-2"
              @click="onLogout"
            />
          </template>
          <template v-else>
            <LoginModal
              label="Admin Login"
              color="neutral"
              variant="ghost"
              size="md"
              class="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white px-3 py-2"
            />
          </template>
        </nav>
      </div>
    </header>
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <slot />
    </main>
  </div>
</template>
