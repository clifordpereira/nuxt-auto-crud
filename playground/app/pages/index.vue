<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

const { isNotificationsSlideoverOpen } = useDashboard()

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

const items = [[{
  label: 'New user',
  icon: 'i-lucide-user-plus',
  to: '/resource/users'
}, {
  label: 'New customer',
  icon: 'i-lucide-users',
  to: '/resource/customers'
}, {
  label: 'New product',
  icon: 'i-lucide-package',
  to: '/resource/products'
}]] satisfies DropdownMenuItem[][]

const { data: users } = await useFetch('/api/users')
const { data: customers } = await useFetch('/api/customers')
const { data: products } = await useFetch('/api/products')

const usersCount = computed(() => users.value?.length || 0)
const customersCount = computed(() => customers.value?.length || 0)
const productsCount = computed(() => products.value?.length || 0)
</script>

<template>
  <UDashboardPanel id="home">
    <template #header>
      <UDashboardNavbar
        title="Home"
        :ui="{ right: 'gap-3' }"
      >
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UTooltip
            text="Notifications"
            :shortcuts="['N']"
          >
            <UButton
              color="neutral"
              variant="ghost"
              square
              @click="isNotificationsSlideoverOpen = true"
            >
              <UChip
                color="error"
                inset
              >
                <UIcon
                  name="i-lucide-bell"
                  class="size-5 shrink-0"
                />
              </UChip>
            </UButton>
          </UTooltip>

          <UDropdownMenu :items="items">
            <UButton
              icon="i-lucide-plus"
              size="md"
              class="rounded-full"
            />
          </UDropdownMenu>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <HomeStats
        :users-count="usersCount"
        :customers-count="customersCount"
        :products-count="productsCount"
      />
      <HomeUsers />
    </template>
  </UDashboardPanel>
</template>
