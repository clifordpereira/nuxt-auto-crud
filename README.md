## Nuxt Auto CRUD (nac 2.0)

**Nuxt Auto CRUD** provides **Dynamic RESTful CRUD Endpoints** from Drizzle schemas. No need to write/**generate** extra code for CRUD operations.

---

### 🚀 Core Features

* **Dynamic RESTful CRUD endpoints**: Automatically maps `GET|POST|PATCH|DELETE` to your Drizzle tables.
* **Zero-Codegen**: No files are generated extra for new tables or schemas, preventing code bloat. Your Drizzle schema acts as the Single Source of Truth (SSOT) to power all endpoints automatically.
* **Real-time Sync**: Built-in SSE broadcasting for `create`, `update`, and `delete` events.
* **Agentic Compatibility**: Built with an MCP-friendly structure to allow AI Agents to interact directly with the schema-driven API.

---

### 🌐 Dynamic RESTful CRUD endpoints

Nb: Endpoints follow the pattern `/api/_nac/:model`.

| Method | Endpoint | Action |
| --- | --- | --- |
| **GET** | `/:model` | List records (supports filtering & pagination) |
| **POST** | `/:model` | Create record with Zod validation |
| **GET** | `/:model/:id` | Fetch single record |
| **PATCH** | `/:model/:id` | Partial update with validation |
| **DELETE** | `/:model/:id` | Hard delete |

**Example (`users` table):** 

| Action | HTTP Method | Endpoint | Example Result |
| --- | --- | --- | --- |
| **Fetch All** | `GET` | `/api/_nac/users` | List of all users (paginated) |
| **Create** | `POST` | `/api/_nac/users` | New user record added |
| **Fetch One** | `GET` | `/api/_nac/users/1` | Details of user with `id: 1` |
| **Update** | `PATCH` | `/api/_nac/users/1` | Partial update to user `1` |
| **Delete** | `DELETE` | `/api/_nac/users/1` | User `1` hard deleted from DB |


---
### 🤖 Discovery & AI Endpoints

Enable UIs and AI Agents to resolve data structures dynamically.

| Endpoint | Purpose |
| --- | --- |
| `GET /_schema` | Returns full Drizzle-Zod schemas for all models |
| `GET /_schema/:table` | Returns validation rules for a specific table |
| `GET /_relations` | Exposes foreign key constraints and mappings |
| `GET /_meta` | Consolidated MCP-optimized discovery manifest |

Eg: http://localhost:3000/api/_nac/_schema/users

---
## ⚠️ Limitations
**Database Support:** Currently tested and optimized for SQLite/libSQL only.

---

## Installation
It is highly recommended to use the [Template](https://auto-crud.clifland.in/docs/auto-crud) for new installations.

If you are adding it to an existing application, refer to the [Manual Installation](https://auto-crud.clifland.in/docs/manual-installation/pre-requisites) guide.

[YouTube Walkthrough](https://www.youtube.com/watch?v=_o0cddJUU50&list=PLnbvxcojhIixqM1J08Tnm7vmMdx2wsy4B)

[NPM Package](https://www.npmjs.com/package/nuxt-auto-crud)

[Creator: Clifland](https://www.clifland.in/)