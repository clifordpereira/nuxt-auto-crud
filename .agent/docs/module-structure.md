---
title: nuxt-auto-crud Module Structure
description: File structure of nuxt-auto-crud module (for testing purposes).
---

# File structure of nuxt-auto-crud module (for testing purposes):
src
- runtime
  - composables
    - useAutoCrudSSE.ts
    - useRelationDisplay.ts
    - useResourceSchemas.ts
  - server
    - api
      - _schema
        - [table].get.ts
        - index.get.ts
      - [model]
        - [id].delete.ts
        - [id].get.ts
        - [id].patch.ts
        - index.get.ts
        - index.post.ts
      - _meta.get.ts
      - _relations.get.ts
      - sse.ts
    - utils
      - config.ts
      - constants.ts
      - handler.ts
      - modelMapper.ts
      - schema.ts
      - sse-bus.ts
 

