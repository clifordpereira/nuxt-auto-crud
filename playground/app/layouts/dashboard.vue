<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const route = useRoute()
const toast = useToast()

const open = ref(false)
const collapsed = ref(false)

// Get available resources from schemas
const { schemas } = await useResourceSchemas()
const resourceNames = Object.keys(schemas.value || {})

// Dynamically create navigation links based on available resources
const links = [[{
  label: 'Home',
  icon: 'i-lucide-house',
  to: '/dashboard',
  onSelect: () => {
    open.value = false
  },
}, {
  label: 'Resources',
  icon: 'i-lucide-database',
  defaultOpen: true,
  children: resourceNames.map(resource => ({
    label: resource.charAt(0).toUpperCase() + resource.slice(1),
    to: `/resource/${resource}`,
    onSelect: () => {
      open.value = false
    },
  })),
}], [{
  label: 'Help & Support',
  icon: 'i-lucide-info',
  to: 'https://discord.gg/YFTEvMtX',
  target: '_blank',
}, {
  label: 'Report a bug',
  icon: 'i-lucide-bug',
  to: 'https://github.com/clifordpereira/nuxt-auto-crud/issues',
  target: '_blank',
}]] satisfies NavigationMenuItem[][]

const groups = computed(() => [{
  id: 'links',
  label: 'Go to',
  items: links.flat(),
}, {
  id: 'code',
  label: 'Code',
  items: [{
    id: 'source',
    label: 'View page source',
    icon: 'i-simple-icons-github',
    to: `https://github.com/nuxt-ui-templates/dashboard/blob/main/app/pages${route.path === '/' ? '/index' : route.path}.vue`,
    target: '_blank',
  }],
}])

onMounted(async () => {
  const cookie = useCookie('cookie-consent')
  if (cookie.value === 'accepted' || import.meta.dev) {
    return
  }

  toast.add({
    title: 'We use first-party cookies to enhance your experience on our website.',
    duration: 0,
    close: false,
    actions: [{
      label: 'Accept',
      color: 'neutral',
      variant: 'outline',
      onClick: () => {
        cookie.value = 'accepted'
      },
    }, {
      label: 'Opt out',
      color: 'neutral',
      variant: 'ghost',
    }],
  })
})
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
          :items="links[0]"
          orientation="vertical"
          tooltip
          popover
        />

        <UNavigationMenu
          :collapsed="isSidebarCollapsed"
          :items="links[1]"
          orientation="vertical"
          tooltip
          class="mt-auto"
        />
      </template>

      <template #footer="{ collapsed: isCollapsed }">
        <UserMenu :collapsed="isCollapsed" />
      </template>
    </UDashboardSidebar>

    <UDashboardSearch :groups="groups" />

    <slot />

    <NotificationsSlideover />
  </UDashboardGroup>
</template>
