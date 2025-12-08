<script setup lang="ts">
const contentData = {
  title: 'How to use this Playground',
  description: 'Explore the capabilities of Nuxt Auto CRUD with this interactive demo.',
  steps: [
    {
      title: 'Test Auth',
      description: 'Log in with different roles (Admin, Manager, Moderator) to see the effect. Permissions are controlled in \'app/config/auth/<table>.json\'',
    },
    {
      title: 'Extend Schema',
      description: 'Add new tables in server/database/schema and restart the server to use the new tables. If needed use \'npm db:generate\'',
    },
  ],
  config: `{
  "users": {
    "auth": {
      "admin": true,
      "manager": ["list", "read", "create", "update", "delete"],
      "moderator": ["list", "read"],
      "customer": false,
      "user": false,
      "public": false
    }
  }
}`,
}
</script>

<template>
  <div class="space-y-8">
    <div class="text-center mb-10">
      <h2 class="text-3xl font-bold text-gray-900 dark:text-white">
        {{ contentData.title }}
      </h2>
      <p class="mt-4 text-lg text-gray-600 dark:text-gray-300">
        {{ contentData.description }}
      </p>
    </div>

    <div class="max-w-7xl mx-auto px-4">
      <div class="grid gap-8 lg:grid-cols-2 items-start">
        <!-- Left Column: Steps -->
        <div class="space-y-6">
          <UCard
            v-for="(step, index) in contentData.steps"
            :key="index"
          >
            <template #header>
              <div class="flex items-center gap-2">
                <UBadge
                  color="primary"
                  variant="solid"
                >
                  {{ index + 1 }}
                </UBadge>
                <h3 class="text-xl font-semibold">
                  {{ step.title }}
                </h3>
              </div>
            </template>
            <p class="text-gray-600 dark:text-gray-300">
              {{ step.description }}
            </p>
          </UCard>
        </div>

        <!-- Right Column: Configuration -->
        <div class="bg-gray-900 dark:bg-gray-950 rounded-xl p-6 shadow-lg border border-gray-800">
          <div class="mb-4">
            <h3 class="text-lg font-semibold text-white">
              Example Auth Configuration
            </h3>
            <p class="text-sm text-gray-400">
              <code>// app/config/auth/users.json</code>
            </p>
          </div>
          <div class="overflow-x-auto">
            <pre class="text-sm text-gray-300 font-mono"><code>{{ contentData.config }}</code></pre>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
