<script setup lang="ts">
defineOptions({
  name: 'DashboardPage',
})

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
})

const { endpointPrefix } = useRuntimeConfig().public.autoCrud

const { data: users } = useFetch<unknown[]>(`${endpointPrefix}/users`, {
  headers: crudHeaders(),
  lazy: true,
  immediate: allow('listRecords', 'users')
})

const userCount = computed(() => users.value?.length || 0)
</script>

<template>
  <div class="p-6">
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <UCard>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">
              Total Users
            </p>
            <p class="text-3xl font-bold text-gray-900 dark:text-white mt-1">
              {{ userCount }}
            </p>
          </div>
          <div class="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-full">
            <UIcon
              name="i-heroicons-users"
              class="w-6 h-6 text-primary-500 dark:text-primary-400"
            />
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>
