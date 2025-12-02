export const useResourceSchemas = () => {
  const schemas: Record<string, { resource: string; fields: { name: string; type: string; required?: boolean; selectOptions?: string[] }[] }> = {
    users: {
      resource: 'users',
      fields: [
        { name: 'id', type: 'number' },
        { name: 'email', type: 'string', required: true },
        { name: 'password', type: 'string', required: true },
        { name: 'name', type: 'string' },
        { name: 'avatar', type: 'string' },
        { name: 'role', type: 'string' },
        { name: 'created_at', type: 'date' },
        { name: 'updated_at', type: 'date' }
      ]
    },
    customers: {
      resource: 'customers',
      fields: [
        { name: 'id', type: 'number' },
        { name: 'name', type: 'string', required: true },
        { name: 'email', type: 'string', required: true },
        { name: 'avatar', type: 'string' },
        { name: 'status', type: 'string', required: true },
        { name: 'location', type: 'string' }
      ]
    },
    products: {
      resource: 'products',
      fields: [
        { name: 'id', type: 'number' },
        { name: 'name', type: 'string', required: true },
        { name: 'price', type: 'number', required: true },
        { name: 'status', type: 'string', required: true },
        { name: 'inventory', type: 'number', required: true },
        { name: 'image', type: 'string' }
      ]
    },
    orders: {
      resource: 'orders',
      fields: [
        { name: 'id', type: 'number' },
        { name: 'customer_id', type: 'number', required: true },
        { name: 'product_id', type: 'number', required: true },
        { name: 'quantity', type: 'number', required: true },
        { name: 'total', type: 'number', required: true },
        {
          name: 'status',
          type: 'enum',
          required: true,
          selectOptions: ['pending', 'completed', 'cancelled']
        },
        { name: 'created_at', type: 'date' }
      ]
    }
  }

  const getSchema = (resource: string) => schemas[resource]

  return {
    schemas,
    getSchema
  }
}
