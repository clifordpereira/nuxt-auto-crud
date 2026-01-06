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
        body: undefined, // Explicitly undefined for DELETE generally, though not strictly needed
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
  !['permissions', 'resources', 'roleResourcePermissions'].includes(r.name),
) || [])

const crudGroups = [
  { label: 'List', any: 'list', anyLabel: 'Any', own: 'list_own', ownLabel: 'Own', all: 'list_all' },
  { label: 'Read', any: 'read', anyLabel: 'Others', own: 'read_own', ownLabel: 'Own' },
  { label: 'Create', any: 'create', anyLabel: 'Own' },
  { label: 'Update', any: 'update', anyLabel: 'Others', own: 'update_own', ownLabel: 'Own', status: 'update_status' },
  { label: 'Delete', any: 'delete', anyLabel: 'Others', own: 'delete_own', ownLabel: 'Own' },
]

const getPermissionId = (code: string) => {
  return permissions.value?.find(p => p.code === code)?.id
}
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

    <div class="flex-1 overflow-auto">
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
        <div class="sticky top-0 z-20 bg-white dark:bg-gray-900 -mx-4 px-4 pt-2 pb-4 border-b border-gray-200 dark:border-gray-700 mb-6 -mt-4">
          <UTabs
            v-model="selectedIndex"
            :items="items"
          />
        </div>

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
                    v-for="group in crudGroups"
                    :key="group.label"
                    scope="col"
                    class="px-6 py-3 font-medium text-center"
                  >
                    {{ group.label }}
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
                    v-for="group in crudGroups"
                    :key="group.label"
                    class="px-6 py-4 text-center"
                  >
                    <div class="flex flex-col items-center gap-1.5 min-w-[120px]">
                      <div class="flex items-center gap-4">
                        <!-- Any/Others (Universal) -->
                        <div
                          v-if="group.any"
                          class="flex flex-col items-center"
                        >
                          <UTooltip :text="`${group.anyLabel || 'Any'} ${group.label}`">
                            <UCheckbox
                              :model-value="getPermissionId(group.any) ? hasPermission(res.id, getPermissionId(group.any)!) : false"
                              :disabled="!getPermissionId(group.any)"
                              @update:model-value="(val) => getPermissionId(group.any) && togglePermission(res.id, getPermissionId(group.any)!, Boolean(val))"
                            />
                          </UTooltip>
                          <span class="text-[9px] text-gray-400 mt-0.5 uppercase">{{ group.anyLabel || 'Any' }}</span>
                        </div>

                        <!-- Own (Personal) -->
                        <div
                          v-if="group.own"
                          class="flex flex-col items-center"
                        >
                          <UTooltip :text="`${group.ownLabel || 'Own'} ${group.label} Only`">
                            <UCheckbox
                              :model-value="getPermissionId(group.own) ? hasPermission(res.id, getPermissionId(group.own)!) : false"
                              :disabled="!getPermissionId(group.own)"
                              color="primary"
                              @update:model-value="(val) => getPermissionId(group.own) && togglePermission(res.id, getPermissionId(group.own)!, Boolean(val))"
                            />
                          </UTooltip>
                          <span class="text-[9px] text-orange-500/70 mt-0.5 uppercase font-medium">{{ group.ownLabel || 'Own' }}</span>
                        </div>
                      </div>

                      <!-- List All (Special) -->
                      <div
                        v-if="group.all"
                        class="flex items-center gap-1.5 mt-1 pt-1 border-t border-gray-100 dark:border-gray-700 w-full justify-center"
                      >
                        <UTooltip text="List All (Inc. Inactive)">
                          <UCheckbox
                            :model-value="getPermissionId(group.all) ? hasPermission(res.id, getPermissionId(group.all)!) : false"
                            :disabled="!getPermissionId(group.all)"
                            color="secondary"
                            size="xs"
                            @update:model-value="(val) => getPermissionId(group.all) && togglePermission(res.id, getPermissionId(group.all)!, Boolean(val))"
                          />
                        </UTooltip>
                        <span class="text-[9px] text-indigo-500/70 uppercase">All Status</span>
                      </div>

                      <!-- Update Status (Special) -->
                      <div
                        v-if="group.status"
                        class="flex items-center gap-1.5 mt-1 pt-1 border-t border-gray-100 dark:border-gray-700 w-full justify-center"
                      >
                        <UTooltip text="Update Status Permission">
                          <UCheckbox
                            :model-value="getPermissionId(group.status) ? hasPermission(res.id, getPermissionId(group.status)!) : false"
                            :disabled="!getPermissionId(group.status)"
                            color="info"
                            size="xs"
                            @update:model-value="(val) => getPermissionId(group.status) && togglePermission(res.id, getPermissionId(group.status)!, Boolean(val))"
                          />
                        </UTooltip>
                        <span class="text-[9px] text-blue-500/70 uppercase">Change Status</span>
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
              <tfoot class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th
                    scope="col"
                    class="px-6 py-3 font-medium"
                  >
                    Resource
                  </th>
                  <th
                    v-for="group in crudGroups"
                    :key="group.label"
                    scope="col"
                    class="px-6 py-3 font-medium text-center"
                  >
                    {{ group.label }}
                  </th>
                </tr>
              </tfoot>
            </table>
          </div>
        </UCard>
      </template>
    </div>
  </div>
</template>
