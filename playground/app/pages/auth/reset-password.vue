<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

definePageMeta({
  layout: 'auth'
})

useSeoMeta({
  title: 'Reset Password',
  description: 'Enter your new password below'
})

const route = useRoute()
const toast = useToast()
const loading = ref(false)
const success = ref(false)
const token = route.query.token as string

const fields = [{
  name: 'password',
  type: 'password' as const,
  label: 'New Password',
  placeholder: 'Enter your new password',
  required: true
}, {
  name: 'confirmPassword',
  type: 'password' as const,
  label: 'Confirm Password',
  placeholder: 'Confirm your new password',
  required: true
}]

const schema = z.object({
  password: z.string().min(8, 'Must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Must be at least 8 characters')
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})

type Schema = z.output<typeof schema>

async function onSubmit(payload: FormSubmitEvent<Schema>) {
  if (!token) {
    toast.add({ title: 'Error', description: 'Invalid or missing token', color: 'error' })
    return
  }

  loading.value = true
  try {
    await $fetch('/api/auth/reset-password', {
      method: 'POST',
      body: {
        token,
        password: payload.data.password
      }
    })
    success.value = true
    toast.add({ title: 'Success', description: 'Password reset successfully' })
    setTimeout(() => {
      navigateTo('/login')
    }, 2000)
  }
  catch (err: any) {
    toast.add({
      title: 'Error',
      description: err.data?.message || 'Something went wrong',
      color: 'error'
    })
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <template v-if="!token">
    <UAuthForm
      title="Invalid Link"
      description="The password reset link is invalid or has expired. Please request a new one."
      icon="i-lucide-alert-circle"
      align="top"
    >
      <template #footer>
        <UButton
          to="/auth/forgot-password"
          color="primary"
          block
        >
          Request new link
        </UButton>
      </template>
    </UAuthForm>
  </template>

  <template v-else-if="!success">
    <UAuthForm
      :fields="fields"
      :schema="schema"
      title="Reset Password"
      description="Please enter your new password below."
      icon="i-lucide-lock-keyhole"
      align="top"
      :loading="loading"
      @submit="onSubmit"
    />
  </template>

  <template v-else>
    <UAuthForm
      title="Password Reset!"
      description="Your password has been successfully changed. Redirecting to login..."
      icon="i-lucide-check-circle"
      align="top"
    >
      <template #footer>
        <UButton
          to="/login"
          color="neutral"
          variant="subtle"
          block
        >
          Go to Login
        </UButton>
      </template>
    </UAuthForm>
  </template>
</template>
