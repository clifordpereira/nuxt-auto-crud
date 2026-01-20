<script setup lang="ts">
const columns = [{
  label: 'Resources',
  children: [{
    label: 'GitHub Repo',
    to: 'https://github.com/clifordpereira/nuxt-auto-crud_template',
    target: '_blank',
  }, {
    label: 'Core NPM Package',
    to: 'https://www.npmjs.com/package/nuxt-auto-crud',
    target: '_blank',
  }, {
    label: 'Changelog',
    to: '/changelog',
  }, {
    label: 'Blog',
    to: '/blog',
  }],
}, {
  label: 'YouTube Demos',
  children: [{
    label: 'Installation',
    to: 'https://www.youtube.com/watch?v=_o0cddJUU50&list=PLnbvxcojhIixqM1J08Tnm7vmMdx2wsy4B&index=1',
    target: '_blank',
  }, {
    label: 'Demo Data',
    to: 'https://www.youtube.com/watch?v=AXQKByqMOJc&list=PLnbvxcojhIixqM1J08Tnm7vmMdx2wsy4B&index=2',
    target: '_blank',
  }, {
    label: 'Add Schema',
    to: 'https://www.youtube.com/watch?v=33-HBFfGfA4&list=PLnbvxcojhIixqM1J08Tnm7vmMdx2wsy4B&index=3',
    target: '_blank',
  }, {
    label: 'Permissions (RBAC)',
    to: 'https://www.youtube.com/watch?v=Ot3qMzWe4OU&list=PLnbvxcojhIixqM1J08Tnm7vmMdx2wsy4B&index=4',
    target: '_blank',
  }, {
    label: 'Deployment',
    to: 'https://www.youtube.com/watch?v=bbuKgfV-I44&list=PLnbvxcojhIixqM1J08Tnm7vmMdx2wsy4B&index=5',
    target: '_blank',
  }, {
    label: 'Environment Variable',
    to: 'https://www.youtube.com/watch?v=bh5EkArlb-E&list=PLnbvxcojhIixqM1J08Tnm7vmMdx2wsy4B&index=6',
    target: '_blank',
  }],
}, {
  label: 'Community',
  children: [{
    label: 'Discuss on Discord',
    to: 'https://discord.gg/FBkQQfRFJM',
    target: '_blank',
  }, {
    label: 'GitHub Discussions',
    to: 'https://github.com/clifordpereira/nuxt-auto-crud/discussions/1',
    target: '_blank',
  }, {
    label: 'Report Issue',
    to: 'https://github.com/clifordpereira/nuxt-auto-crud_template/issues',
    target: '_blank',
  }],
}, {
  label: 'Modules Used',
  children: [{
    label: 'Nuxt Auto Crud',
    to: 'https://github.com/clifordpereira/nuxt-auto-crud',
    target: '_blank',
  }, {
    label: 'Drizzle ORM',
    to: 'https://orm.drizzle.team/docs/sql-schema-declaration',
    target: '_blank',
  }, {
    label: 'Nuxt Authentication',
    to: 'https://nuxt.com/docs/4.x/guide/recipes/sessions-and-authentication',
    target: '_blank',
  }, {
    label: 'Nuxt Authorization',
    to: 'https://nuxt.com/modules/authorization',
    target: '_blank',
  }, {
    label: 'Nuxt UI SaaS',
    to: 'https://saas-template.nuxt.dev/',
    target: '_blank',
  }],
}]

const toast = useToast()

const email = ref('')
const loading = ref(false)

async function onSubmit() {
  loading.value = true
  try {
    await $fetch('/api/subscribers', {
      method: 'POST',
      body: {
        email: email.value,
      },
    })

    toast.add({
      title: 'Subscribed!',
      description: 'You\'ve been subscribed to our newsletter.',
    })
    email.value = ''
  }
  catch (error: unknown) {
    const err = error as { data?: { message?: string } }
    toast.add({
      title: 'Error',
      description: err.data?.message || 'Something went wrong. Please try again.',
      color: 'error',
    })
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <USeparator
    icon="i-simple-icons-nuxtdotjs"
    class="h-px"
  />

  <UFooter
    :ui="{ top: 'border-b border-default' }"
    class="relative"
  >
    <template #top>
      <UContainer>
        <UFooterColumns :columns="columns">
          <template #right>
            <form @submit.prevent="onSubmit">
              <UFormField
                name="email"
                label="Subscribe to our newsletter"
                size="lg"
              >
                <UInput
                  v-model="email"
                  type="email"
                  class="w-full"
                  placeholder="Enter your email"
                >
                  <template #trailing>
                    <UButton
                      type="submit"
                      size="xs"
                      color="neutral"
                      label="Subscribe"
                      :loading="loading"
                    />
                  </template>
                </UInput>
              </UFormField>
            </form>
          </template>
        </UFooterColumns>
      </UContainer>
    </template>

    <template #left>
      <p class="text-muted text-sm">
        Built by <NuxtLink
          to="https://clifland.in"
          target="_blank"
          class="hover:text-primary"
        >Clifland</NuxtLink>
      </p>
    </template>

    <template #right>
      <UButton
        to="https://discord.gg/FBkQQfRFJM"
        target="_blank"
        icon="i-simple-icons-discord"
        aria-label="Auto Crud on Discord"
        color="neutral"
        variant="ghost"
      />
      <UButton
        to="https://github.com/clifordpereira/nuxt-auto-crud_template"
        target="_blank"
        icon="i-simple-icons-github"
        aria-label="Auto Crud on GitHub"
        color="neutral"
        variant="ghost"
      />
    </template>
  </UFooter>
</template>
