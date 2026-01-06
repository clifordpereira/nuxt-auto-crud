<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const props = defineProps<{
  onSelect?: () => void
  collapsed?: boolean
}>()

const { schemas } = await useResourceSchemas()
const { hasPermission } = usePermissions()

const resourceNames = computed(() =>
  Object.keys(schemas.value || {}).filter((name) => {
    // Exclude system tables
    if (['users', 'roles', 'permissions', 'resources', 'roleResourcePermissions', 'testimonials', 'subscribers'].includes(name)) return false

    return hasPermission(name, 'list') || hasPermission(name, 'list_own')
  }).sort((a, b) => b.localeCompare(a)),
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
