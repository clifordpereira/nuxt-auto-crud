<script setup lang="ts">
// Re-importing the type or defining it locally
type BadgeColor = "error" | "primary" | "warning" | "secondary" | "success" | "info" | "neutral" | undefined

interface Status {
  color: BadgeColor
  text: string
}

defineProps<{
  title: string
  required: boolean
  keys: string[]
  status: Status | null
  link?: string
  linkText?: string
  manualNote?: string
}>()
</script>

<template>
  <UCard 
    :ui="{ body: 'p-5 h-full flex flex-col justify-between' }" 
    class="shadow-sm border hover:border-primary-500/50 transition-colors"
  >
    <div>
      <div class="flex justify-between items-start mb-4 gap-2">
        <div class="flex items-center gap-2 flex-wrap">
          <span class="font-bold text-sm whitespace-nowrap">{{ title }}</span>
          <UBadge 
            :color="required ? 'error' : 'info'" 
            variant="soft" 
            size="xs" 
            class="font-bold uppercase px-1.5 py-0"
          >
            {{ required ? 'Required' : 'Optional' }}
          </UBadge>
        </div>
        
        <UBadge v-if="status" :color="status.color" variant="solid" class="shrink-0">
          {{ status.text }}
        </UBadge>
      </div>

      <div class="flex flex-col items-start gap-2">
        <UKbd v-for="key in keys" :key="key" size="md">
          {{ key }}
        </UKbd>
      </div>
    </div>

    <div class="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
      <UButton 
        v-if="link" 
        :to="link" 
        target="_blank" 
        variant="link" 
        color="primary" 
        size="xs" 
        icon="i-heroicons-arrow-top-right-on-square" 
        class="px-0"
      >
        {{ linkText }}
      </UButton>
      <div v-else class="flex items-center gap-1 text-[10px] text-gray-400 font-bold tracking-wider">
        <UIcon name="i-heroicons-pencil-square" class="w-3.5 h-3.5" />
        {{ manualNote }}
      </div>
    </div>
  </UCard>
</template>