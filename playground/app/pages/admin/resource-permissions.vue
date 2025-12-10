<script setup lang="ts">
interface Role {
  id: number
  name: string
  description?: string
  status?: string
}

interface Resource {
  id: number
  name: string
}

interface Permission {
  id: number
  name: string
  code: string
}

interface RoleResourcePermission {
  id: number
  roleId: number
  resourceId: number
  permissionId: number
}

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
})

const config = useRuntimeConfig().public
const crudBaseUrl = config.crudBaseUrl || '/api'
const toast = useToast()

// Fetch all necessary data
const { data: roles } = await useFetch<Role[]>(`${crudBaseUrl}/roles`, {
  headers: crudHeaders(),
})

const { data: resources } = await useFetch<Resource[]>(`${crudBaseUrl}/resources`, {
  headers: crudHeaders(),
})

const { data: permissions } = await useFetch<Permission[]>(`${crudBaseUrl}/permissions`, {
  headers: crudHeaders(),
})

const { data: roleResourcePermissions, refresh } = await useFetch<RoleResourcePermission[]>(`${crudBaseUrl}/roleResourcePermissions`, {
  headers: crudHeaders(),
})

// Tabs configuration - Exclude 'admin'
const items = computed(() => roles.value?.filter(r => r.name !== 'admin').map(role => ({
  label: role.name,
  roleId: role.id,
})) || [])

const selectedIndex = ref(0)
const selectedRole = computed(() => items.value[selectedIndex.value])

// Local state for permissions
// Map<string, boolean> where key is `${resourceId}-${permissionId}`
const localPermissions = ref<Map<string, boolean>>(new Map())
const isDirty = ref(false)
const isSaving = ref(false)

// Initialize local state when data loads or role changes
const initLocalState = () => {
  localPermissions.value.clear()
  if (!selectedRole.value || !roleResourcePermissions.value) return

  const currentRoleId = selectedRole.value.roleId

  roleResourcePermissions.value.forEach((p) => {
    if (p.roleId === currentRoleId) {
      localPermissions.value.set(`${p.resourceId}-${p.permissionId}`, true)
    }
  })
  isDirty.value = false
}

// Watch for changes in role or data to re-init
watch([selectedRole, roleResourcePermissions], () => {
  initLocalState()
}, { immediate: true })

const hasPermission = (resourceId: number, permissionId: number) => {
  return localPermissions.value.get(`${resourceId}-${permissionId}`) || false
}

const togglePermission = (resourceId: number, permissionId: number, value: boolean) => {
  const key = `${resourceId}-${permissionId}`
  if (value) {
    localPermissions.value.set(key, true)
  }
  else {
    localPermissions.value.delete(key)
  }
  isDirty.value = true
}

const saveChanges = async () => {
  if (!selectedRole.value) return
  isSaving.value = true

  const currentRoleId = selectedRole.value.roleId

  try {
    // 1. Get current permissions for this role from server (to know what to delete)
    const currentServerPerms = roleResourcePermissions.value?.filter(p => p.roleId === currentRoleId) || []

    // 2. Calculate diffs
    const toCreate: { roleId: number, resourceId: number, permissionId: number }[] = []
    const toDelete: number[] = [] // IDs of role_resource_permissions to delete

    // Find what to create
    for (const [key, exists] of localPermissions.value.entries()) {
      if (exists) {
        const [resId, permId] = key.split('-').map(Number)
        if (resId !== undefined && permId !== undefined) {
          const serverEntry = currentServerPerms.find(p => p.resourceId === resId && p.permissionId === permId)
          if (!serverEntry) {
            toCreate.push({ roleId: currentRoleId, resourceId: resId, permissionId: permId })
          }
        }
      }
    }

    // Find what to delete
    currentServerPerms.forEach((p) => {
      const key = `${p.resourceId}-${p.permissionId}`
      if (!localPermissions.value.has(key)) {
        toDelete.push(p.id)
      }
    })

    // 3. Execute updates
    const promises = []

    // Batch create
    for (const item of toCreate) {
      promises.push($fetch(`${crudBaseUrl}/roleResourcePermissions`, {
        method: 'POST',
        headers: crudHeaders(),
        body: item,
      }))
    }

    // Batch delete
    for (const id of toDelete) {
      promises.push($fetch(`${crudBaseUrl}/roleResourcePermissions/${id}`, {
        method: 'DELETE',
        headers: crudHeaders(),
      }))
    }

    await Promise.all(promises)

    await refresh()
    isDirty.value = false
    toast.add({ title: 'Success', description: 'Permissions updated successfully.' })
  }
  catch (error) {
    console.error('Failed to save permissions:', error)
    toast.add({ title: 'Error', description: 'Failed to save permissions.', color: 'error' })
  }
  finally {
    isSaving.value = false
  }
}

// Filter out system resources
const displayResources = computed(() => resources.value?.filter(r =>
  !['roles', 'permissions', 'resources', 'roleResourcePermissions'].includes(r.name),
) || [])

const displayPermissions = computed(() => {
  if (!permissions.value) return []
  const order = ['list', 'create', 'read', 'update', 'delete']
  return [...permissions.value].sort((a, b) => {
    return order.indexOf(a.code) - order.indexOf(b.code)
  })
})

// Ensure a role is selected
watch(items, (newItems) => {
  if (newItems.length > 0 && (selectedIndex.value < 0 || selectedIndex.value >= newItems.length)) {
    selectedIndex.value = 0
  }
}, { immediate: true })
</script>

<template>
  <div class="flex flex-col h-full">
    <div class="border-b border-gray-200 dark:border-gray-700 px-4 py-4 flex items-center justify-between bg-white dark:bg-gray-900">
      <h1 class="text-xl font-semibold text-gray-900 dark:text-white">
        Resource Permissions
      </h1>
      <div class="flex gap-2">
        <UButton
          v-if="isDirty"
          label="Save Changes"
          color="primary"
          :loading="isSaving"
          @click="saveChanges"
        />
      </div>
    </div>

    <div class="p-4 flex-1 overflow-auto">
      <div
        v-if="!roles || !resources || !permissions"
        class="flex justify-center items-center h-64"
      >
        <UIcon
          name="i-lucide-loader-2"
          class="animate-spin w-8 h-8 text-primary-500"
        />
      </div>

      <template v-else>
        <UTabs
          v-model="selectedIndex"
          :items="items"
          class="mb-6"
        />

        <UCard
          v-if="selectedRole"
          :ui="{ body: 'p-0 sm:p-0' }"
        >
          <div class="overflow-x-auto">
            <table class="w-full text-sm text-left">
              <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th
                    scope="col"
                    class="px-6 py-3 font-medium"
                  >
                    Resource
                  </th>
                  <th
                    v-for="perm in displayPermissions"
                    :key="perm.id"
                    scope="col"
                    class="px-6 py-3 font-medium text-center"
                  >
                    {{ perm.name }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="res in displayResources"
                  :key="res.id"
                  class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  <td class="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                    {{ res.name }}
                  </td>
                  <td
                    v-for="perm in displayPermissions"
                    :key="perm.id"
                    class="px-6 py-4 text-center"
                  >
                    <UCheckbox
                      :model-value="hasPermission(res.id, perm.id)"
                      class="justify-center"
                      @update:model-value="(val) => togglePermission(res.id, perm.id, Boolean(val))"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </UCard>
      </template>
    </div>
  </div>
</template>
