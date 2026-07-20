import { vi } from 'vitest'

export const useRuntimeConfig = vi.fn(() => ({
  hub: {
    db: 'sqlite',
  },
  autoCrud: {
    statusFiltering: false,
    apiWriteProtectedFields: ['id', 'createdAt', 'updatedAt', 'deletedAt', 'createdBy', 'updatedBy'],
    auth: { authentication: false, authorization: false, ownerKey: 'createdBy' },
    apiHiddenFields: ['deletedAt'],
  },
  public: {
    autoCrud: {
      formHiddenFields: ['createdAt', 'updatedAt'],
      formReadOnlyFields: ['title'],
      nacEndpointPrefix: '/api/_nac',
      apiBase: '/api/_nac',
    },
  },
}))
