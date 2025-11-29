<script setup lang="ts">
definePageMeta({
  layout: 'default'
})

const toast = useToast()
const { fetch: refreshSession } = useUserSession()

const state = reactive({
  email: 'admin@example.com',
  password: '$1Password'
})

const loading = ref(false)

async function onSubmit() {
  loading.value = true
  try {
    await $fetch('/api/auth/login', {
      method: 'POST',
      body: state
    })
    await refreshSession()
    await navigateTo('/')
  } catch (err: any) {
    toast.add({
      title: 'Error',
      description: err.data?.message || 'Invalid credentials',
      color: 'red'
    })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-sm">
      <h2 class="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900 dark:text-white">
        Sign in to your account
      </h2>
    </div>

    <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
      <form class="space-y-6" @submit.prevent="onSubmit">
        <UFormGroup label="Email address" name="email">
          <UInput v-model="state.email" type="email" autocomplete="email" required />
        </UFormGroup>

        <UFormGroup label="Password" name="password">
          <UInput v-model="state.password" type="password" autocomplete="current-password" required />
        </UFormGroup>

        <div>
          <UButton type="submit" block :loading="loading">
            Sign in
          </UButton>
        </div>
      </form>
    </div>
  </div>
</template>
