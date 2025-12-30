<template>
  <div class="h-screen flex items-center justify-center px-4 relative overflow-hidden bg-white dark:bg-black">
    <StarsBg />

    <div class="absolute inset-0 bg-linear-to-b from-primary-500/10 via-transparent to-transparent pointer-events-none" />

    <UButton
      icon="i-lucide-chevron-left"
      to="/"
      size="xl"
      color="neutral"
      variant="subtle"
      class="absolute left-8 top-8 rounded-full z-10"
    />

    <UPageCard
      variant="subtle"
      class="max-w-sm w-full relative z-10 backdrop-blur-sm bg-white/80 dark:bg-black/80"
    >
      <slot />
    </UPageCard>
  </div>
</template>
