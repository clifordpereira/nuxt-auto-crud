<script setup lang="ts">
definePageMeta({
  layout: 'default',
})

const state = reactive({
  email: '',
})

const loading = ref(false)
const success = ref(false)
const toast = useToast()

async function onSubmit() {
  loading.value = true
  try {
    await $fetch('/api/auth/forgot-password', {
      method: 'POST',
      body: state,
    })
    success.value = true
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
            Forgot Password
          </h1>
          <p class="text-sm text-gray-500 mt-2">
            Enter your email and we'll send you a link to reset your password.
          </p>
        </div>

        <form
          class="space-y-4"
          @submit.prevent="onSubmit"
        >
          <UFormField
            label="Email"
            name="email"
          >
            <UInput
              v-model="state.email"
              type="email"
              placeholder="you@example.com"
              required
              block
            />
          </UFormField>

          <UButton
            type="submit"
            block
            :loading="loading"
          >
            Send Reset Link
          </UButton>

          <div class="text-center">
            <ULink
              to="/"
              class="text-sm text-primary-500 underline"
            >
              Back to Login
            </ULink>
          </div>
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
          Check your email
        </h2>
        <p class="text-gray-500 mt-2">
          If an account exists for {{ state.email }}, we have sent a password reset link.
        </p>
        <UButton
          class="mt-6"
          to="/"
          variant="ghost"
        >
          Back to Home
        </UButton>
      </div>
    </UCard>
  </div>
</template>
