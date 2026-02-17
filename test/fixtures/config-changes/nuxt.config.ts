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
    realtime: true, // set this if wanted to enable realtime updates
    auth: {
      authentication: true,
      authorization: true,
      ownerKey: 'createdBy', // one may change it only if they want a different field like 'ownerId' as ownerKey
    },
    // when these are emtpy or not set, system defaults will apply
    apiHiddenFields: ['password'], // fields like password, token etc that should never be disclosed
    formHiddenFields: [], // user need not want to create/edit system generating fields and apiHiddenFields
    // these fields are to be exposed to the public 
    // this is applicable only if authentication is enabled and user not logged in
    publicResources: {
      users: ['id', 'name', 'email'],
    },
    agenticToken: '', // (should be set in .env) set this if and only if wanted to allow _meta api for agents
    schemaPath: 'server/db/schema', // change this only if there is a change in schema path
    nacEndpointPrefix: '/api/_nac', // In case if the module author changes this
  }
})
