import { vi } from 'vitest'

export const useRuntimeConfig = vi.fn(() => ({
  autoCrud: {
    statusFiltering: false,
    auth: {
      authorization: false,
      ownerKey: 'createdBy',
    },
    apiHiddenFields: ['deletedAt'],
  },
  public: {
    autoCrud: {
      formHiddenFields: ['id', 'createdAt', 'updatedAt'],
      nacEndpointPrefix: '/api/_nac',
    },
  },
}))
