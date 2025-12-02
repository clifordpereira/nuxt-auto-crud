<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";

const props = defineProps<{
  schema: {
    resource: string;
    fields: { name: string; type: string; required?: boolean }[];
  };
  initialState?: Record<string, any>;
}>();

const emit = defineEmits<{
  (e: "submit", event: FormSubmitEvent<any>): void;
  (e: "close"): void;
}>();

// filter out system fields
const filteredFields = props.schema.fields.filter(
  (field) => field.name !== "created_at" && field.name !== "id"
);

// dynamically build zod schema
const formSchema = useDynamicZodSchema(filteredFields, !!props.initialState);

// reactive state for form data
const state = reactive<Record<string, any>>({});
filteredFields.forEach((field) => {
  if (field.type === "boolean") {
    state[field.name] = props.initialState?.[field.name] ?? false;
  } else {
    state[field.name] = props.initialState?.[field.name] ?? "";
  }
});

function handleSubmit(event: FormSubmitEvent<any>) {
  emit("submit", event.data);
  emit("close");
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
      <template v-for="field in filteredFields" :key="field.name">
        <UFormField
          v-if="!initialState || field.name !== 'password'"
          :label="field.name"
          :name="field.name"
        >
          <UCheckbox
            v-if="field.type === 'boolean'"
            v-model="state[field.name]"
          />

          <UInput
            v-else-if="field.type === 'date'"
            v-model="state[field.name]"
            type="datetime-local"
          />

          <CommonPassword
            v-else-if="field.name === 'password'"
            v-model="state[field.name]"
            type="password"
          />

          <UInput
            v-else
            v-model="state[field.name]"
            :type="field.type"
            :required="field.required"
          />
        </UFormField>
      </template>
      <UButton type="submit"> Submit </UButton>
    </UForm>
  </div>
</template>
