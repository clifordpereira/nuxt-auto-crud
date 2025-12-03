<script setup lang="ts">
const props = defineProps<{
  row: Record<string, any>
}>()
</script>

<template>
  <div class="flex items-center gap-2">
    <UModal>
      <UButton
        label="View"
        color="primary"
        variant="outline"
      />

      <template #content>
        <div class="p-4 max-w-md bg-white rounded-lg shadow-md">
          <h3 class="text-lg font-semibold mb-3 text-gray-950">
            Details
          </h3>
          <ul class="space-y-2 text-sm">
            <li
              v-for="(value, key) in props.row"
              :key="key"
              class="flex justify-between"
            >
              <span class="font-medium text-gray-700">{{ key }}</span>
              <span class="text-gray-900">{{ value }}</span>
            </li>
          </ul>
        </div>
      </template>
    </UModal>
  </div>
</template>
