<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '#ui/types'

definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})

const { user, fetch: refreshSession } = useUserSession()
const toast = useToast()

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  avatar: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  password: z.string().min(6, 'Password must be at least 6 characters').optional().or(z.literal(''))
})

type Schema = z.output<typeof schema>

const state = reactive({
  id: (user.value as { id: number | string })?.id || '',
  roleId: (user.value as { roleId: number | string })?.roleId || '',
  name: user.value?.name || '',
  email: user.value?.email || '',
  avatar: user.value?.avatar || '',
  password: ''
})

async function onSubmit(event: FormSubmitEvent<Schema>) {
  try {
    const payload = {
      name: event.data.name,
      avatar: event.data.avatar
    }

    // Only send password if provided
    if (event.data.password) {
      Object.assign(payload, { password: event.data.password })
    }

    // PATCH to auto-crud API
    const userId = (user.value as { id: number | string }).id

    await $fetch(`/api/users/${userId}`, {
      method: 'PATCH',
      body: payload
    })

    await $fetch('/api/auth/refresh', { method: 'POST' })
    await refreshSession()
    toast.add({ title: 'Profile updated', icon: 'i-lucide-check' })

    // Reset password field
    state.password = ''
  } catch (error: unknown) {
    const err = error as { data?: { message?: string }, message: string }
    toast.add({
      title: 'Update failed',
      description: err.data?.message || err.message,
      color: 'error'
    })
  }
}
</script>

<template>
  <UContainer class="max-w-md py-10">
    <UCard>
      <template #header>
        <h1 class="text-xl font-bold">
          Your Profile
        </h1>
        <p class="text-gray-500 text-sm">
          Update your account details
        </p>
      </template>

      <UForm
        :schema="schema"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <UFormField
          label="Full Name"
          name="name"
        >
          <UInput v-model="state.name" />
        </UFormField>

        <UFormField
          label="Email Address"
          name="email"
          help="Email cannot be changed"
        >
          <UInput
            v-model="state.email"
            disabled
          />
        </UFormField>

        <UFormField
          label="Avatar URL"
          name="avatar"
        >
          <UInput
            v-model="state.avatar"
            placeholder="https://..."
          />
        </UFormField>

        <div class="flex items-center gap-4 py-2">
          <UAvatar
            :src="state.avatar"
            :alt="state.name"
            size="lg"
          />
          <span class="text-xs text-gray-500">Preview</span>
        </div>

        <UDivider label="Security" />

        <UFormField
          label="New Password (Optional)"
          name="password"
          help="Leave blank to keep current password"
        >
          <CommonPassword v-model="state.password" />
        </UFormField>

        <UButton
          type="submit"
          label="Save Changes"
          block
        />
      </UForm>
    </UCard>
  </UContainer>
</template>
