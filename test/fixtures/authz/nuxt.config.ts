import MyModule from '../../../src/module'
import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  modules: ['@nuxthub/core', MyModule],
  future: {
    compatibilityVersion: 4,
  },
  compatibilityDate: '2026-01-26',
  autoCrud: {
    auth: {
      authentication: true,
      authorization: true,
      ownerKey: 'createdBy', // it successfuly identifies different ownerKey field like 'ownerId'
    },
    apiHiddenFields: ['password'], // it filter out apiHiddenFields from the response
    formHiddenFields: [], // 
    // it successfully returns allColumns union publicResources - apiHiddenFields
    publicResources: {
      users: ['id', 'name', 'email'],
    },
    agenticToken: '', // it correctly captures the token from .env
  }
})
