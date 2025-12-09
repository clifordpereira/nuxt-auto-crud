<script setup lang="ts">
// Import menu configurations
import mainMenu from '../config/menus/main.json'
import footerMenu from '../config/menus/footer.json'

const open = ref(false)
const collapsed = ref(false)

// Map menus to add onSelect handler
const { user } = useUserSession()
const mainLinks = computed(() => {
  const links = mainMenu.map(item => ({
    ...item,
    onSelect: () => {
      open.value = false
    },
  }))

  // Filter out permissions menu for non-admins
  // Assuming 'admin' is the role name for administrators
  // You might need to adjust this logic based on your actual role implementation
  if ((user.value as any)?.role !== 'admin') {
    return links.filter(link => link.label !== 'Roles & Permissions')
  }

  return links
})

const footerLinks = computed(() => footerMenu.map(item => ({
  ...item,
  onSelect: () => {
    open.value = false
  },
})))
</script>

<template>
  <UDashboardGroup unit="rem">
    <UDashboardSidebar
      id="default"
      v-model:open="open"
      v-model:collapsed="collapsed"
      collapsible
      resizable
      class="bg-elevated/25"
      :ui="{ footer: 'lg:border-t lg:border-default' }"
    >
      <template #default="{ collapsed: isSidebarCollapsed }">
        <UButton
          color="neutral"
          variant="ghost"
          :icon="isSidebarCollapsed ? 'i-lucide-chevrons-right' : 'i-lucide-chevrons-left'"
          :aria-label="isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'"
          block
          @click="collapsed = !collapsed"
        />
        <UDashboardSearchButton
          :collapsed="isSidebarCollapsed"
          class="bg-transparent ring-default"
        />

        <UNavigationMenu
          :collapsed="isSidebarCollapsed"
          :items="mainLinks"
          orientation="vertical"
          tooltip
          popover
        />

        <ResourcesMenu
          :collapsed="isSidebarCollapsed"
          :on-select="() => { open = false }"
        />

        <UNavigationMenu
          :collapsed="isSidebarCollapsed"
          :items="footerLinks"
          orientation="vertical"
          tooltip
          class="mt-auto"
        />
      </template>

      <template #footer="{ collapsed: isCollapsed }">
        <UserMenu :collapsed="isCollapsed" />
      </template>
    </UDashboardSidebar>

    <UDashboardPanel>
      <slot />
    </UDashboardPanel>
  </UDashboardGroup>
</template>
