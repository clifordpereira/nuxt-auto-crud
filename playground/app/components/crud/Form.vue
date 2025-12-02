<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import { useChangeCase } from '@vueuse/integrations/useChangeCase'

const props = defineProps<{
  schema: {
    resource: string
    fields: {
      name: string
      type: string
      required?: boolean
      selectOptions?: string[]
    }[]
  }
  initialState?: Record<string, unknown>
}>()

// We can pass relations via props if needed, or derive them.
// For now, we'll rely on the field name convention (ending in _id) or explicit configuration.
// The original code fetched relations, but we want to avoid hard dependencies if possible.
// However, the NameList component handles fetching the related data.

const emit = defineEmits<{
  (e: 'submit', event: Record<string, unknown>): void
  (e: 'close'): void
}>()

// filter out system fields
const filteredFields = props.schema.fields.filter(
  field => field.name !== 'created_at' && field.name !== 'updated_at' && field.name !== 'id',
)

// dynamically build zod schema
const formSchema = useDynamicZodSchema(filteredFields, !!props.initialState)

// reactive state for form data
const state = reactive<Record<string, unknown>>(
  filteredFields.reduce(
    (acc, field) => {
      acc[field.name]
        = props.initialState?.[field.name]
          ?? (field.type === 'boolean' ? false : '')
      return acc
    },
    {} as Record<string, unknown>,
  ),
)

// processedFields with capitalized label for display
const processedFields = computed(() =>
  filteredFields.map((field) => {
    let label = field.name
    if (label.endsWith('_id')) {
      label = label.replace('_id', '')
    }
    label = useChangeCase(label, 'capitalCase').value
    return {
      ...field,
      label,
    }
  }),
)

function handleSubmit(event: FormSubmitEvent<Record<string, unknown>>) {
  emit('submit', event.data)
  emit('close')
}
</script>

<template>
  <div class="max-h-[80vh] overflow-y-auto p-4">
    <UForm
      :schema="formSchema"
      :state="state"
      class="space-y-4"
      @submit="handleSubmit"
    >
      <template
        v-for="field in processedFields"
        :key="field.name"
      >
        <UFormField
          v-if="!props.initialState || field.name !== 'password'"
          :label="field.label"
          :name="field.name"
        >
          <UCheckbox
            v-if="field.type === 'boolean'"
            v-model="state[field.name] as boolean"
          />

          <CrudNameList
            v-else-if="field.name.endsWith('_id')"
            v-model="state[field.name] as string | number | null"
            :field-name="field.name"
          />

          <UInput
            v-else-if="field.type === 'date'"
            v-model="state[field.name] as string"
            type="datetime-local"
          />

          <CommonPassword
            v-else-if="field.name === 'password'"
            v-model="state[field.name] as string"
            type="password"
          />

          <USelect
            v-else-if="field.type === 'enum'"
            v-model="state[field.name] as string"
            :items="field.selectOptions"
            placeholder="Select "
            class="w-full"
          />

          <UInput
            v-else
            v-model="state[field.name] as string"
            :type="field.type"
            :required="field.required"
          />
        </UFormField>
      </template>
      <UButton type="submit">
        Submit
      </UButton>
    </UForm>
  </div>
</template>
