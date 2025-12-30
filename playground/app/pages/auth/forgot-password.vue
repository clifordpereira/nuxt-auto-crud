<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

definePageMeta({
  layout: 'auth',
})

useSeoMeta({
  title: 'Forgot Password',
  description: 'Reset your password to regain access',
})

const toast = useToast()
const loading = ref(false)
const success = ref(false)
const email = ref('')

const fields = [{
  name: 'email',
  type: 'text' as const,
  label: 'Email',
  placeholder: 'Enter your email',
  required: true,
}]

const schema = z.object({
  email: z.string().email('Invalid email'),
})

type Schema = z.output<typeof schema>

async function onSubmit(payload: FormSubmitEvent<Schema>) {
  loading.value = true
  email.value = payload.data.email
  try {
    await $fetch('/api/auth/forgot-password', {
      method: 'POST',
      body: payload.data,
    })
    success.value = true
  }
  catch (err: unknown) {
    const message = (err as { data?: { message?: string } })?.data?.message || 'Something went wrong'
    toast.add({
      title: 'Error',
      description: message,
      color: 'error',
    })
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <UAuthForm
    v-if="!success"
    :fields="fields"
    :schema="schema"
    title="Forgot Password"
    description="Enter your email and we'll send you a link to reset your password."
    icon="i-lucide-key-round"
    align="top"
    :loading="loading"
    @submit="onSubmit"
  >
    <template #footer>
      Remembered your password? <ULink
        to="/login"
        class="text-primary font-medium"
      >Sign in</ULink>.
    </template>
  </UAuthForm>

  <UAuthForm
    v-else
    title="Check your email"
    :description="`If an account exists for ${email}, we have sent a password reset link.`"
    icon="i-lucide-mail"
    align="top"
  >
    <template #footer>
      <UButton
        to="/login"
        color="neutral"
        variant="subtle"
        block
      >
        Back to Login
      </UButton>
    </template>
  </UAuthForm>
</template>
