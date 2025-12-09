## v1.13.0

[compare changes](https://github.com/clifordpereira/nuxt-auto-crud/compare/v1.12.1...v1.13.0)

### 🚀 Enhancements

- Implement a comprehensive role-based access control (RBAC) system with new database schemas, migrations, and UI components. ([9fbe34b](https://github.com/clifordpereira/nuxt-auto-crud/commit/9fbe34b))
- Regenerate database migration files and update metadata. ([d0e8303](https://github.com/clifordpereira/nuxt-auto-crud/commit/d0e8303))

### 💅 Refactors

- Update ability alias path to shared utilities ([64c27bd](https://github.com/clifordpereira/nuxt-auto-crud/commit/64c27bd))
- Move `ability.ts` from `server/utils` to `shared/utils/abilities.ts`. ([ffc165f](https://github.com/clifordpereira/nuxt-auto-crud/commit/ffc165f))

### 📖 Documentation

- Remove permissions management documentation ([61826f8](https://github.com/clifordpereira/nuxt-auto-crud/commit/61826f8))

### 🏡 Chore

- Update `@vueuse/core` to version 14.1.0 and adjust related lock file entries. ([b467463](https://github.com/clifordpereira/nuxt-auto-crud/commit/b467463))

### 🎨 Styles

- Apply consistent formatting across various files. ([6fae3d8](https://github.com/clifordpereira/nuxt-auto-crud/commit/6fae3d8))

### ❤️ Contributors

- Cliford Pereira ([@clifordpereira](https://github.com/clifordpereira))

## v1.12.1

[compare changes](https://github.com/clifordpereira/nuxt-auto-crud/compare/v1.12.0...v1.12.1)

### 💅 Refactors

- Replace `import` with `/// <reference>` for `auth.d.ts` type declaration. ([b52f2e3](https://github.com/clifordpereira/nuxt-auto-crud/commit/b52f2e3))

### ❤️ Contributors

- Cliford Pereira ([@clifordpereira](https://github.com/clifordpereira))

## v1.12.0

[compare changes](https://github.com/clifordpereira/nuxt-auto-crud/compare/v1.11.0...v1.12.0)

### 🚀 Enhancements

- Add configurable role-based authorization with client/server resolvers and a user seeding script. ([04f32f7](https://github.com/clifordpereira/nuxt-auto-crud/commit/04f32f7))
- Implement granular authorization checks using a global ability alias and direct permission evaluation. ([8d0b7dd](https://github.com/clifordpereira/nuxt-auto-crud/commit/8d0b7dd))
- Improve API test coverage for CRUD operations and role-based access, and remove blanket admin super-user override from ability definitions. ([5a686b1](https://github.com/clifordpereira/nuxt-auto-crud/commit/5a686b1))
- Add moderator role, expand manager permissions, and relocate the seed plugin to the playground. ([7f2937b](https://github.com/clifordpereira/nuxt-auto-crud/commit/7f2937b))
- Add database seeding for default admin, moderator, manager, and customer users. ([be259cb](https://github.com/clifordpereira/nuxt-auto-crud/commit/be259cb))
- Enable Nitro experimental tasks and remove the database seeding script. ([2469362](https://github.com/clifordpereira/nuxt-auto-crud/commit/2469362))
- Implement logout functionality on the index page and refresh resource schemas after login. ([064c810](https://github.com/clifordpereira/nuxt-auto-crud/commit/064c810))
- Implement user logout and simplify dashboard and resource pages by removing navigation, creation UI, and replacing the dashboard content with a placeholder. ([0e33dd6](https://github.com/clifordpereira/nuxt-auto-crud/commit/0e33dd6))
- Externalize dashboard navigation menus into JSON files and a new `ResourcesMenu` component, and remove cookie consent logic. ([1d7f0c4](https://github.com/clifordpereira/nuxt-auto-crud/commit/1d7f0c4))
- Structure landing page with dedicated components and site metadata, and remove unused session clear function. ([a1a44f1](https://github.com/clifordpereira/nuxt-auto-crud/commit/a1a44f1))
- Integrate `CrudCreateRow` component into `Table.vue` and enhance feature descriptions for authentication, authorization, and dynamic UI. ([757853d](https://github.com/clifordpereira/nuxt-auto-crud/commit/757853d))
- Update playground app for Nuxt 4 compatibility, enhance auth flow, and refine component definitions. ([e4fb913](https://github.com/clifordpereira/nuxt-auto-crud/commit/e4fb913))
- Add nuxt-authorization module to config and define a default ability. ([98b11c6](https://github.com/clifordpereira/nuxt-auto-crud/commit/98b11c6))

### 💅 Refactors

- Centralize authorization and response formatting into new handler utilities and simplify schema type inference. ([4d1f211](https://github.com/clifordpereira/nuxt-auto-crud/commit/4d1f211))
- Consolidate user table migrations into a single initial script. ([609e7bb](https://github.com/clifordpereira/nuxt-auto-crud/commit/609e7bb))
- Reorganize menu configuration files into a `menus` subdirectory and externalize user links. ([67b9304](https://github.com/clifordpereira/nuxt-auto-crud/commit/67b9304))
- Update default navigation and redirects from `/dashboard` to `/resource/users` across components and pages. ([7594ecb](https://github.com/clifordpereira/nuxt-auto-crud/commit/7594ecb))

### 📖 Documentation

- Enhance main README with auth dependency installation, disable auth examples, testing, and known issues; rewrite playground README to detail module-specific features, setup, and authentication. ([f9c2f09](https://github.com/clifordpereira/nuxt-auto-crud/commit/f9c2f09))
- Add instructions for seeding and viewing the database via Nuxt DevTools ([92c9553](https://github.com/clifordpereira/nuxt-auto-crud/commit/92c9553))

### 🎨 Styles

- Adjust trailing commas and apply consistent formatting across files. ([ca409fc](https://github.com/clifordpereira/nuxt-auto-crud/commit/ca409fc))

### ❤️ Contributors

- Cliford Pereira ([@clifordpereira](https://github.com/clifordpereira))

## v1.11.0

[compare changes](https://github.com/clifordpereira/nuxt-auto-crud/compare/v1.10.0...v1.11.0)

### 🚀 Enhancements

- Add `deletedAt` column to user schema and exclude system fields from forms. ([afae3b4](https://github.com/clifordpereira/nuxt-auto-crud/commit/afae3b4))
- Add `deleted_at` column to users table and update database migration scripts. ([4d136f8](https://github.com/clifordpereira/nuxt-auto-crud/commit/4d136f8))
- Add user status column via migration, introduce schema utility fields, and remove unused CMS and organization schemas. ([e2a0eef](https://github.com/clifordpereira/nuxt-auto-crud/commit/e2a0eef))
- Add support for Drizzle enum types by extracting enum values and setting the field type to 'enum'. ([1ba8ac2](https://github.com/clifordpereira/nuxt-auto-crud/commit/1ba8ac2))

### 💅 Refactors

- Remove HomeStats component and its resource data fetching from the dashboard page ([bf73915](https://github.com/clifordpereira/nuxt-auto-crud/commit/bf73915))

### 🏡 Chore

- Remove unused `integer` import from user schema and apply minor formatting fixes. ([f71ac91](https://github.com/clifordpereira/nuxt-auto-crud/commit/f71ac91))

### ❤️ Contributors

- Cliford Pereira ([@clifordpereira](https://github.com/clifordpereira))

## v1.10.0

[compare changes](https://github.com/clifordpereira/nuxt-auto-crud/compare/v1.9.0...v1.10.0)

### 🚀 Enhancements

- Update autoCrud authentication configuration, refine Drizzle schema setup, and enhance schema management documentation. ([16a8154](https://github.com/clifordpereira/nuxt-auto-crud/commit/16a8154))
- Remove unused `ViewRow.vue` component ([d1a3794](https://github.com/clifordpereira/nuxt-auto-crud/commit/d1a3794))
- Move sidebar collapse/expand button from footer to default slot ([a2e6dce](https://github.com/clifordpereira/nuxt-auto-crud/commit/a2e6dce))
- Enhance dynamic Zod schema generation, improve CRUD error handling, and update user menu with theme selection. ([5253fc3](https://github.com/clifordpereira/nuxt-auto-crud/commit/5253fc3))
- Enhance CRUD forms with dynamic Zod schema generation, improved relational field handling, and system field filtering. ([6260e6c](https://github.com/clifordpereira/nuxt-auto-crud/commit/6260e6c))

### 📖 Documentation

- Improve authentication documentation for fullstack/backend apps and add `auth` config example. ([12ce25a](https://github.com/clifordpereira/nuxt-auto-crud/commit/12ce25a))
- Clarify API consumption expectations and add links to a template and detailed documentation. ([307c873](https://github.com/clifordpereira/nuxt-auto-crud/commit/307c873))
- Move and expand external links into a dedicated section in README. ([b3defae](https://github.com/clifordpereira/nuxt-auto-crud/commit/b3defae))
- Add demo link to README for fullstack app usage mode ([4bb5c22](https://github.com/clifordpereira/nuxt-auto-crud/commit/4bb5c22))
- Add demo video link to README ([8684234](https://github.com/clifordpereira/nuxt-auto-crud/commit/8684234))
- Swap positions of project run instructions and the example schema note in README. ([7b5222c](https://github.com/clifordpereira/nuxt-auto-crud/commit/7b5222c))

### ❤️ Contributors

- Cliford Pereira ([@clifordpereira](https://github.com/clifordpereira))

## v1.9.0

[compare changes](https://github.com/clifordpereira/nuxt-auto-crud/compare/v1.8.0...v1.9.0)

### 🚀 Enhancements

- Enable autoCrud authentication and update `@vueuse/nuxt` and `@nuxt/eslint` dependencies. ([d7b3fa4](https://github.com/clifordpereira/nuxt-auto-crud/commit/d7b3fa4))

### 🏡 Chore

- Update `@ts-expect-error` comments for `requireUserSession` imports to clarify `#imports` availability. ([7d751ca](https://github.com/clifordpereira/nuxt-auto-crud/commit/7d751ca))

### ❤️ Contributors

- Cliford Pereira ([@clifordpereira](https://github.com/clifordpereira))

## v1.8.0

[compare changes](https://github.com/clifordpereira/nuxt-auto-crud/compare/v1.7.0...v1.8.0)

### 🚀 Enhancements

- Add `@nuxthub/core` module to basic fixture configuration ([b8dcd5e](https://github.com/clifordpereira/nuxt-auto-crud/commit/b8dcd5e))

### 🩹 Fixes

- Explicitly import `onHubReady` and remove `@ts-expect-error` comment. ([df23f2e](https://github.com/clifordpereira/nuxt-auto-crud/commit/df23f2e))

### 💅 Refactors

- Remove `@nuxthub/core` module and add `onHubReady` utility. ([8e7552c](https://github.com/clifordpereira/nuxt-auto-crud/commit/8e7552c))

### 🏡 Chore

- Update `onHubReady` callback type to `void ([ Promise<void>`](https://github.com/clifordpereira/nuxt-auto-crud/commit/ Promise<void>`))

### 🎨 Styles

- Remove unnecessary empty line ([1d373d4](https://github.com/clifordpereira/nuxt-auto-crud/commit/1d373d4))

### ❤️ Contributors

- C027030 <Cliford Pereira>
- Cliford Pereira ([@clifordpereira](https://github.com/clifordpereira))

## v1.7.0

[compare changes](https://github.com/clifordpereira/nuxt-auto-crud/compare/v1.6.0...v1.7.0)

### 🚀 Enhancements

- Integrate `nuxt-auth-utils` as a module for auto-imports and update test fixtures to mock `onHubReady` and configure session. ([eaf9c43](https://github.com/clifordpereira/nuxt-auto-crud/commit/eaf9c43))

### 💅 Refactors

- Directly import and use `hashPassword` and `requireUserSession` from `nuxt-auth-utils` by removing runtime availability checks. ([cb3bfb2](https://github.com/clifordpereira/nuxt-auto-crud/commit/cb3bfb2))

### 🏡 Chore

- Relax Drizzle ORM peer dependency version constraint to `>=0.30.0`. ([f4d8a72](https://github.com/clifordpereira/nuxt-auto-crud/commit/f4d8a72))

### 🎨 Styles

- Add blank line for improved readability in seed plugin. ([3ae64db](https://github.com/clifordpereira/nuxt-auto-crud/commit/3ae64db))

### ❤️ Contributors

- Cliford Pereira ([@clifordpereira](https://github.com/clifordpereira))

## v1.6.0

[compare changes](https://github.com/clifordpereira/nuxt-auto-crud/compare/v1.5.0...v1.6.0)

### 🚀 Enhancements

- Implement dynamic CRUD for resource management with pages, forms, tables, pagination, and Zod schema. ([cbf27a0](https://github.com/clifordpereira/nuxt-auto-crud/commit/cbf27a0))
- Implement dynamic resource pages and compos ([f0fbf8c](https://github.com/clifordpereira/nuxt-auto-crud/commit/f0fbf8c))
- Implement dashboard page, remove teams menu, and refactor core CRUD components ([52070f3](https://github.com/clifordpereira/nuxt-auto-crud/commit/52070f3))
- Introduce schema and relation introspection APIs, centralize runtime composables and plugins, and enhance API testing with authentication. ([29f67ef](https://github.com/clifordpereira/nuxt-auto-crud/commit/29f67ef))
- Add pluralize and heroicons dependencies, and update @vueuse/integrations. ([62bb642](https://github.com/clifordpereira/nuxt-auto-crud/commit/62bb642))
- Add orders table, drop old tables, and improve relation field handling in CRUD forms. ([a696789](https://github.com/clifordpereira/nuxt-auto-crud/commit/a696789))
- Add user avatar display, refactor login form components, remove HomeUsers, and increase API test timeout. ([068e0a1](https://github.com/clifordpereira/nuxt-auto-crud/commit/068e0a1))
- Add `@iconify-json/lucide` dev dependency and update lockfile with various new development and runtime dependencies. ([a50852a](https://github.com/clifordpereira/nuxt-auto-crud/commit/a50852a))
- Refresh homepage quick links with new icon packages and improved layout. ([9c09254](https://github.com/clifordpereira/nuxt-auto-crud/commit/9c09254))
- Replace sign-in button with LoginModal component. ([742ecfe](https://github.com/clifordpereira/nuxt-auto-crud/commit/742ecfe))
- Add customizable props to LoginModal, integrate it into the default layout, and simplify UserMenu options and logout redirect. ([94b8969](https://github.com/clifordpereira/nuxt-auto-crud/commit/94b8969))
- Enhance ViewRow component with schema-based formatting, relation fetching, and image display, while removing console logs and login status UI. ([507844a](https://github.com/clifordpereira/nuxt-auto-crud/commit/507844a))
- Capitalize table headers, auto-accept cookie consent in development, and refactor dashboard resource fetching using `useAsyncData`. ([1d20e2d](https://github.com/clifordpereira/nuxt-auto-crud/commit/1d20e2d))
- Standardize timestamp field names, automatically manage `updated_at` on PATCH requests, and include cookies when fetching resource schemas. ([c0b2613](https://github.com/clifordpereira/nuxt-auto-crud/commit/c0b2613))
- Introduce users database schema and configure Drizzle to support modular schema definitions. ([16d36ad](https://github.com/clifordpereira/nuxt-auto-crud/commit/16d36ad))
- Implement CMS article schema and order GET API results by ID in descending order. ([9cdb9f0](https://github.com/clifordpereira/nuxt-auto-crud/commit/9cdb9f0))
- Add CMS Drizzle schemas, refactor resource page UI with UDashboard components and sidebar collapse, and improve timestamp handling in model mapper. ([29d0cd7](https://github.com/clifordpereira/nuxt-auto-crud/commit/29d0cd7))
- Introduce initial Drizzle migration for the users table and enhance README with comprehensive usage and setup documentation. ([9e1934c](https://github.com/clifordpereira/nuxt-auto-crud/commit/9e1934c))
- Add explicit types for resource schemas and a `getSchema` helper function to the `useResourceSchemas` composable. ([0c6935b](https://github.com/clifordpereira/nuxt-auto-crud/commit/0c6935b))

### 💅 Refactors

- Replace manual `USelectMenu` update logic with `v-model` and a computed property. ([c0ab6c7](https://github.com/clifordpereira/nuxt-auto-crud/commit/c0ab6c7))
- Migrate schema fetching to useAsyncData and remove product navigation link. ([193886c](https://github.com/clifordpereira/nuxt-auto-crud/commit/193886c))
- Update auth middleware to redirect unauthenticated users to home page and adjust E2E tests accordingly. ([179847a](https://github.com/clifordpereira/nuxt-auto-crud/commit/179847a))
- Rename timestamp fields to `createdAt` and `updatedAt` and update related patch logic and protected fields. ([10456f8](https://github.com/clifordpereira/nuxt-auto-crud/commit/10456f8))
- Refactor user type definition, remove unused types, and remove notification display logic. ([3151949](https://github.com/clifordpereira/nuxt-auto-crud/commit/3151949))
- Improve authentication logic in server API routes and apply minor code formatting. ([70c8edb](https://github.com/clifordpereira/nuxt-auto-crud/commit/70c8edb))
- Simplify catch blocks, improve type safety, and add ESLint exceptions. ([206cce8](https://github.com/clifordpereira/nuxt-auto-crud/commit/206cce8))

### 📖 Documentation

- Clarify feature list with module mentions and update footer text ([5999cba](https://github.com/clifordpereira/nuxt-auto-crud/commit/5999cba))

### ❤️ Contributors

- Cliford Pereira ([@clifordpereira](https://github.com/clifordpereira))

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
