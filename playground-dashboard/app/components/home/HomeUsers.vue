<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import type { TableColumn } from '@nuxt/ui'

const UBadge = resolveComponent('UBadge')
const UAvatar = resolveComponent('UAvatar')

const { data: users } = await useFetch('/api/users')

const columns: TableColumn<any>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
    cell: ({ row }) => `#${row.getValue('id')}`
  },
  {
    accessorKey: 'name',
    header: 'User',
    cell: ({ row }) => {
      return h('div', { class: 'flex items-center gap-3' }, [
        h(UAvatar, {
          src: row.original.avatar,
          alt: row.getValue('name'),
          size: 'sm'
        }),
        h('span', { class: 'font-medium text-gray-900 dark:text-white' }, row.getValue('name'))
      ])
    }
  },
  {
    accessorKey: 'email',
    header: 'Email'
  },
  {
    accessorKey: 'role',
    header: 'Role',
    cell: ({ row }) => {
      const role = row.getValue('role') as string
      return h(UBadge, {
        color: role === 'admin' ? 'primary' : 'neutral',
        variant: 'subtle',
        class: 'capitalize'
      }, () => role)
    }
  },
  {
    accessorKey: 'createdAt',
    header: 'Joined',
    cell: ({ row }) => {
      return new Date(row.getValue('createdAt')).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }
  }
]
</script>

<template>
  <UCard class="mt-8" :ui="{ header: 'px-4 sm:px-6', body: 'p-0 sm:p-0' }">
    <template #header>
      <div class="flex items-center justify-between">
        <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
          Recent Users
        </h3>
        <UButton to="/users" color="neutral" variant="ghost" icon="i-lucide-arrow-right" trailing>
          View all
        </UButton>
      </div>
    </template>

    <UTable
      :data="users || []"
      :columns="columns"
      class="w-full"
      :ui="{
        base: 'min-w-full table-fixed',
        thead: 'bg-gray-50 dark:bg-gray-800/50',
        th: 'text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider px-4 py-3 sm:px-6',
        td: 'whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 px-4 py-4 sm:px-6'
      }"
    />
  </UCard>
</template>
