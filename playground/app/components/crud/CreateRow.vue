<script setup lang="ts">
const props = defineProps<{
  resource: string
  schema: {
    resource: string
    fields: { name: string, type: string, required?: boolean }[]
  }
}>()

async function onSubmit(data: Record<string, unknown>) {
  await useCrudFetch('POST', props.resource, null, data)
}

const isModalOpen = ref(false)
</script>

<template>
  <div>
    <UModal v-model:open="isModalOpen">
      <!-- Trigger button -->
      <UButton
        label="Add New"
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
                @close="isModalOpen = false"
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
  </div>
</template>

<style scoped>
/* Optional: max height and scroll for long forms */
div[role="dialog"] {
  max-height: 80vh;
  overflow-y: auto;
}
</style>
