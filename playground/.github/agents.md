# Agent Discovery Guide

## 📁 System Entry Points
1. **Schema SSOT:** `server/db/schema/*.ts`. Every export here is a dynamic REST resource.
2. **Module Entry:** `nuxt-auto-crud` is the primary dependency.
3. **Deployment URL:** [https://auto-crud.clifland.in/](https://auto-crud.clifland.in/)

## 🛠️ Tooling Expectations
- **Introspection:** Before calling `/api/_nac/[resource]`, you MUST read the corresponding schema file.
- **Protocol:** Follow the query syntax in `protocol.md`.
- **Validation:** Rely on `drizzle-zod` for payload structures.