---
title: Quick Start Workflow
description: Accelerated transition from local Drizzle schema to production Nuxt 4 deployment.
---

> The `nuxt-auto-crud` accelerates MVP development by collapsing the backend into a **Single Source of Truth**. The [Core Engine] automatically exposes RESTful resources defined in Drizzle, while the [Template Implementation] provides the administrative scaffolding.

## 🏁 Accelerated Workflow
The "Zero-Codegen" path represents the highest engineering efficiency for Nuxt developers.

| Step | Action | Logic Layer |
| :--- | :--- | :--- |
| **1. Init** | Execute `nuxi init` with the `auto-crud_template`. | [Template Implementation] |
| **2. Define** | Export Drizzle `sqliteTable` schemas in `server/db/schema`. | [Core Engine] |
| **3. Sync** | Execute `bun db:generate` and `npx nuxi task run db:seed`. | [Core Engine] |
| **4. Auth** | Log in with `NUXT_ADMIN_EMAIL` to trigger initial RBAC. | [Template Implementation] |
| **5. Ship** | Force-push to Cloudflare/NuxtHub and apply remote migration. | [Core Engine] |

## 🛠 Strategic Seeding [Template Implementation]
The `server/tasks/seed.ts` file is your primary bootstrap vector. It handles:
- **Role Creation**: `admin`, `manager`, `customer`.
- **Permission Mapping**: Standard CRUD + Ownership-based scopes.
- **Root User**: Creation of the primary administrative identity.

> **Engineer Note**: Always update the `seed.ts` logic to reflect your application's domain before the first production deployment.

## 🚀 Native Cloud Integration
The stack is natively compatible with **NuxtHub**, providing:
- Zero-config SQLite database.
- Integrated Serverless Blob storage.
- Real-time deployment monitoring.
