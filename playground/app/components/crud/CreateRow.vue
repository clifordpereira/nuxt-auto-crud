<script setup lang="ts">
import { useChangeCase } from '@vueuse/integrations/useChangeCase'
import type { SchemaDefinition } from '#nac/shared/utils/types'

const props = defineProps<{
  resource: string
  schema: SchemaDefinition
}>()

const open = ref(false)
const loading = ref(false)

async function onSubmit(data: Record<string, unknown>) {
  loading.value = true
  try {
    await useCrudFetch('POST', props.resource, null, data)
    open.value = false
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <UModal v-model:open="open">
    <UButton
      :label="`Add New ${useChangeCase(props.resource, 'capitalCase').value}`"
      color="neutral"
      variant="subtle"
    />

    <template #content>
      <div class="p-6 w-[400px] rounded-lg shadow-lg">
        <!-- Modal header -->
        <h2 class="text-lg font-semibold mb-4">
          Add New {{ props.resource }}
        </h2>
        <hr>

        <div class="mt-4">
          <!-- Dynamic form -->
          <div v-if="schema">
            <CrudForm
              :schema="schema"
              :loading="loading"
              @submit="onSubmit"
            />
          </div>

          <!-- Fallback -->
          <p
            v-else
            class="text-gray-500"
          >
            No schema provided for {{ props.resource }}
          </p>
        </div>
      </div>
    </template>
  </UModal>
</template>

<style scoped>
/* Optional: max height and scroll for long forms */
div[role="dialog"] {
  max-height: 80vh;
  overflow-y: auto;
}
</style>
