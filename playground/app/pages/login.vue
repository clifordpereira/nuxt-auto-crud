<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

definePageMeta({
  layout: 'auth'
})

useSeoMeta({
  title: 'Login',
  description: 'Login to your account to continue'
})

const toast = useToast()
const route = useRoute()

const fields = [{
  name: 'email',
  type: 'text' as const,
  label: 'Email',
  placeholder: 'Enter your email',
  required: true
}, {
  name: 'password',
  label: 'Password',
  type: 'password' as const,
  placeholder: 'Enter your password'
}, {
  name: 'remember',
  label: 'Remember me',
  type: 'checkbox' as const
}]

const { fetch, openInPopup } = useUserSession()

const providers = [{
  label: 'Google',
  icon: 'i-simple-icons-google',
  onClick: () => { window.location.href = '/auth/google' }
}, {
  label: 'GitHub',
  icon: 'i-simple-icons-github',
  onClick: () => { window.location.href = '/auth/github' }
}]

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Must be at least 8 characters')
})

type Schema = z.output<typeof schema>

async function onSubmit(payload: FormSubmitEvent<Schema>) {
  try {
    await $fetch('/api/auth/login', {
      method: 'POST',
      body: payload.data
    })
    await fetch()
    toast.add({ title: 'Success', description: 'Logged in successfully' })
    await navigateTo('/admin/dashboard')
  }
  catch (error) {
    const message = (error as { data?: { message?: string } })?.data?.message || 'Login failed'
    toast.add({ title: 'Error', description: message, color: 'error' })
  }
}

watchEffect(() => {
  if (route.query.auth_error) {
    const errorMessages: Record<string, string> = {
      github: 'Failed to login with GitHub.',
      google: 'Failed to login with Google.',
      no_email: 'Your social account did not provide an email address.',
      user_creation_failed: 'Failed to create a user account.'
    }
    
    toast.add({
      title: 'Authentication Error',
      description: errorMessages[route.query.auth_error as string] || 'An unknown error occurred during authentication.',
      color: 'error'
    })

    // Clean up query params
    const query = { ...route.query }
    delete query.auth_error
    navigateTo({ path: route.path, query }, { replace: true })
  }
})
</script>

<template>
  <UAuthForm
    :fields="fields"
    :schema="schema"
    :providers="providers"
    title="Welcome back"
    icon="i-lucide-lock"
    @submit="onSubmit"
  >
    <template #description>
      Don't have an account? <ULink
        to="/"
        class="text-primary font-medium"
      >Sign up</ULink>.
    </template>

    <template #password-hint>
      <ULink
        to="/auth/forgot-password"
        class="text-primary font-medium"
        tabindex="-1"
      >Forgot password?</ULink>
    </template>

    <template #footer>
      By signing in, you agree to our <ULink
        to="/"
        class="text-primary font-medium"
      >Terms of Service</ULink>.
    </template>
  </UAuthForm>
</template>
