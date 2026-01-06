<script setup lang="ts">
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

definePageMeta({
  layout: 'auth',
})

useSeoMeta({
  title: 'Sign up',
  description: 'Create an account to get started',
})

const toast = useToast()
const { providers } = useAuthSettings()
const { handleAuthQueryError, handleSubmitError } = useAuthErrorHandling()

handleAuthQueryError()

const { data: roles } = await useFetch<any[]>('/api/roles')
const selectableRoles = computed(() => {
  return roles.value
    ?.filter((r: any) => !['public', 'user', 'manager', 'admin'].includes(r.name))
    .map((r: any) => ({
      label: r.name ? r.name.charAt(0).toUpperCase() + r.name.slice(1) : 'Unknown',
      value: r.id,
    })) || []
})

const fields = computed(() => {
  const allFields = [
    {
      name: 'name',
      type: 'text' as const,
      label: 'Name',
      placeholder: 'Enter your name',
    },
    {
      name: 'email',
      type: 'text' as const,
      label: 'Email',
      placeholder: 'Enter your email',
    },
    {
      name: 'password',
      label: 'Password',
      type: 'password' as const,
      placeholder: 'Enter your password',
    },
    {
      name: 'roleId',
      type: 'select' as const,
      label: 'Register As',
      placeholder: 'Select a role',
      items: selectableRoles.value,
    },
  ]

  // Return base fields if no selectable roles available
  if (!selectableRoles.value || selectableRoles.value.length === 0) {
    return allFields.filter(f => f.name !== 'roleId')
  }
  return allFields
})

const { fetch } = useUserSession()

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Must be at least 8 characters'),
  roleId: z.any().optional(),
})

type Schema = z.infer<typeof schema>

async function onSubmit(payload: FormSubmitEvent<Schema>) {
  try {
    if (!payload.data) return

    // Use a fresh object to keep payload.data clean/immutable
    const data = { ...payload.data } as any

    // Extract the numeric ID if the component sends back an object
    if (data.roleId && typeof data.roleId === 'object') {
      data.roleId = data.roleId.value
    }

    await $fetch('/api/auth/signup', {
      method: 'POST',
      body: data,
    })
    await fetch()
    toast.add({
      title: 'Success',
      description: 'Account created successfully',
    })
    await navigateTo('/admin/dashboard')
  }
  catch (error) {
    handleSubmitError(error, 'Signup failed')
  }
}
</script>

<template>
  <UAuthForm
    :fields="fields"
    :schema="schema"
    :providers="providers"
    title="Create an account"
    :submit="{ label: 'Create account' }"
    @submit="onSubmit"
  >
    <template #description>
      Already have an account?
      <ULink
        to="/login"
        class="text-primary font-medium"
      >Login</ULink>.
    </template>

    <template #footer>
      By signing up, you agree to our
      <ULink
        to="/"
        class="text-primary font-medium"
      >Terms of Service</ULink>.
    </template>
  </UAuthForm>
</template>
