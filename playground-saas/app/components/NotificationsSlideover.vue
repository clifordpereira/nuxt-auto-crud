<script setup lang="ts">
const { isNotificationsSlideoverOpen } = useDashboard()
</script>

<template>
  <USlideover
    v-model:open="isNotificationsSlideoverOpen"
    title="Notifications"
  >
    <template #body>
      <div class="p-4 text-center text-gray-500">
        No notifications.
      </div>
    </template>
  </USlideover>
</template>
