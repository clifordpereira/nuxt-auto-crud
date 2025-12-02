<script setup lang="ts">
definePageMeta({
  middleware: ["auth"],
  layout: 'dashboard'
});

const route = useRoute();
const resource = computed(() => {
  const slug = route.params.slug;
  return Array.isArray(slug) ? slug[0] : slug;
});

const schemas: Record<string, any> = {
  users: {
    resource: "users",
    fields: [
      { name: "id", type: "number" },
      { name: "email", type: "string", required: true },
      { name: "password", type: "string", required: true },
      { name: "name", type: "string" },
      { name: "avatar", type: "string" },
      { name: "role", type: "string" },
      { name: "created_at", type: "date" },
      { name: "updated_at", type: "date" },
    ],
  },
  customers: {
    resource: "customers",
    fields: [
      { name: "id", type: "number" },
      { name: "name", type: "string", required: true },
      { name: "email", type: "string", required: true },
      { name: "avatar", type: "string" },
      { name: "status", type: "string", required: true },
      { name: "location", type: "string" },
    ],
  },
  products: {
    resource: "products",
    fields: [
      { name: "id", type: "number" },
      { name: "name", type: "string", required: true },
      { name: "price", type: "number", required: true },
      { name: "status", type: "string", required: true },
      { name: "inventory", type: "number", required: true },
      { name: "image", type: "string" },
    ],
  },
};

const schema = computed(() => (resource.value ? schemas[resource.value] : undefined));
</script>

<template>
  <div>
    <CrudTable v-if="schema && resource" :resource="resource" :schema="schema" />
    <div v-else class="p-4 text-red-500">
      Schema not found for resource: {{ resource }}
    </div>
  </div>
</template>
