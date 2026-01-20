# Nuxt Auto CRUD Template

**The Nuxt Auto CRUD Template is the production-ready Nuxt 4 + Nuxt UI 4 implementation of nuxt-auto-crud.** It serves as the blueprint for creating specialized apps with zero-rebuild core logic.

| Component | Technology Stack |
| :--- | :--- |
| **UI Framework** | Nuxt UI 4 (Tailwind 4) |
| **Core Engine** | `nuxt-auto-crud` |
| **Auth** | `nuxt-auth-utils` (Session-based) |
| **Authorization** | `nuxt-authorization` (RBAC) |

## Features
* **Automatic CRUD**: Fully dynamic logic without code generation.
* **Dynamic Forms & Tables**: Built-in search, pagination, and validation.
* **Relation Handling**: Seamlessly manage database relationships.
* **Admin Dashboard**: Centralized management interface.
* **Auth Ready**: Integrated Social Login and Password Reset.

## Seeding
* Seeding is triggered upon the first login of `NUXT_ADMIN_EMAIL` (defaults to `admin@example.com`).

## Demo Credentials
Default users initialized during the first-run seed (Password: `$1Password`):

| Role | Email | Permissions |
| :--- | :--- | :--- |
| **Admin** | `admin@example.com` | Full System Access |
| **Manager** | `manager@example.com` | Global CRUD |
| **Customer** | `customer@example.com` | Resource Ownership Only |

## 🛠 Development Workflow
1.  **Define Schema**: Add your Drizzle table in `server/db/schema/`.
2.  **Generate**: Run `bun db:generate` to migrate the tables (schemas).
3.  **Roles**: (Optional) Configure `rolesToSeed` in `app.config.ts`.
4.  **Permissions**: (Optional) Configure necessary permissions for the resources (tables) in **Admin Dashboard -> Resource Permissions**.

## 🤖 Agentic Ready
This project is optimized for Agentic Workflows using the **Model Context Protocol (MCP)**. It provides structured intelligence to AI agents, allowing them to build, explore, and interact with the application seamlessly.

### Core MCP Servers (Standard)
1.  **`nac-schema-inspector` (Discovery)**: Performs introspection on the runtime engine. Use it to fetch the `/api/_meta` manifest and understand the dynamic schema without reading source files.
2.  **`nuxt` (Framework Intelligence)**: Provides deep context on Nuxt 4 patterns, auto-imports, and directory structures. Essential for framework-native refactoring.
3.  **`nuxt-ui` (Design Logic)**: Real-time documentation for Nuxt UI 4 components. Used by agents to generate premium, `U-` prefixed interfaces consistent with this template.

### Protocol for Agents:
1. **Introspection**: Use `nac-schema-inspector` on `/api/_meta?format=md` to map available pluralized endpoints and data structures.
2. **Standard Implementation**: Leverage `nuxt` and `nuxt-ui` servers to ensure code matches the Nuxt 4 + Tailwind 4 architectural standards.


## Quick Install
```bash
npx nuxi init -t gh:clifordpereira/nuxt-auto-crud_template <project-name>
bun db:generate
bun dev
```

For installing `nuxt-auto-crud` into an existing app, please see [Manual Installation](https://auto-crud.clifland.in/docs/manual-installation).

---
## 🔗 Project Links
- [Documentation](https://auto-crud.clifland.in/docs/auto-crud)
- [YouTube Walkthrough](https://www.youtube.com/watch?v=_o0cddJUU50&list=PLnbvxcojhIixqM1J08Tnm7vmMdx2wsy4B)
- [Core Engine Repo](https://github.com/clifordpereira/nuxt-auto-crud)
- [Creator](https://www.clifland.in/)