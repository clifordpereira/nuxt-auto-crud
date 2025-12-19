<script setup lang="ts">
definePageMeta({
  layout: 'default',
})

const route = useRoute()
const token = route.query.token as string

const state = reactive({
  token,
  password: '',
  confirmPassword: '',
})

const loading = ref(false)
const success = ref(false)
const toast = useToast()

async function onSubmit() {
  if (state.password !== state.confirmPassword) {
    toast.add({ title: 'Error', description: 'Passwords do not match', color: 'error' })
    return
  }

  loading.value = true
  try {
    await $fetch('/api/auth/reset-password', {
      method: 'POST',
      body: {
        token: state.token,
        password: state.password,
      },
    })
    success.value = true
    toast.add({ title: 'Success', description: 'Password reset successfully', color: 'success' })
    setTimeout(() => {
      navigateTo('/')
    }, 2000)
  }
  catch (err: any) {
    toast.add({
      title: 'Error',
      description: err.data?.message || 'Something went wrong',
      color: 'error',
    })
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-[60vh] flex items-center justify-center px-4">
    <UCard class="w-full max-w-md">
      <div v-if="!success">
        <div class="text-center mb-6">
          <h1 class="text-2xl font-bold">
            Reset Password
          </h1>
          <p class="text-sm text-gray-500 mt-2">
            Enter your new password below.
          </p>
        </div>

        <form
          class="space-y-4"
          @submit.prevent="onSubmit"
        >
          <UFormField
            label="New Password"
            name="password"
          >
            <UInput
              v-model="state.password"
              type="password"
              placeholder="••••••••"
              required
              block
            />
          </UFormField>

          <UFormField
            label="Confirm New Password"
            name="confirmPassword"
          >
            <UInput
              v-model="state.confirmPassword"
              type="password"
              placeholder="••••••••"
              required
              block
            />
          </UFormField>

          <UButton
            type="submit"
            block
            :loading="loading"
          >
            Reset Password
          </UButton>
        </form>
      </div>

      <div
        v-else
        class="text-center py-8"
      >
        <UIcon
          name="i-heroicons-check-circle"
          class="h-12 w-12 text-green-500 mx-auto"
        />
        <h2 class="text-xl font-bold mt-4">
          Password Reset!
        </h2>
        <p class="text-gray-500 mt-2">
          Your password has been changed. Redirecting to login...
        </p>
      </div>
    </UCard>
  </div>
</template>
