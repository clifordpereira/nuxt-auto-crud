<script setup lang="ts">
import { dbFieldToLabel } from '~/utils/formatter'

const props = defineProps<{
  row: Record<string, unknown>
  schema?: {
    resource: string
    fields: { name: string, type: string, required?: boolean }[]
  }
}>()

const isOpen = ref(false)

function isImage(key: string, value: unknown) {
  if (typeof value !== 'string') return false
  const k = key.toLowerCase()
  return (k.includes('image') || k.includes('avatar') || k.includes('photo')) && (value.startsWith('http') || value.startsWith('/'))
}
</script>

<template>
  <UModal v-model:open="isOpen">
    <UButton
      icon="i-heroicons-eye"
      color="neutral"
      variant="ghost"
      size="xs"
      label="View"
    />

    <template #content>
      <UCard :ui="{ root: 'divide-y divide-gray-100 dark:divide-gray-800' }">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
              Record Details
            </h3>
            <UButton
              color="neutral"
              variant="ghost"
              icon="i-heroicons-x-mark-20-solid"
              class="-my-1"
              @click="isOpen = false"
            />
          </div>
        </template>

        <dl class="divide-y divide-gray-100 dark:divide-gray-800 max-h-[60vh] overflow-y-auto">
          <div
            v-for="(value, key) in props.row"
            :key="key"
            class="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4"
          >
            <dt class="text-sm font-medium leading-6 text-gray-900 dark:text-white">
              {{ dbFieldToLabel(String(key)) }}
            </dt>
            <dd class="mt-1 text-sm leading-6 text-gray-700 dark:text-gray-400 sm:col-span-2 sm:mt-0 break-words">
              <img
                v-if="isImage(String(key), value)"
                :src="String(value)"
                class="h-10 w-10 rounded object-cover"
                alt="Preview"
              >
              <span v-else>{{ value }}</span>
            </dd>
          </div>
        </dl>
      </UCard>
    </template>
  </UModal>
</template>
