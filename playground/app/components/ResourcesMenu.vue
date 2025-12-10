<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const props = defineProps<{
  onSelect?: () => void
  collapsed?: boolean
}>()

const { schemas } = await useResourceSchemas()
const resourceNames = computed(() =>
  Object.keys(schemas.value || {}).filter(name => !['users', 'roles', 'permissions', 'resources', 'roleResourcePermissions'].includes(name)),
)

const items = computed(() => [{
  label: 'Custom Models',
  icon: 'i-lucide-database',
  defaultOpen: true,
  children: resourceNames.value.map(resource => ({
    label: resource.charAt(0).toUpperCase() + resource.slice(1),
    to: `/admin/${resource}`,
    onSelect: props.onSelect,
  })),
}] satisfies NavigationMenuItem[])
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
