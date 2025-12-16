<script setup lang="ts">
import { useChangeCase } from '@vueuse/integrations/useChangeCase'

const props = defineProps<{
  resource: string
  schema: {
    resource: string
    fields: { name: string, type: string, required?: boolean }[]
  }
}>()

const open = ref(false)

async function onSubmit(data: Record<string, unknown>) {
  await useCrudFetch('POST', props.resource, null, data)
  open.value = false
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
