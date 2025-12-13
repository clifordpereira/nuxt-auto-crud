<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const props = defineProps<{
  onSelect?: () => void
  collapsed?: boolean
}>()

const { schemas } = await useResourceSchemas()
const { user } = useUserSession()

const resourceNames = computed(() =>
  Object.keys(schemas.value || {}).filter((name) => {
    // Exclude system tables
    if (['users', 'roles', 'permissions', 'resources', 'roleResourcePermissions'].includes(name)) return false

    // Admins see everything
    if ((user.value as { role?: string })?.role === 'admin') return true

    // Check permissions
    const perms = (user.value as { permissions?: Record<string, string[]> })?.permissions?.[name] || []
    return perms.includes('list') || perms.includes('list_all')
  }),
)

const items = computed(() => {
  if (resourceNames.value.length === 0) return []

  return [{
    label: 'Custom Models',
    icon: 'i-lucide-database',
    defaultOpen: true,
    children: resourceNames.value.map(resource => ({
      label: resource.charAt(0).toUpperCase() + resource.slice(1),
      to: `/admin/${resource}`,
      onSelect: props.onSelect,
    })),
  }] satisfies NavigationMenuItem[]
})
</script>

<template>
  <UNavigationMenu
    :items="items"
    :collapsed="collapsed"
    orientation="vertical"
    tooltip
    popover
  />
</template>
