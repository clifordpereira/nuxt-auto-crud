import { vi } from 'vitest'

export const useRuntimeConfig = vi.fn(() => ({
  autoCrud: {
    apiHiddenFields: ['deletedAt'],
    auth: { ownerKey: 'createdBy' },
  },
  public: {
    autoCrud: {
      formHiddenFields: ['id', 'createdAt', 'updatedAt'],
      endpointPrefix: '/api/_nac'
    }
  }
}))
