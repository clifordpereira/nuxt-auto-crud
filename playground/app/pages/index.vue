<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
definePageMeta({
  layout: false,
})

const { loggedIn, user } = useUserSession()

// Redirect to dashboard if already logged in
if (loggedIn.value) {
  await navigateTo('/dashboard')
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 px-4 sm:px-6 lg:px-8">
    <div class="w-full max-w-4xl space-y-8 py-12">
      <!-- Header -->
      <div class="text-center">
        <UIcon
          name="i-heroicons-command-line"
          class="mx-auto h-16 w-16 text-primary-500"
        />
        <h1 class="mt-6 text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
          Nuxt Auto CRUD
        </h1>
        <p class="mt-2 text-lg text-gray-600 dark:text-gray-400">
          Automatic CRUD API & UI generation for Nuxt applications
        </p>
      </div>

      <!-- Login Status -->
      <div
        v-if="loggedIn"
        class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 text-center"
      >
        <p class="text-green-800 dark:text-green-200">
          ✓ Logged in as <strong>{{ user?.email }}</strong>
        </p>
        <UButton
          to="/dashboard"
          color="primary"
          size="lg"
          class="mt-3"
          icon="i-heroicons-arrow-right"
        >
          Go to Dashboard
        </UButton>
      </div>

      <!-- Main Content -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Getting Started -->
        <UCard class="shadow-lg">
          <template #header>
            <h2 class="text-xl font-semibold flex items-center gap-2">
              <UIcon
                name="i-heroicons-rocket-launch"
                class="text-primary-500"
              />
              Getting Started
            </h2>
          </template>
          <div class="space-y-4">
            <p class="text-gray-600 dark:text-gray-400">
              Welcome to the Nuxt Auto CRUD playground! This demo showcases automatic CRUD API and UI generation.
            </p>
            <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <h3 class="font-semibold mb-3 text-gray-900 dark:text-white">
                Demo Credentials
              </h3>
              <div class="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p class="font-semibold text-primary-600 dark:text-primary-400">
                    Admin
                  </p>
                  <p class="text-gray-600 dark:text-gray-400">
                    admin@example.com
                  </p>
                  <p class="text-gray-600 dark:text-gray-400">
                    $1Password
                  </p>
                </div>
                <div>
                  <p class="font-semibold text-primary-600 dark:text-primary-400">
                    User
                  </p>
                  <p class="text-gray-600 dark:text-gray-400">
                    user@example.com
                  </p>
                  <p class="text-gray-600 dark:text-gray-400">
                    $1Password
                  </p>
                </div>
              </div>
            </div>
            <UButton
              v-if="!loggedIn"
              to="/login"
              color="primary"
              size="lg"
              block
              icon="i-heroicons-arrow-right-on-rectangle"
            >
              Sign In
            </UButton>
          </div>
        </UCard>

        <!-- Features -->
        <UCard class="shadow-lg">
          <template #header>
            <h2 class="text-xl font-semibold flex items-center gap-2">
              <UIcon
                name="i-heroicons-sparkles"
                class="text-primary-500"
              />
              Features
            </h2>
          </template>
          <ul class="space-y-3 text-sm text-gray-600 dark:text-gray-400">
            <li class="flex items-start gap-2">
              <UIcon
                name="i-heroicons-check-circle"
                class="text-green-500 mt-0.5 shrink-0"
              />
              <span><strong>Auto-generated APIs:</strong> CRUD endpoints created automatically from Drizzle schema</span>
            </li>
            <li class="flex items-start gap-2">
              <UIcon
                name="i-heroicons-check-circle"
                class="text-green-500 mt-0.5 shrink-0"
              />
              <span><strong>Authentication:</strong> Built-in session management and role-based access control</span>
            </li>
            <li class="flex items-start gap-2">
              <UIcon
                name="i-heroicons-check-circle"
                class="text-green-500 mt-0.5 shrink-0"
              />
              <span><strong>Dynamic UI:</strong> Tables and forms generated on-the-fly based on data types</span>
            </li>
            <li class="flex items-start gap-2">
              <UIcon
                name="i-heroicons-check-circle"
                class="text-green-500 mt-0.5 shrink-0"
              />
              <span><strong>Relations:</strong> Automatic handling of relationships between resources</span>
            </li>
            <li class="flex items-start gap-2">
              <UIcon
                name="i-heroicons-check-circle"
                class="text-green-500 mt-0.5 shrink-0"
              />
              <span><strong>Permissions:</strong> Fine-grained access control per resource and action</span>
            </li>
          </ul>
        </UCard>
      </div>

      <!-- Quick Links -->

      <UCard class="shadow-lg">
        <template #header>
          <h2 class="text-xl font-semibold flex items-center gap-2">
            <UIcon
              name="i-heroicons-link"
              class="text-primary-500"
            />
            Quick Links
          </h2>
        </template>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          <UButton
            href="https://auto-crud.clifland.in/"
            target="_blank"
            variant="outline"
            block
            icon="i-heroicons-book-open"
          >
            Documentation
          </UButton>
          <UButton
            href="https://github.com/clifordpereira/nuxt-auto-crud"
            target="_blank"
            variant="outline"
            block
            icon="i-simple-icons-github"
          >
            Repository
          </UButton>
          <UButton
            href="https://github.com/clifordpereira/nuxt-auto-crud/issues"
            target="_blank"
            variant="outline"
            block
            icon="i-heroicons-bug-ant"
          >
            Report Issue
          </UButton>
          <UButton
            href="https://github.com/clifordpereira/nuxt-auto-crud/blob/HEAD/CONTRIBUTING.md"
            target="_blank"
            variant="outline"
            block
            icon="i-heroicons-users"
          >
            Collaboration Guide
          </UButton>
          <UButton
            href="https://www.clifland.in/"
            target="_blank"
            variant="outline"
            block
            icon="i-heroicons-globe-alt"
          >
            Creator Website
          </UButton>
        </div>
      </UCard>

      <!-- Footer -->
      <div class="text-center text-sm text-gray-500 dark:text-gray-400">
        <p>Built with Nuxt, Drizzle ORM, and NuxtHub</p>
      </div>
    </div>
  </div>
</template>
