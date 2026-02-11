<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const props = defineProps<{
  onSelect?: () => void
  collapsed?: boolean
}>()

const { user } = useUserSession()

const { endpointPrefix } = useRuntimeConfig().public.autoCrud
const systemTables = ['users', 'roles', 'permissions', 'resources', 'roleResourcePermissions', 'testimonials', 'subscribers']
const { data: schemas } = await useFetch<string[]>(`${endpointPrefix}/_schemas`)

const filteredResources = useArrayDifference(() => schemas.value || [], systemTables)

const resourceNames = computed(() => 
  filteredResources.value
    .filter(name => isAllowedToSeeResourceMenu(user.value, name))
    .sort((a, b) => a.localeCompare(b))
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
