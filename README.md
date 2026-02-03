# Nuxt Auto CRUD

**Nuxt Auto CRUD is a headless, zero-codegen CRUD engine that transforms Drizzle ORM schemas into fully functional RESTful APIs for Nuxt 4.** 

| Specification | Details |
| :--- | :--- |
| **Runtime** | Nuxt 4 (`app/` directory), Nitro |
| **Persistence** | SQLite / libSQL (Optimized for Cloudflare D1) |
| **ORM & SSOT** | Drizzle ORM (Schema-driven) |
| **Validation** | `drizzle-zod` (Dynamic derivation) |

## 🛠 Architectural Logic: Zero-Codegen
NAC treats your Drizzle schema as the **Single Source of Truth (SSOT)**. Unlike traditional scaffolds, it does not generate physical files; it mounts dynamic Nitro handlers at runtime.

* **Dynamic Routing**: Automatically maps `GET|POST|PATCH|DELETE` to your Drizzle tables.
* **Real-time Sync**: Built-in SSE broadcasting for `create`, `update`, and `delete` events.
* **Agentic Compatibility**: Built with an MCP-friendly structure to allow AI Agents to interact directly with the schema-driven API.

## 🔐 RBAC & Permissions
Integrates with `nuxt-authorization` for database-driven Role-Based Access Control.
* **Ownership Logic**: Supports `update_own` and `delete_own` via `createdBy` column reflection.
* **Granular Scopes**: Fine-grained control over `list` vs `list_all` (drafts/soft-deleted).

## 🌐 Endpoints
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/_nac/:model` | List with filtering/paging |
| `POST` | `/api/_nac/:model` | Validated creation |
| `GET` | `/api/_nac/:model/:id` | Single record retrieval |
| `PATCH` | `/api/_nac/:model/:id` | Partial validated update |
| `DELETE` | `/api/_nac/:model/:id` | Soft/Hard deletion |

---

## Installation
It is highly recommended to use the [Template](https://auto-crud.clifland.in/docs/auto-crud) for new installations.

If you are adding it to an existing application, refer to the [Manual Installation](https://auto-crud.clifland.in/docs/manual-installation) guide.

[YouTube Walkthrough](https://www.youtube.com/watch?v=_o0cddJUU50&list=PLnbvxcojhIixqM1J08Tnm7vmMdx2wsy4B)

[NPM Package](https://www.npmjs.com/package/nuxt-auto-crud)

[Creator: Clifland](https://www.clifland.in/)