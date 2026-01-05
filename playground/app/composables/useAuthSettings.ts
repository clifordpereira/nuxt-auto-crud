// composables/useAuthSettings.ts
export const useAuthSettings = () => {
  const { data: settings, pending } = useFetch("/api/settings-status", {
    key: "admin-env-check",
    cache: "no-cache",
  });

  const isGitHubLoginEnabled = computed(() => {
    return (
      settings.value?.hasGithubClientId && settings.value?.hasGithubClientSecret
    );
  });

  const isGoogleLoginEnabled = computed(() => {
    return (
      settings.value?.hasGoogleClientId && settings.value?.hasGoogleClientSecret
    );
  });

  const isPasswordResetEnabled = computed(() => {
    return settings.value?.hasEmailFrom && settings.value?.hasResendApiKey;
  });

  // OAuth providers configuration
  const allProviders = [
    {
      label: "Google",
      icon: "i-simple-icons-google",
      onClick: () => {
        window.location.href = "/auth/google";
      },
      enabled: isGoogleLoginEnabled,
    },
    {
      label: "GitHub",
      icon: "i-simple-icons-github",
      onClick: () => {
        window.location.href = "/auth/github";
      },
      enabled: isGitHubLoginEnabled,
    },
  ];

  const providers = computed(() => 
    allProviders.filter((p) => p.enabled.value)
  );

  return {
    settings,
    pending,
    isGitHubLoginEnabled,
    isGoogleLoginEnabled,
    isPasswordResetEnabled,
    providers,
  };
};