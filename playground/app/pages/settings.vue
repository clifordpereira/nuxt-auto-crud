<script setup lang="ts">
definePageMeta({
  layout: "dashboard",
  middleware: "auth",
});

useSeoMeta({
  title: "Settings",
  description: "View application settings",
});

const { data: status, pending, refresh } = await useFetch("/api/settings-status", {
  key: 'admin-env-check',
  cache: 'no-cache'
});

type BadgeColor = "error" | "primary" | "warning" | "secondary" | "success" | "info" | "neutral" | undefined

const config = computed(() => [
  {
    title: 'Session Security',
    required: true,
    keys: ['NUXT_SESSION_PASSWORD'],
    link: 'https://generate-secret.vercel.app/32',
    linkText: 'Generate Secret Key',
    status: status.value ? getSessionStatus(status.value.isSessionPasswordValid, status.value.hasSessionPassword) : null
  },
  {
    title: 'Admin Access',
    required: true,
    keys: ['NUXT_ADMIN_EMAIL', 'NUXT_ADMIN_PASSWORD'],
    manualNote: 'Add your own admin-email and password as environment variables',
    status: status.value ? getAdminStatus(status.value.isAdminEmailChanged, status.value.isAdminPasswordChanged) : null
  },
  {
    title: 'GitHub OAuth',
    required: false,
    keys: ['NUXT_OAUTH_GITHUB_CLIENT_ID', 'NUXT_OAUTH_GITHUB_CLIENT_SECRET'],
    link: 'https://github.com/settings/developers',
    linkText: 'GitHub Settings',
    status: status.value ? getStatus(status.value.hasGithubClientId && status.value.hasGithubClientSecret) : null
  },
  {
    title: 'Google OAuth',
    required: false,
    keys: ['NUXT_OAUTH_GOOGLE_CLIENT_ID', 'NUXT_OAUTH_GOOGLE_CLIENT_SECRET'],
    link: 'https://console.cloud.google.com/apis/credentials',
    linkText: 'Google Console',
    status: status.value ? getStatus(status.value.hasGoogleClientId && status.value.hasGoogleClientSecret) : null
  },
  {
    title: 'Google Analytics',
    required: false,
    keys: ['NUXT_PUBLIC_SCRIPTS_GOOGLE_ANALYTICS_ID'],
    link: 'https://analytics.google.com/',
    linkText: 'Analytics Console',
    status: status.value ? getStatus(status.value.hasGoogleAnalyticsId) : null
  },
  {
    title: 'Google Tag Manager',
    required: false,
    keys: ['NUXT_PUBLIC_SCRIPTS_GOOGLE_TAG_MANAGER_ID'],
    link: 'https://tagmanager.google.com/',
    linkText: 'GTM Dashboard',
    status: status.value ? getStatus(status.value.hasGoogleTagManagerId) : null
  },
  {
    title: 'Resend Mail',
    required: false,
    keys: ['NUXT_EMAIL_FROM', 'NUXT_RESEND_API_KEY'],
    link: 'https://resend.com/api-keys',
    linkText: 'Resend Keys',
    status: status.value ? getStatus(status.value.hasEmailFrom && status.value.hasResendApiKey) : null
  }
]);

function getStatus(isConfigured: boolean) {
  return { 
    color: (isConfigured ? 'primary' : 'error') as BadgeColor, 
    text: isConfigured ? 'Enabled' : 'Missing' 
  };
}

function getSessionStatus(isValid: boolean, hasValue: boolean) {
  if (!hasValue) return { color: 'error' as BadgeColor, text: 'Missing' };
  return { 
    color: (isValid ? 'primary' : 'warning') as BadgeColor, 
    text: isValid ? 'Secure' : 'Too Short' 
  };
}

function getAdminStatus(emailChanged: boolean, passChanged: boolean) {
  const isSecure = emailChanged && passChanged;
  return {
    color: (isSecure ? 'primary' : 'warning') as BadgeColor,
    text: isSecure ? 'Secure' : 'Default Credentials'
  };
}
</script>

<template>
  <div class="h-screen overflow-y-auto bg-gray-50 dark:bg-gray-900 font-sans text-gray-900 dark:text-gray-100">
    <div class="max-w-6xl mx-auto p-6 md:p-12 pb-48 space-y-10">
      
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            System Environment Settings
          </h1>
          <p class="text-sm font-medium mt-1 flex items-center gap-2 text-amber-600 dark:text-amber-400">
            <UIcon name="i-heroicons-information-circle" class="w-4 h-4" />
            <span>This page is read-only. Add the necessary environment variables.</span>
          </p>
        </div>
        <UButton icon="i-heroicons-arrow-path" color="primary" variant="soft" :loading="pending" @click="refresh()" size="md">
          Refresh Status
        </UButton>
      </div>

      <div v-if="status" class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AdminEnvStatusCard 
          v-for="item in config" 
          :key="item.title"
          v-bind="item"
        />
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <USkeleton class="h-40 w-full rounded-xl" v-for="i in 4" :key="i" />
      </div>
    </div>
  </div>
</template>