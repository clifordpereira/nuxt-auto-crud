<script setup lang="ts">
interface Testimonial {
  id: number
  name: string
  role: string
  company: string | null
  content: string
  avatar: string | null
  status: string
}

const { data: testimonials } = await useFetch<Testimonial[]>('/api/testimonials', {
  default: () => []
})
</script>

<template>
  <div class="space-y-8">
    <UPageColumns class="xl:columns-3">
      <UPageCard
        v-for="(testimonial, index) in testimonials"
        :key="index"
        variant="subtle"
        :description="testimonial.content"
        :ui="{ description: 'before:content-[open-quote] after:content-[close-quote]' }"
      >
        <template #footer>
          <UUser
            :name="testimonial.name"
            :description="testimonial.role + (testimonial.company ? ' at ' + testimonial.company : '')"
            :avatar="testimonial.avatar ? { src: testimonial.avatar } : undefined"
            size="lg"
          />
        </template>
      </UPageCard>
    </UPageColumns>

    <div class="flex justify-center">
      <CrudCreateRow
        resource="testimonials"
        :schema="{
          resource: 'testimonials',
          fields: [
            { name: 'name', type: 'text', required: true },
            { name: 'role', type: 'text', required: true },
            { name: 'company', type: 'text', required: false },
            { name: 'avatar', type: 'text', required: false },
            { name: 'content', type: 'textarea', required: true }
          ]
        }"
      />
    </div>
  </div>
</template>
