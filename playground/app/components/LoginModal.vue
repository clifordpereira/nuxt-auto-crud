<script setup lang="ts">
const props = withDefaults(defineProps<{
  label?: string
  color?: string
  variant?: string
  size?: string
  class?: string
}>(), {
  label: 'Sign In',
  color: 'primary',
  variant: 'solid',
  size: 'lg',
  class: '',
})

const isOpen = ref(false)
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

    // Refresh schemas to ensure sidebar is updated with correct permissions
    const { refresh } = await useResourceSchemas()
    await refresh()

    isOpen.value = false
    // Redirect to dashboard after successful login
    await navigateTo('/resource/users')
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
  <UModal v-model:open="isOpen">
    <UButton
      :color="props.color as any"
      :variant="props.variant as any"
      :size="props.size as any"
      :class="props.class"
      icon="i-heroicons-arrow-right-on-rectangle"
    >
      {{ props.label }}
    </UButton>

    <template #content>
      <div class="p-6">
        <div class="text-center mb-6">
          <UIcon
            name="i-heroicons-command-line"
            class="mx-auto h-12 w-12 text-primary-500"
          />
          <h2 class="mt-4 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Sign In
          </h2>
          <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Access the Nuxt Auto CRUD dashboard
          </p>
        </div>

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
              class="w-full"
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
              class="w-full"
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
    </template>
  </UModal>
</template>
