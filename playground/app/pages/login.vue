<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
definePageMeta({
  layout: false,
})

const toast = useToast()
const { fetch: refreshSession } = useUserSession()

const state = reactive({
  email: 'admin@example.com',
  password: '$1Password',
})

const loading = ref(false)

async function onSubmit() {
  loading.value = true
  try {
    await $fetch('/api/auth/login', {
      method: 'POST',
      body: state,
    })
    await refreshSession()
    // Force a reload to ensure layout changes (guest -> admin) are applied
    window.location.href = '/'
  }
  catch (err: unknown) {
    toast.add({
      title: 'Error',

      description: (err as { data?: { message?: string } }).data?.message || 'Invalid credentials',
      color: 'error',
    })
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4 sm:px-6 lg:px-8">
    <div class="w-full max-w-md space-y-8">
      <div class="text-center">
        <UIcon
          name="i-heroicons-command-line"
          class="mx-auto h-12 w-12 text-primary-500"
        />
        <h2 class="mt-6 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          Nuxt Auto CRUD
        </h2>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Sign in to access the dashboard
        </p>
      </div>

      <div class="bg-white dark:bg-gray-900 py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-200 dark:border-gray-800">
        <form
          class="space-y-6"
          @submit.prevent="onSubmit"
        >
          <UFormField
            label="Email address"
            name="email"
          >
            <UInput
              v-model="state.email"
              type="email"
              autocomplete="email"
              required
              icon="i-heroicons-envelope"
              size="lg"
            />
          </UFormField>

          <UFormField
            label="Password"
            name="password"
          >
            <UInput
              v-model="state.password"
              type="password"
              autocomplete="current-password"
              required
              icon="i-heroicons-lock-closed"
              size="lg"
            />
          </UFormField>

          <div>
            <UButton
              type="submit"
              block
              :loading="loading"
              size="lg"
              icon="i-heroicons-arrow-right-on-rectangle"
            >
              Sign in
            </UButton>
          </div>
        </form>

        <div class="mt-6">
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300 dark:border-gray-700" />
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-white dark:bg-gray-900 text-gray-500">
                Demo Credentials
              </span>
            </div>
          </div>

          <div class="mt-6 grid grid-cols-2 gap-3 text-xs text-center text-gray-500">
            <div>
              <p class="font-semibold">
                Admin
              </p>
              <p>admin@example.com</p>
              <p>$1Password</p>
            </div>
            <div>
              <p class="font-semibold">
                User
              </p>
              <p>user@example.com</p>
              <p>$1Password</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
