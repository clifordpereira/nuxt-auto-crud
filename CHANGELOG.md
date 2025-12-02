## v1.5.0

[compare changes](https://github.com/clifordpereira/nuxt-auto-crud/compare/v1.4.0...v1.5.0)

### 🚀 Enhancements

- Introduce explicit authentication and authorization options with `auth: false` default and update playground names ([4f25249](https://github.com/clifordpereira/nuxt-auto-crud/commit/4f25249))

### 🎨 Styles

- Adjust `else` block formatting, remove blank line, and reorder Nuxt runtime configuration. ([654ec15](https://github.com/clifordpereira/nuxt-auto-crud/commit/654ec15))

### ❤️ Contributors

- Cliford Pereira ([@clifordpereira](https://github.com/clifordpereira))

## v1.4.0

[compare changes](https://github.com/clifordpereira/nuxt-auto-crud/compare/v1.3.0...v1.4.0)

### 🚀 Enhancements

- Implement hidden field filtering to prevent sensitive data exposure in API responses across all CRUD endpoints. ([d8a40d5](https://github.com/clifordpereira/nuxt-auto-crud/commit/d8a40d5))
- Add SQLite database and its type definitions. ([4a0e792](https://github.com/clifordpereira/nuxt-auto-crud/commit/4a0e792))
- Establish Drizzle ORM, database schema, and initial API tests for CRUD fixture. ([33f7934](https://github.com/clifordpereira/nuxt-auto-crud/commit/33f7934))
- Add resource-specific public access control and column filtering for API endpoints. ([0eacd3c](https://github.com/clifordpereira/nuxt-auto-crud/commit/0eacd3c))
- Add user resource configuration with public actions and columns ([6d8b36a](https://github.com/clifordpereira/nuxt-auto-crud/commit/6d8b36a))
- Add JWT authentication support and external module configuration ([bdc7d17](https://github.com/clifordpereira/nuxt-auto-crud/commit/bdc7d17))
- Add a new playground dashboard demonstrating nuxt-auto-crud, Nuxt UI, NuxtHub, and authentication, alongside an update to the core module. ([c3d8933](https://github.com/clifordpereira/nuxt-auto-crud/commit/c3d8933))
- Implement role-based authorization in the playground using `nuxt-authorization` and define abilities. ([a8a4948](https://github.com/clifordpereira/nuxt-auto-crud/commit/a8a4948))
- Add user roles, authentication types, and logout functionality, while updating database schema and removing unused tables. ([a922057](https://github.com/clifordpereira/nuxt-auto-crud/commit/a922057))
- Redesign login page with new branding and layout, update default layout's header, and implement full page reloads for authentication actions. ([42714f9](https://github.com/clifordpereira/nuxt-auto-crud/commit/42714f9))
- Add JWT authentication and authorization test fixture, refactor JWT tests, and update login page description and README. ([0889bef](https://github.com/clifordpereira/nuxt-auto-crud/commit/0889bef))
- Enhance API testing with dedicated Vitest configurations and conditional execution, disable backend playground authentication, improve JWT validation, and refine TypeScript exclusions. ([15f96e4](https://github.com/clifordpereira/nuxt-auto-crud/commit/15f96e4))

### 💅 Refactors

- Reimplement dashboard overview to focus on users, customers, and products, removing charting, inbox, and detailed settings pages. ([cffa200](https://github.com/clifordpereira/nuxt-auto-crud/commit/cffa200))
- Update and streamline dashboard and user menu navigation by adjusting links and removing unused items. ([4767143](https://github.com/clifordpereira/nuxt-auto-crud/commit/4767143))
- Rename playground-dashboard to playground-fullstack and migrate all associated files. ([be8879f](https://github.com/clifordpereira/nuxt-auto-crud/commit/be8879f))
- Centralize type definitions, introduce a users page, and remove deprecated API endpoints and UI components. ([b10cde8](https://github.com/clifordpereira/nuxt-auto-crud/commit/b10cde8))
- Centralize authentication and authorization logic into a new `auth.ts` utility for all CRUD endpoints. ([7b0ec14](https://github.com/clifordpereira/nuxt-auto-crud/commit/7b0ec14))
- Relocate Drizzle ORM utility imports and remove an empty line in API tests. ([accd675](https://github.com/clifordpereira/nuxt-auto-crud/commit/accd675))

### 📖 Documentation

- Add custom SQLite setup guide and update README to reference it. ([351aad6](https://github.com/clifordpereira/nuxt-auto-crud/commit/351aad6))
- Update testing and installation instructions, and clarify configuration requirements. ([f6a22ea](https://github.com/clifordpereira/nuxt-auto-crud/commit/f6a22ea))

### 🏡 Chore

- Update project dependencies for playground backend and fullstack projects. ([6eeabc0](https://github.com/clifordpereira/nuxt-auto-crud/commit/6eeabc0))
- Install project dependencies for playground environments. ([b162687](https://github.com/clifordpereira/nuxt-auto-crud/commit/b162687))
- Remove explicit `autoCrud.auth.enabled` configuration. ([cf0b3d4](https://github.com/clifordpereira/nuxt-auto-crud/commit/cf0b3d4))
- Remove fullstack playground and update dashboard schema. ([04f7d24](https://github.com/clifordpereira/nuxt-auto-crud/commit/04f7d24))
- Apply code style and import fixes, and update Nuxt compatibility settings. ([c467438](https://github.com/clifordpereira/nuxt-auto-crud/commit/c467438))

### ✅ Tests

- Add API tests for CRUD endpoints and update module logic. ([f4f4e71](https://github.com/clifordpereira/nuxt-auto-crud/commit/f4f4e71))

### ❤️ Contributors

- Cliford Pereira ([@clifordpereira](https://github.com/clifordpereira))

## v1.3.0

[compare changes](https://github.com/clifordpereira/nuxt-auto-crud/compare/v1.2.2...v1.3.0)

### 🚀 Enhancements

- Enhance documentation with a comprehensive installation guide, Drizzle setup, and rename project references to 'Nuxt Auto CRUD'. ([b486fb2](https://github.com/clifordpereira/nuxt-auto-crud/commit/b486fb2))

### 🩹 Fixes

- Resolve useDrizzle runtime error by using #site/drizzle alias ([518e9cf](https://github.com/clifordpereira/nuxt-auto-crud/commit/518e9cf))

### 🏡 Chore

- **release:** V1.2.2 ([2511e7c](https://github.com/clifordpereira/nuxt-auto-crud/commit/2511e7c))

### ❤️ Contributors

- Cliford Pereira ([@clifordpereira](https://github.com/clifordpereira))

## v1.2.2

[compare changes](https://github.com/clifordpereira/nuxt-auto-crud/compare/v1.2.1...v1.2.2)

### 🩹 Fixes

- Resolve useDrizzle runtime error by using #site/drizzle alias ([518e9cf](https://github.com/clifordpereira/nuxt-auto-crud/commit/518e9cf))

### ❤️ Contributors

- Cliford Pereira ([@clifordpereira](https://github.com/clifordpereira))

## v1.2.1

[compare changes](https://github.com/clifordpereira/nuxt-auto-crud/compare/v1.2.0...v1.2.1)

## v1.2.0

[compare changes](https://github.com/clifordpereira/nuxt-auto-crud/compare/v1.1.1...v1.2.0)

### 🚀 Enhancements

- Integrate model mapping utilities and `useDrizzle` type declaration into CRUD API endpoints, and update `getTableForModel` return type. ([11f8ec3](https://github.com/clifordpereira/nuxt-auto-crud/commit/11f8ec3))
- Introduce `ModuleDatabase` type and apply it to `useDrizzle` in API handlers. ([4455779](https://github.com/clifordpereira/nuxt-auto-crud/commit/4455779))

### 🩹 Fixes

- Add explicit imports for h3 and drizzle-orm in server handlers ([489bbec](https://github.com/clifordpereira/nuxt-auto-crud/commit/489bbec))

### 💅 Refactors

- Improve type safety by introducing `TableWithId` type and refining `getTableForModel` return types. ([68fa4ac](https://github.com/clifordpereira/nuxt-auto-crud/commit/68fa4ac))

### 🏡 Chore

- **release:** V1.1.1 ([95cc611](https://github.com/clifordpereira/nuxt-auto-crud/commit/95cc611))

### ❤️ Contributors

- Cliford Pereira ([@clifordpereira](https://github.com/clifordpereira))

## v1.1.1

[compare changes](https://github.com/clifordpereira/nuxt-auto-crud/compare/v1.1.0...v1.1.1)

### 💅 Refactors

- Remove `.ts` extension from server handler file paths. ([17328b5](https://github.com/clifordpereira/nuxt-auto-crud/commit/17328b5))

### 🏡 Chore

- **release:** V1.1.0 ([394f71d](https://github.com/clifordpereira/nuxt-auto-crud/commit/394f71d))

### ❤️ Contributors

- Cliford Pereira ([@clifordpereira](https://github.com/clifordpereira))

## v1.1.0

[compare changes](https://github.com/clifordpereira/nuxt-auto-crud/compare/v1.0.0...v1.1.0)

### 🚀 Enhancements

- Add Drizzle ORM schema for basic users table ([45dfe0a](https://github.com/clifordpereira/nuxt-auto-crud/commit/45dfe0a))

### 🏡 Chore

- Rename project to nuxt-auto-crud and remove bun.lock. ([42ef5f3](https://github.com/clifordpereira/nuxt-auto-crud/commit/42ef5f3))
- Add bun.lock for dependency management and update changelog. ([cf2c297](https://github.com/clifordpereira/nuxt-auto-crud/commit/cf2c297))
- Rename project to nuxt-ghost-api to nuxt-auto-crud and update module configuration key. ([7d440e9](https://github.com/clifordpereira/nuxt-auto-crud/commit/7d440e9))

### 🎨 Styles

- Apply consistent code formatting and style changes across various files. ([e5162d9](https://github.com/clifordpereira/nuxt-auto-crud/commit/e5162d9))

### 🤖 CI

- Remove CI workflow file ([108b512](https://github.com/clifordpereira/nuxt-auto-crud/commit/108b512))

### ❤️ Contributors

- Cliford Pereira ([@clifordpereira](https://github.com/clifordpereira))

## Unreleased

[compare changes](https://github.com/clifordpereira/nuxt-auto-crud/compare/v1.0.0...HEAD)

### 🏡 Chore

- Rename project to nuxt-auto-crud and remove bun.lock. ([42ef5f3](https://github.com/clifordpereira/nuxt-auto-crud/commit/42ef5f3))
- Add bun.lock for dependency management and update changelog. ([cf2c297](https://github.com/clifordpereira/nuxt-auto-crud/commit/cf2c297))

### 🤖 CI

- Remove CI workflow file ([108b512](https://github.com/clifordpereira/nuxt-auto-crud/commit/108b512))

### ❤️ Contributors

- Cliford Pereira ([@clifordpereira](https://github.com/clifordpereira))

## v1.0.0

### 🚀 Enhancements

- Implement auto-generated CRUD API routes and integrate Drizzle ORM for dynamic model handling. ([e7234c9](https://github.com/clifordpereira/nuxt-auto-crud/commit/e7234c9))
- Rename project to nuxt-auto-crud, update package metadata, and refresh dependencies. ([333ae2a](https://github.com/clifordpereira/nuxt-auto-crud/commit/333ae2a))
- Establish a comprehensive playground with Drizzle ORM integration, sample schema, interactive UI, and extensive documentation. ([37b1133](https://github.com/clifordpereira/nuxt-auto-crud/commit/37b1133))
- Add Drizzle ORM utility for D1 database integration. ([cdda468](https://github.com/clifordpereira/nuxt-auto-crud/commit/cdda468))
- Refactor getTableColumns to use Drizzle ORM's getDrizzleTableColumns and add @types/pluralize dependency. ([7b88f8e](https://github.com/clifordpereira/nuxt-auto-crud/commit/7b88f8e))

### 💅 Refactors

- Relocate drizzle utility to playground, update schema import path, and add User type export. ([191c02b](https://github.com/clifordpereira/nuxt-auto-crud/commit/191c02b))
- Use Drizzle ORM's getTableColumns helper and add error handling in getTableColumns utility. ([0fa0abb](https://github.com/clifordpereira/nuxt-auto-crud/commit/0fa0abb))

### 🏡 Chore

- Update package metadata and remove unused plugin and fix summary documentation. ([7ea2847](https://github.com/clifordpereira/nuxt-auto-crud/commit/7ea2847))

### ❤️ Contributors

- Cliford Pereira ([@clifordpereira](https://github.com/clifordpereira))
