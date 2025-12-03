<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

const { isNotificationsSlideoverOpen } = useDashboard()

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
})

// Get available resources from schemas
const { schemas } = await useResourceSchemas()
const resourceNames = Object.keys(schemas.value || {})

// Dynamically create dropdown items based on available resources
const iconMap: Record<string, string> = {
  users: 'i-lucide-user-plus',
}

const items = [[
  ...resourceNames.map(resource => ({
    label: `New ${resource.slice(0, -1)}`,
    icon: iconMap[resource] || 'i-lucide-plus',
    to: `/resource/${resource}`,
  })),
]] satisfies DropdownMenuItem[][]

// Dynamically fetch data for all resources
const { data: resourceData } = await useAsyncData('dashboard-resources', async () => {
  return await Promise.all(
    resourceNames.map(async (resource) => {
      const data = await $fetch<Record<string, unknown>[]>(`/api/${resource}`, {
        headers: crudHeaders(),
      })
      return { resource, data }
    }),
  )
})

// Create a map of resource counts
const resourceCounts = computed(() => {
  const counts: Record<string, number> = {}
  if (resourceData.value) {
    resourceData.value.forEach(({ resource, data }) => {
      counts[resource] = data?.length || 0
    })
  }
  return counts
})
</script>

<template>
  <UDashboardPanel id="home">
    <template #header>
      <UDashboardNavbar
        title="Home"
        :ui="{ right: 'gap-3' }"
      >
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UTooltip
            text="Notifications"
            :shortcuts="['N']"
          >
            <UButton
              color="neutral"
              variant="ghost"
              square
              @click="isNotificationsSlideoverOpen = true"
            >
              <UChip
                color="error"
                inset
              >
                <UIcon
                  name="i-lucide-bell"
                  class="size-5 shrink-0"
                />
              </UChip>
            </UButton>
          </UTooltip>

          <UDropdownMenu :items="items">
            <UButton
              icon="i-lucide-plus"
              size="md"
              class="rounded-full"
            />
          </UDropdownMenu>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <HomeStats :resource-counts="resourceCounts" />
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold">
              Getting Started
            </h3>
          </template>
          <p class="text-gray-600 dark:text-gray-400 mb-4">
            Welcome to the Nuxt Auto CRUD playground. This application demonstrates how to automatically generate CRUD APIs and interfaces from your database schema.
          </p>
          <ul class="list-disc list-inside space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li><strong>Manage Resources:</strong> Use the sidebar to navigate to your resources.</li>
            <li><strong>Create Data:</strong> Click the "New" button in the top right or on any resource page to add data.</li>
            <li><strong>Permissions:</strong> Log in as 'admin' for full access, or 'user' for restricted access.</li>
          </ul>
        </UCard>
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold">
              Features
            </h3>
          </template>
          <ul class="list-disc list-inside space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li><strong>Auto-generated APIs:</strong> CRUD endpoints created automatically from Drizzle schema.</li>
            <li><strong>Authentication:</strong> Built-in session management and role-based access control.</li>
            <li><strong>Dynamic UI:</strong> Tables and forms generated on-the-fly based on data types.</li>
            <li><strong>Relations:</strong> Automatic handling of relationships (e.g., User -> Posts).</li>
          </ul>
        </UCard>
      </div>
    </template>
  </UDashboardPanel>
</template>
