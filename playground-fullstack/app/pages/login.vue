<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
definePageMeta({
  layout: false,
})

const toast = useToast()
const { fetch: refreshSession } = useUserSession()

const state = reactive({
  email: '',
  password: '',
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      description: (err as any).data?.message || 'Invalid credentials',
      color: 'error',
    })
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex">
    <!-- Left Side: Branding/Image -->
    <div class="hidden lg:flex lg:w-1/2 relative bg-gray-900 justify-center items-center overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-br from-primary-600/90 to-gray-900/90 z-10" />
      <img
        src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop"
        alt="Dashboard Background"
        class="absolute inset-0 w-full h-full object-cover"
      >
      <div class="relative z-20 p-12 text-white">
        <div class="flex items-center gap-4 mb-8">
          <UIcon
            name="i-heroicons-command-line"
            class="w-12 h-12 text-primary-400"
          />
          <h1 class="text-4xl font-bold text-black">
            Nuxt Auto CRUD
          </h1>
        </div>
        <p class="text-xl text-black max-w-md leading-relaxed text-justify italic">
          This template demonstrates securing your application by implementing Authentication and Authorization alongside nuxt-auto-crud. Remember that the module provides the backend CRUD APIs, but the frontend user interface must be developed by you.
        </p>
      </div>
    </div>

    <!-- Right Side: Login Form -->
    <div class="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24 bg-gray-50 dark:bg-gray-950">
      <div class="mx-auto w-full max-w-sm lg:w-96">
        <div class="lg:hidden mb-8 text-center">
          <UIcon
            name="i-heroicons-command-line"
            class="w-12 h-12 text-primary-500 mx-auto"
          />
          <h2 class="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
            Nuxt Auto CRUD
          </h2>
        </div>

        <div>
          <h2 class="text-2xl font-bold leading-9 tracking-tight text-gray-900 dark:text-white">
            Sign in to your account
          </h2>
        </div>

        <div class="mt-10">
          <form
            class="space-y-8"
            @submit.prevent="onSubmit"
          >
            <UFormGroup
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
            </UFormGroup>

            <UFormGroup
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
            </UFormGroup>

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
        </div>
      </div>
    </div>
  </div>
</template>
