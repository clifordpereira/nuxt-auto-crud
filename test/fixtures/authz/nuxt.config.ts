import MyModule from '../../../src/module'
import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  modules: ['@nuxthub/core', MyModule],
  future: {
    compatibilityVersion: 4,
  },
  compatibilityDate: '2026-01-26',
  hub: {
    db: 'sqlite',
  },
  autoCrud: {
    realtime: false,
    auth: {
      authentication: true,
      authorization: true,
      ownerKey: 'ownerId', 
    },
    publicResources: {
      users: ['id', 'name', 'email', 'samoosa'],
    },
    apiHiddenFields: ['password'], 
    agenticToken: '', 
    formHiddenFields: [], 
    nacEndpointPrefix: '/api/_nac',
    schemaPath: 'server/db/schema',
  },
})
