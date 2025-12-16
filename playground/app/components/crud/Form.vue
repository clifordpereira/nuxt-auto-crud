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
      references?: string
    }[]
  }
  initialState?: Record<string, unknown>
}>()

const emit = defineEmits<{
  (e: 'submit', event: Record<string, unknown>): void
  (e: 'close'): void
}>()

// filter out system fields
const filteredFields = props.schema.fields.filter(
  field => !['id', 'created_at', 'updated_at', 'deleted_at', 'createdAt', 'updatedAt', 'deletedAt', 'created_by', 'updated_by', 'createdBy', 'updatedBy'].includes(field.name),
)

// dynamically build zod schema
const formSchema = useDynamicZodSchema(filteredFields, !!props.initialState)

// reactive state for form data
const state = reactive<Record<string, unknown>>(
  filteredFields.reduce(
    (acc, field) => {
      let value = props.initialState?.[field.name]

      // Handle relation fields that might be objects
      // Case 1: value is an object with id (e.g. customer_id: { id: 1, ... })
      if ((field.name.endsWith('_id') || field.name.endsWith('Id')) && value && typeof value === 'object' && 'id' in value) {
        value = (value as { id: unknown }).id
      }
      else if ((field.name.endsWith('_id') || field.name.endsWith('Id')) && value === undefined) {
        const relationName = field.name.endsWith('_id') ? field.name.replace('_id', '') : field.name.replace('Id', '')
        const relationValue = props.initialState?.[relationName]
        if (relationValue && typeof relationValue === 'object' && 'id' in relationValue) {
          value = (relationValue as { id: unknown }).id
        }
      }

      acc[field.name] = value ?? (field.type === 'boolean' ? false : undefined)
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
    else if (label.endsWith('Id')) {
      label = label.replace('Id', '')
    }
    label = useChangeCase(label, 'capitalCase').value
    return {
      ...field,
      label,
    }
  }),
)

function handleSubmit(event: FormSubmitEvent<Record<string, unknown>>) {
  const data = { ...event.data }
  if (props.initialState && 'password' in data) {
    delete data.password
  }
  emit('submit', data)
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
          :label="field.label"
          :name="field.name"
        >
          <UCheckbox
            v-if="field.type === 'boolean'"
            :id="field.name"
            v-model="state[field.name] as boolean"
          />

          <CrudNameList
            v-else-if="field.name.endsWith('_id') || field.name.endsWith('Id')"
            v-model="state[field.name] as string | number | null"
            :field-name="field.name"
            :table-name="field.references"
          />

          <template v-else-if="field.name === 'password'">
            <CommonPassword
              v-if="!props.initialState"
              v-model="state[field.name] as string"
              type="password"
            />
            <span
              v-else
              class="text-gray-500 italic text-sm"
            >
              Password can only be set on creation.
            </span>
          </template>
          <UInput
            v-else-if="field.type === 'date'"
            v-model="state[field.name] as string"
            type="datetime-local"
          />

          <USelect
            v-else-if="field.type === 'enum'"
            v-model="state[field.name] as string"
            :items="field.selectOptions"
            placeholder="Select "
            class="w-full"
          />

          <UTextarea
            v-else-if="field.type === 'textarea'"
            v-model="state[field.name] as string"
            :required="field.required"
            autoresize
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
