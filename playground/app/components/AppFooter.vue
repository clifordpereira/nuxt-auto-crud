<script setup lang="ts">
const columns = [{
  label: 'Resources',
  children: [{
    label: 'Docs',
    to: '/docs/auto-crud',
  }, {
    label: 'Template',
    to: 'https://github.com/clifordpereira/nuxt-auto-crud_template',
    target: '_blank',
  }, {
    label: 'Changelog',
    to: '/changelog',
  }, {
    label: 'Blog',
    to: '/blog',
  }],
}, {
  label: 'Community',
  children: [{
    label: 'GitHub Repo',
    to: 'https://github.com/clifordpereira/nuxt-auto-crud',
    target: '_blank',
  }, {
    label: 'NPM Package',
    to: 'https://www.npmjs.com/package/nuxt-auto-crud',
    target: '_blank',
  }, {
    label: 'Discuss on Discord',
    to: 'https://discord.gg/hGgyEaGu',
    target: '_blank',
  }, {
    label: 'GitHub Discussions',
    to: 'https://github.com/clifordpereira/nuxt-auto-crud/discussions/1',
    target: '_blank',
  }],
}, {
  label: 'YouTube',
  children: [{
    label: 'Installation',
    to: 'https://youtu.be/M9-koXmhB9k',
    target: '_blank',
  }, {
    label: 'Add Schema',
    to: 'https://youtu.be/7gW0KW1KtN0',
    target: '_blank',
  }, {
    label: 'Permissions',
    to: 'https://www.youtube.com/watch?v=Yty3OCYbwOo',
    target: '_blank',
  }, {
    label: 'RBAC Demo',
    to: 'https://www.youtube.com/watch?v=W0ju4grRC9M',
    target: '_blank',
  }],
}, {
  label: 'Built with',
  children: [{
    label: 'Nuxt Auto Crud',
    to: 'https://www.npmjs.com/package/nuxt-auto-crud',
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

  <UFooter :ui="{ top: 'border-b border-default' }">
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
        to="https://discord.gg/hGgyEaGu"
        target="_blank"
        icon="i-simple-icons-discord"
        aria-label="Nuxt Auto CRUD on Discord"
        color="neutral"
        variant="ghost"
      />
      <UButton
        to="https://github.com/clifordpereira/nuxt-auto-crud"
        target="_blank"
        icon="i-simple-icons-github"
        aria-label="Nuxt Auto CRUD on GitHub"
        color="neutral"
        variant="ghost"
      />
    </template>
  </UFooter>
</template>
