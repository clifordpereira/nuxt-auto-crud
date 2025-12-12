<script setup lang="ts">
definePageMeta({
  layout: 'default'
})

const coreConcepts = [
  { term: 'Users', description: 'The actual people logging in.' },
  { term: 'Roles', description: 'Labels like "Admin", "Manager", or "Support" that group users together.' },
  { term: 'Resources', description: 'The parts of your application you want to protect (e.g., "users", "tickets", "products").' },
  { term: 'Permissions', description: 'The specific actions allowed (e.g., "create", "read", "update", "delete", "list").' }
]

const managementSteps = [
  {
    title: 'Create a New Role',
    description: 'If you need a new type of user (e.g., "Editor"), you simply add a row to the roles table.',
    action: 'Insert a new record into the `roles` table.',
    example: 'Name = "Editor"'
  },
  {
    title: 'Define a Resource',
    description: 'If you create a new feature (e.g., a "Blog"), you need to register it as a resource.',
    action: 'Insert a new record into the `resources` table.',
    example: 'Name = "blog_posts"'
  },
  {
    title: 'Grant Permissions',
    description: 'To say "Editors can update blog posts", you link the three concepts together in the role_resource_permissions table.',
    action: 'Insert a record linking Role ID, Resource ID, and Permission ID.',
    example: 'Link Editor ID + blog_posts ID + update ID'
  },
  {
    title: 'Assign a Role to a User',
    description: 'Finally, to give a user these powers, you just assign them the role.',
    action: 'Select the Role for a specific user in the `users` table.',
    example: 'Select "Editor" for user "john@example.com"'
  }
]
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="mb-8">
        <UButton
          to="/"
          icon="i-heroicons-arrow-left"
          variant="ghost"
          class="mb-4"
        >
          Back to Home
        </UButton>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
          Managing Permissions
        </h1>
        <p class="mt-2 text-lg text-gray-600 dark:text-gray-400">
          A guide to the database-driven permission system in Nuxt Auto CRUD.
        </p>
      </div>

      <div class="space-y-8">
        <!-- Core Concepts -->
        <UCard>
          <template #header>
            <h2 class="text-xl font-semibold">
              1. The Core Concepts
            </h2>
          </template>
          <div class="grid gap-4 sm:grid-cols-2">
            <div
              v-for="item in coreConcepts"
              :key="item.term"
              class="p-4 rounded-lg bg-gray-50 dark:bg-gray-800"
            >
              <h3 class="font-bold text-primary-500">
                {{ item.term }}
              </h3>
              <p class="text-sm text-gray-600 dark:text-gray-300 mt-1">
                {{ item.description }}
              </p>
            </div>
          </div>
        </UCard>

        <!-- Steps -->
        <UCard>
          <template #header>
            <h2 class="text-xl font-semibold">
              2. How to Manage Access
            </h2>
          </template>
          <div class="space-y-6">
            <div
              v-for="(step, index) in managementSteps"
              :key="index"
              class="relative pl-8 border-l-2 border-gray-200 dark:border-gray-700 pb-6 last:pb-0"
            >
              <div class="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-primary-500" />
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                {{ String.fromCharCode(65 + index) }}. {{ step.title }}
              </h3>
              <p class="mt-1 text-gray-600 dark:text-gray-300">
                {{ step.description }}
              </p>
              <div class="mt-3 bg-gray-100 dark:bg-gray-800 rounded p-3 text-sm">
                <p><span class="font-semibold">Action:</span> {{ step.action }}</p>
                <p class="mt-1 text-gray-500 dark:text-gray-400">
                  <span class="font-semibold">Example:</span> {{ step.example }}
                </p>
              </div>
            </div>
          </div>
        </UCard>

        <!-- Summary Table -->
        <UCard>
          <template #header>
            <h2 class="text-xl font-semibold">
              Summary of Tables
            </h2>
          </template>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Table Name
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Purpose
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                <tr>
                  <td class="px-4 py-3 font-mono text-sm text-primary-600 dark:text-primary-400">
                    roles
                  </td>
                  <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                    Define <em>who</em> exists (Admin, Guest, etc.).
                  </td>
                </tr>
                <tr>
                  <td class="px-4 py-3 font-mono text-sm text-primary-600 dark:text-primary-400">
                    resources
                  </td>
                  <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                    Define <em>what</em> exists (Products, Orders, etc.).
                  </td>
                </tr>
                <tr>
                  <td class="px-4 py-3 font-mono text-sm text-primary-600 dark:text-primary-400">
                    permissions
                  </td>
                  <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                    Define <em>actions</em> (Create, Read, Update, Delete).
                  </td>
                </tr>
                <tr>
                  <td class="px-4 py-3 font-mono text-sm text-primary-600 dark:text-primary-400">
                    role_resource_permissions
                  </td>
                  <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                    <strong>The Master Switch</strong>. Connects Role + Resource + Action.
                  </td>
                </tr>
                <tr>
                  <td class="px-4 py-3 font-mono text-sm text-primary-600 dark:text-primary-400">
                    users
                  </td>
                  <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                    Assigns a Role to a specific person via the <code>Role</code> field.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </UCard>
      </div>
    </div>
  </div>
</template>
