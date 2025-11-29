<script setup lang="ts">
definePageMeta({
  layout: 'default'
})

const { data: products } = await useFetch('/api/products')

const columns = [{
  key: 'image',
  label: 'Image'
}, {
  key: 'name',
  label: 'Name'
}, {
  key: 'price',
  label: 'Price'
}, {
  key: 'status',
  label: 'Status'
}]
</script>

<template>
  <div>
    <div class="mb-8">
      <h2 class="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
        Our Products
      </h2>
      <p class="mt-2 text-gray-600 dark:text-gray-400">
        Browse our collection of high-quality items.
      </p>
    </div>

    <div v-if="products?.length" class="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
      <div v-for="product in products" :key="product.id" class="group relative">
        <div class="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-lg bg-gray-200 xl:aspect-h-8 xl:aspect-w-7">
          <img 
            :src="product.image || 'https://placehold.co/300x300?text=No+Image'" 
            :alt="product.name" 
            class="h-full w-full object-cover object-center group-hover:opacity-75"
          >
        </div>
        <h3 class="mt-4 text-sm text-gray-700 dark:text-gray-200">
          {{ product.name }}
        </h3>
        <p class="mt-1 text-lg font-medium text-gray-900 dark:text-white">
          ${{ product.price }}
        </p>
        <UBadge :color="product.status === 'active' ? 'green' : 'gray'" variant="subtle" class="mt-2">
          {{ product.status }}
        </UBadge>
      </div>
    </div>

    <div v-else class="text-center py-12">
      <p class="text-gray-500 dark:text-gray-400">No products found.</p>
    </div>
  </div>
</template>
