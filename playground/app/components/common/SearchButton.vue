<script setup lang="ts">
const value = defineModel<string>()
</script>

<template>
  <UInput
    v-model="value"
    placeholder="Search ..."
    :ui="{ trailing: 'pe-1' }"
  >
    <template
      v-if="value?.length"
      #trailing
    >
      <UButton
        color="neutral"
        variant="link"
        size="sm"
        icon="i-lucide-circle-x"
        aria-label="Clear input"
        @click="value = ''"
      />
    </template>
  </UInput>
</template>
