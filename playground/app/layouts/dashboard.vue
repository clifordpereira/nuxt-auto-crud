<script setup lang="ts">
// Import menu configurations
import mainMenu from '../config/menus/main.json'
import footerMenu from '../config/menus/footer.json'

const open = ref(false)
const collapsed = ref(false)

// Map menus to add onSelect handler
const { user } = useUserSession()
const { hasPermission } = usePermissions()

const mainLinks = computed(() => {
  const links = mainMenu.map((item) => {
    const link = {
      ...item,
      onSelect: () => {
        open.value = false
      }
    }

    if (link.children) {
      link.children = link.children.filter((child) => {
        if (child.label === 'Testimonials') {
          return hasPermission('testimonials', 'list')
        }
        if (child.label === 'Subscribers') {
          return hasPermission('subscribers', 'list')
        }
        return true
      })
    }

    return link
  })

  return links.filter((link) => {
    if (link.label === 'Users') {
      return hasPermission('users', 'list')
    }
    if (link.label === 'Roles & Permissions') {
      return (user.value as { role?: string })?.role === 'admin'
    }
    if (link.label === 'Template Models') {
      return link.children && link.children.length > 0
    }
    return true
  })
})

const footerLinks = computed(() => footerMenu.map(item => ({
  ...item,
  onSelect: () => {
    open.value = false
  }
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
