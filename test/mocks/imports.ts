import { vi } from 'vitest'

export const useRuntimeConfig = vi.fn(() => ({
  hub: {
    db: 'sqlite',
  },
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
      formReadOnlyFields: ['title'],
      nacEndpointPrefix: '/api/_nac',
    },
  },
}))
