<script setup lang="ts">
const { loggedIn, clear } = useUserSession()
</script>

<template>
  <div class="space-y-8">
    <!-- Login Section -->
    <div class="max-w-xl mx-auto">
      <UCard class="shadow-lg">
        <template #header>
          <h2 class="text-xl font-semibold flex items-center gap-2">
            <UIcon
              name="i-heroicons-user-circle"
              class="text-primary-500"
            />
            Login
          </h2>
        </template>
        <div class="space-y-4">
          <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <h3 class="font-semibold mb-3 text-gray-900 dark:text-white">
              Demo Credentials (Password: $1Password)
            </h3>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <p class="font-semibold text-primary-600 dark:text-primary-400">
                  Admin
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Full Access
                </p>
                <p class="text-gray-600 dark:text-gray-300 font-mono text-xs">
                  admin@example.com
                </p>
              </div>
              <div>
                <p class="font-semibold text-primary-600 dark:text-primary-400">
                  Manager
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  CRUD Access
                </p>
                <p class="text-gray-600 dark:text-gray-300 font-mono text-xs">
                  manager@example.com
                </p>
              </div>
              <div>
                <p class="font-semibold text-primary-600 dark:text-primary-400">
                  Moderator
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Read Only
                </p>
                <p class="text-gray-600 dark:text-gray-300 font-mono text-xs">
                  moderator@example.com
                </p>
              </div>
            </div>
          </div>
          <LoginModal v-if="!loggedIn" />
          <UButton
            v-else
            color="neutral"
            variant="solid"
            size="lg"
            icon="i-heroicons-arrow-right-on-rectangle"
            block
            @click="clear"
          >
            Logout
          </UButton>
        </div>
      </UCard>
    </div>
  </div>
</template>
