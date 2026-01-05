<script setup lang="ts">
const isLoaded = ref(false)
</script>

<template>
  <div class="relative">
    <UPageCard
      variant="subtle"
      class="rounded-2xl"
      :ui="{ body: '!p-0' }"
    >
      <div
        v-if="!isLoaded"
        class="relative cursor-pointer group w-full h-[400px] bg-gray-100 dark:bg-gray-800"
        @click="isLoaded = true"
      >
        <NuxtImg
          src="https://img.youtube.com/vi/W0ju4grRC9M/maxresdefault.jpg"
          alt="Promotional Video"
          class="w-full h-full object-cover rounded-xl"
          loading="lazy"
        />
        <div class="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/20 transition-colors rounded-xl">
          <UIcon
            name="i-heroicons-play-circle-20-solid"
            class="w-20 h-20 text-white drop-shadow-lg"
          />
        </div>
      </div>
      <iframe
        v-else
        width="100%"
        height="400"
        src="https://www.youtube-nocookie.com/embed/W0ju4grRC9M?autoplay=1&mute=1"
        title="YouTube video player"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowfullscreen
        class="rounded-xl"
      />
    </UPageCard>
  </div>
</template>
