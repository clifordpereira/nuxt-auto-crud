<script setup lang="ts">
const props = defineProps<{
  resource: string
  row: Record<string, unknown> // data of the row being edited
  schema: {
    resource: string
    fields: { name: string, type: string, required?: boolean }[]
  }
}>()

const state = computed(() => {
  if (!props.schema) return {}
  // exclude system fields
  const filteredFields = props.schema.fields.filter(
    field => !['id', 'created_at', 'updated_at', 'deleted_at', 'createdAt', 'updatedAt', 'deletedAt'].includes(field.name),
  )

  return useFormState(filteredFields, props.row)
})

async function onSubmit(data: Record<string, unknown>) {
  await useCrudFetch('PATCH', props.resource, props.row.id as number, data)
}

const isModalOpen = ref(false)
</script>

<template>
  <UModal v-model:open="isModalOpen">
    <!-- Trigger button -->
    <UButton
      label="Edit"
      color="primary"
      variant="outline"
      class="font-medium"
    />

    <!-- Modal content -->
    <template #content>
      <div class="max-w-md p-6 rounded-lg shadow-lg space-y-4">
        <h2 class="text-lg font-semibold mb-2">
          Edit {{ resource }}
        </h2>
        <hr>

        <!-- Form -->
        <CrudForm
          v-if="schema"
          :schema="schema"
          :initial-state="state"
          @submit="onSubmit"
          @close="isModalOpen = false"
        />

        <!-- Fallback -->
        <p
          v-else
          class="text-sm text-red-500"
        >
          No schema provided for {{ resource }}
        </p>
      </div>
    </template>
  </UModal>
</template>
