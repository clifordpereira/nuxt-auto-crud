<script setup lang="ts">
const { loggedIn, clear } = useUserSession()

async function logout() {
  await clear()
  await navigateTo('/')
}

const items = computed(() => [{
  label: 'Docs',
  to: '/docs/auto-crud'
}, {
  label: 'Pricing',
  to: '/pricing'
}, {
  label: 'Blog',
  to: '/blog'
}, {
  label: 'Changelog',
  to: '/changelog'
}])
</script>

<template>
  <UHeader>
    <template #left>
      <NuxtLink to="/">
        <h1>Nuxt Auto CRUD</h1>
      </NuxtLink>
    </template>

    <UNavigationMenu
      :items="items"
      variant="link"
    />

    <template #right>
      <UColorModeButton />

      <template v-if="!loggedIn">
        <UButton
          icon="i-lucide-log-in"
          color="neutral"
          variant="ghost"
          to="/login"
          class="lg:hidden"
        />

        <UButton
          label="Sign in"
          color="neutral"
          variant="outline"
          to="/login"
          class="hidden lg:inline-flex"
        />

        <UButton
          label="Sign up"
          color="neutral"
          trailing-icon="i-lucide-arrow-right"
          class="hidden lg:inline-flex"
          to="/signup"
        />
      </template>

      <UButton
        v-else
        label="Logout"
        color="neutral"
        variant="outline"
        class="hidden lg:inline-flex"
        @click="logout"
      />
    </template>

    <template #body>
      <UNavigationMenu
        :items="items"
        orientation="vertical"
        class="-mx-2.5"
      />

      <USeparator class="my-6" />

      <template v-if="!loggedIn">
        <UButton
          label="Sign in"
          color="neutral"
          variant="subtle"
          to="/login"
          block
          class="mb-3"
        />
        <UButton
          label="Sign up"
          color="neutral"
          to="/signup"
          block
        />
      </template>

      <UButton
        v-else
        label="Logout"
        color="neutral"
        variant="subtle"
        block
        @click="logout"
      />
    </template>
  </UHeader>
</template>
