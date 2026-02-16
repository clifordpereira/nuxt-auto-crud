import { defineNuxtConfig } from 'nuxt/config'
import MyModule from '../../../src/module'

export default defineNuxtConfig({
  modules: [
    '@nuxthub/core',
    MyModule,
  ],
  future: {
    compatibilityVersion: 4,
  },
  compatibilityDate: '2026-01-26',
  autoCrud: {
    schemaPath: 'server/db/schema',
    auth: {
      authentication: true,
      authorization: true,
      ownerKey: 'createdBy',
    },
    apiHiddenFields: ['password'],
    agenticToken: 'test-token',
    endpointPrefix: '/api/_nac',
    resources: {
      users: ['id', 'name', 'email'],
    },
    formHiddenFields: ['password'],
    dataTableHiddenFields: ['password'],
    realtime: true,
  }
})
