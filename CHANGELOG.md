## v2.1.1

[compare changes](https://github.com/clifordpereira/nuxt-auto-crud/compare/v2.1.0...v2.1.1)

### 🩹 Fixes

- Remove '.ts' extension from server handler in module.ts ([3025e6c](https://github.com/clifordpereira/nuxt-auto-crud/commit/3025e6c))

### 🏡 Chore

- Remove unnecessary files ([5862bca](https://github.com/clifordpereira/nuxt-auto-crud/commit/5862bca))

### ❤️ Contributors

- Cliford Pereira ([@clifordpereira](https://github.com/clifordpereira))

## v2.1.0

[compare changes](https://github.com/clifordpereira/nuxt-auto-crud/compare/v1.31.0...v2.1.0)

### 🚀 Enhancements

- Implement global SSE broadcasting using Cloudflare KV for cross-isolate communication. ([b496c24](https://github.com/clifordpereira/nuxt-auto-crud/commit/b496c24))
- Configure NuxtHub deployment, Drizzle database migrations, and Cloudflare Workers environment settings for production and staging. ([3022d51](https://github.com/clifordpereira/nuxt-auto-crud/commit/3022d51))
- Refine testing documentation. ([7508492](https://github.com/clifordpereira/nuxt-auto-crud/commit/7508492))
- Refactoring test fixtures to utilize `@nuxthub/core` database and KV. ([71b7aa4](https://github.com/clifordpereira/nuxt-auto-crud/commit/71b7aa4))
- Refine `modelMapper` for schema-less environment compatibility while removing outdated test fixture files. ([674c6b5](https://github.com/clifordpereira/nuxt-auto-crud/commit/674c6b5))
- Implement schema existence check and use an empty schema stub when no schema is found, enabling module functionality without a defined schema. ([10cf1b1](https://github.com/clifordpereira/nuxt-auto-crud/commit/10cf1b1))
- Enhance Nuxthub integration, simplify schema aliasing, update Drizzle ORM peer dependency, and expand e2e test coverage with new CRUD fixture. ([460ce8b](https://github.com/clifordpereira/nuxt-auto-crud/commit/460ce8b))
- Remove JWT authentication, streamline auth configuration, move runtime config to public, and introduce schema utility unit tests. ([0796659](https://github.com/clifordpereira/nuxt-auto-crud/commit/0796659))
- Enhance `modelMapper` with dynamic Zod schema generation, improved field visibility accompanied by comprehensive unit tests. ([7d55757](https://github.com/clifordpereira/nuxt-auto-crud/commit/7d55757))
- Enhance schema processing with Drizzle type mapping, foreign key detection, label field heuristics, and robust model field filtering. ([b120fb1](https://github.com/clifordpereira/nuxt-auto-crud/commit/b120fb1))
- Improve type safety and test isolation in modelMapper tests. ([bed97a4](https://github.com/clifordpereira/nuxt-auto-crud/commit/bed97a4))
- Refine schema introspection by integrating `HIDDEN_FIELDS` from constants and simplifying field filtering logic. ([9ef6d61](https://github.com/clifordpereira/nuxt-auto-crud/commit/9ef6d61))
- Implement `_own` record permission checks with database ownership verification and add comprehensive unit tests. ([c0b63dd](https://github.com/clifordpereira/nuxt-auto-crud/commit/c0b63dd))
- Add E2E tests for `_meta` and `_relations` API endpoints, including authentication, data structure, and Markdown output. ([e8a4b26](https://github.com/clifordpereira/nuxt-auto-crud/commit/e8a4b26))
- Add E2E tests for schema reflection and implement/test SSE for real-time updates. ([97161d0](https://github.com/clifordpereira/nuxt-auto-crud/commit/97161d0))
- Remove internal authentication and authorization logic, refactoring resource sanitization into a unified `sanitizeResource` function. ([183a252](https://github.com/clifordpereira/nuxt-auto-crud/commit/183a252))
- Bolster SSE composable with error handling and SSR safety, improve relation display data consistency, and refine resource schema types. ([4800b8f](https://github.com/clifordpereira/nuxt-auto-crud/commit/4800b8f))
- Enhance schema field generation with Zod-based semantic type inference, protected field exclusion, and refactored foreign key utilities. ([fa3be8b](https://github.com/clifordpereira/nuxt-auto-crud/commit/fa3be8b))
- Implement dynamic relation extraction utility and refactor E2E test suite. ([d21dc02](https://github.com/clifordpereira/nuxt-auto-crud/commit/d21dc02))
- Add optional `auth` configuration with `authentication` and `authorization` flags to `ModuleOptions`. ([85e34b6](https://github.com/clifordpereira/nuxt-auto-crud/commit/85e34b6))
- Introduce server-side authentication middleware and a client-side authorization resolver plugin. ([81c1cbf](https://github.com/clifordpereira/nuxt-auto-crud/commit/81c1cbf))
- Introduce configurable authentication bypass, delegate authorization to `checkAdminAccess`, and define new H3 event context types. ([3ba3d23](https://github.com/clifordpereira/nuxt-auto-crud/commit/3ba3d23))
- Introduce configurable ability bridge for authorization and enhance dynamic ownership checks. ([dd077b5](https://github.com/clifordpereira/nuxt-auto-crud/commit/dd077b5))
- Introduce a default ability stub, conditionally load auth helpers, and set module authentication/authorization defaults to false. ([702aee6](https://github.com/clifordpereira/nuxt-auto-crud/commit/702aee6))
- Enforce read access control on `GET /api/[model]` endpoints via `ensureResourceAccess` and refine `auth` utility formatting. ([166cce8](https://github.com/clifordpereira/nuxt-auto-crud/commit/166cce8))
- Introduce configurable endpoint prefix and centralize field management via module options. ([af7a823](https://github.com/clifordpereira/nuxt-auto-crud/commit/af7a823))
- Refactor runtime configuration merging, update model mapper and schema utilities to leverage the new config structure, and prefix the SSE endpoint. ([5ac760e](https://github.com/clifordpereira/nuxt-auto-crud/commit/5ac760e))
- Allow configuration of the `useResourceSchemas` endpoint prefix via runtime config and update related tests. ([91d77a2](https://github.com/clifordpereira/nuxt-auto-crud/commit/91d77a2))
- Update default API endpoint prefix to `/api/_nac` and dynamically retrieve it from runtime config in the playground. ([de54bc6](https://github.com/clifordpereira/nuxt-auto-crud/commit/de54bc6))
- Introduce configurable endpoint prefix via runtime config and refine SSE event listener to 'crud' type. ([2cd9287](https://github.com/clifordpereira/nuxt-auto-crud/commit/2cd9287))
- Standardize all Nuxt Auto CRUD API endpoints under the `/api/_nac` prefix and update `useCrudFetch` to use `endpointPrefix` from runtime config. ([a523a10](https://github.com/clifordpereira/nuxt-auto-crud/commit/a523a10))
- Add server-side API route guard and centralize authentication context resolution for agentic and user access. ([782bf2f](https://github.com/clifordpereira/nuxt-auto-crud/commit/782bf2f))
- Implement instance-based SSE signal filtering to prevent self-echoes and enhance table row management with unique keys and duplicate prevention. ([7b5c6f4](https://github.com/clifordpereira/nuxt-auto-crud/commit/7b5c6f4))
- Add loading state to CRUD form submission buttons in `CreateRow`, `EditRow`, and `Form` components. ([d292edf](https://github.com/clifordpereira/nuxt-auto-crud/commit/d292edf))
- Refactor `hasOwnership` to leverage Drizzle's `getTableName` and `getTableColumns` for improved ownership column detection, alongside refining auth context resolution and updating unit tests. ([e6a503f](https://github.com/clifordpereira/nuxt-auto-crud/commit/e6a503f))
- Refactor and enhance authentication and authorization logic with new unit and E2E tests, and introduce a health check endpoint. ([a3a9134](https://github.com/clifordpereira/nuxt-auto-crud/commit/a3a9134))
- Add comprehensive E2E tests for authentication middleware, refine auth error handling, and update branding to NAC 2.0 Core. ([53822fd](https://github.com/clifordpereira/nuxt-auto-crud/commit/53822fd))
- Introduce Drizzle SQLite migration for playground schema, add E2E auth middleware tests, and refactor SSE broadcasting for asynchronous client delivery. ([2bc37c9](https://github.com/clifordpereira/nuxt-auto-crud/commit/2bc37c9))
- Allow `_` prefixed system routes to bypass session checks and rename the SSE endpoint to `/_sse`. ([d82684c](https://github.com/clifordpereira/nuxt-auto-crud/commit/d82684c))
- Introduce `nac-guard` middleware and centralize authentication and authorization logic, deprecating old permission composables and auth middleware. ([8d9ebc1](https://github.com/clifordpereira/nuxt-auto-crud/commit/8d9ebc1))
- Refactor authorization checks in `Table.vue` to use `allow` composable and enhance `modelMapper` to provide property-keyed relation mappings. ([9b31619](https://github.com/clifordpereira/nuxt-auto-crud/commit/9b31619))
- Implement relation fetching and display logic across API endpoints and client-side composables with comprehensive testing. ([f7675f0](https://github.com/clifordpereira/nuxt-auto-crud/commit/f7675f0))
- Introduce `resolveTableRelations` utility to centralize and improve relation extraction in model mapping and schema generation. ([593c9d0](https://github.com/clifordpereira/nuxt-auto-crud/commit/593c9d0))
- Add `getLabelField` and `forEachModel` utilities, and refactor schema generation to leverage them for improved relation and label field resolution. ([ae35307](https://github.com/clifordpereira/nuxt-auto-crud/commit/ae35307))
- Centralize schema type definitions and Zod validation rules into a new shared utility and refactor `useDynamicZodSchema` to leverage them. ([b0c0422](https://github.com/clifordpereira/nuxt-auto-crud/commit/b0c0422))
- Add unit test for `getAvailableModels` to safely handle non-table exports and standardize string literals and semicolons. ([cc7bd46](https://github.com/clifordpereira/nuxt-auto-crud/commit/cc7bd46))
- Introduce ownership-based authorization for API endpoints, refactoring data operations into new server query utilities and adding corresponding unit and e2e tests. ([108bd21](https://github.com/clifordpereira/nuxt-auto-crud/commit/108bd21))
- Implement authorization guards and refactor CRUD query functions from `*Record` to `*Row`. ([914402d](https://github.com/clifordpereira/nuxt-auto-crud/commit/914402d))
- Implement and test row-level ownership authorization with new `abilities` utilities and refactor `app-guard` middleware. ([ac5b185](https://github.com/clifordpereira/nuxt-auto-crud/commit/ac5b185))

### 🩹 Fixes

- Remove explicit `@nuxthub/kv` type declaration and add `@ts-expect-error` for virtual module imports. ([ef43314](https://github.com/clifordpereira/nuxt-auto-crud/commit/ef43314))
- Add apiSecretToken ([357a268](https://github.com/clifordpereira/nuxt-auto-crud/commit/357a268))
- Token key mismatch; add correct key format ([5ae79e4](https://github.com/clifordpereira/nuxt-auto-crud/commit/5ae79e4))
- Pass test-token in nac-guard.test.ts ([c5f9f8f](https://github.com/clifordpereira/nuxt-auto-crud/commit/c5f9f8f))
- Lint errors ([4d5a613](https://github.com/clifordpereira/nuxt-auto-crud/commit/4d5a613))
- Lint errors ([56ee501](https://github.com/clifordpereira/nuxt-auto-crud/commit/56ee501))
- Lint errors ([52c093e](https://github.com/clifordpereira/nuxt-auto-crud/commit/52c093e))
- Lint errors ([27595db](https://github.com/clifordpereira/nuxt-auto-crud/commit/27595db))
- Lint errors ([11f555e](https://github.com/clifordpereira/nuxt-auto-crud/commit/11f555e))
- Module build ([3c6e5ca](https://github.com/clifordpereira/nuxt-auto-crud/commit/3c6e5ca))
- Module build ([9cabe89](https://github.com/clifordpereira/nuxt-auto-crud/commit/9cabe89))
- Import error ([8a4b618](https://github.com/clifordpereira/nuxt-auto-crud/commit/8a4b618))
- Import error ([d3dbf0e](https://github.com/clifordpereira/nuxt-auto-crud/commit/d3dbf0e))
- Disable parallelism ([acc16f8](https://github.com/clifordpereira/nuxt-auto-crud/commit/acc16f8))
- Add return type for toH3() ([af3edb8](https://github.com/clifordpereira/nuxt-auto-crud/commit/af3edb8))

### 💅 Refactors

- Remove 'crud' channel argument from broadcast calls in CRUD endpoints. ([b2f1346](https://github.com/clifordpereira/nuxt-auto-crud/commit/b2f1346))
- Enhance type safety for NuxtHub KV interactions and refine SSE cleanup logic. ([47c532a](https://github.com/clifordpereira/nuxt-auto-crud/commit/47c532a))
- Remove backend-only playground and JWT fixture, and introduce new .nuxtrc configurations. ([dba66bf](https://github.com/clifordpereira/nuxt-auto-crud/commit/dba66bf))
- Migrate testing infrastructure to `@nuxt/test-utils` with a project-based Vitest configuration, deprecating old test files and scripts. ([0afd58a](https://github.com/clifordpereira/nuxt-auto-crud/commit/0afd58a))
- Consolidate and refine `modelMapper`'s hidden and protected field filtering logic ([3387387](https://github.com/clifordpereira/nuxt-auto-crud/commit/3387387))
- Improve type inference in schema tests and standardize array and catch block formatting. ([09d258f](https://github.com/clifordpereira/nuxt-auto-crud/commit/09d258f))
- Decouple authentication from the core handler and unify resource filtering into a single sanitization utility. ([f981d7d](https://github.com/clifordpereira/nuxt-auto-crud/commit/f981d7d))
- Refactor `handler` utility into `guard` and `modelMapper` for improved resource access control and field filtering, and update related API endpoints and tests. ([5509970](https://github.com/clifordpereira/nuxt-auto-crud/commit/5509970))
- Update schema utility to explicitly mark protected fields as read-only in metadata instead of omitting them. ([5d437f7](https://github.com/clifordpereira/nuxt-auto-crud/commit/5d437f7))
- Consolidate SSE E2E tests into `engine.test.ts` and refine schema unit tests for read-only fields and method renaming. ([aae576c](https://github.com/clifordpereira/nuxt-auto-crud/commit/aae576c))
- Streamline and simplify authentication and authorization utilities by removing verbose comments and consolidating logic. ([4b49bd9](https://github.com/clifordpereira/nuxt-auto-crud/commit/4b49bd9))
- Improve `checkAdminAccess` authorization flow, ownership logic, and add comprehensive test mocks. ([1125c68](https://github.com/clifordpereira/nuxt-auto-crud/commit/1125c68))
- Update authentication ability path to shared utilities. ([8e5de04](https://github.com/clifordpereira/nuxt-auto-crud/commit/8e5de04))
- Remove `__NAC_DISABLED__` and `hub:db` stubs. ([1589581](https://github.com/clifordpereira/nuxt-auto-crud/commit/1589581))
- Remove forbidden relations filtering from CRUD table visible columns. ([975a312](https://github.com/clifordpereira/nuxt-auto-crud/commit/975a312))
- Consolidate server route definitions into a single array with explicit HTTP methods. ([257b4a5](https://github.com/clifordpereira/nuxt-auto-crud/commit/257b4a5))
- Nest API routes under `/nac` with explicit `.ts` extensions and improve PATCH endpoint's protected field handling. ([95f3863](https://github.com/clifordpereira/nuxt-auto-crud/commit/95f3863))
- Standardize `nuxt-auto-crud` composable and API endpoint naming with `Nac` prefix. ([94c9ab4](https://github.com/clifordpereira/nuxt-auto-crud/commit/94c9ab4))
- Remove `hashedFields` option and consolidate `ensureResourceAccess` into `auth.ts` by deleting `guard.ts`. ([d16970f](https://github.com/clifordpereira/nuxt-auto-crud/commit/d16970f))
- Namespace Nuxt Auto CRUD API routes with `/api/_nac` prefix for clarity and isolation. ([8e4b21b](https://github.com/clifordpereira/nuxt-auto-crud/commit/8e4b21b))
- Move resource access guard logic and tests from `guard` to `auth` module and reorder playground index content. ([9b3bf1c](https://github.com/clifordpereira/nuxt-auto-crud/commit/9b3bf1c))
- Consolidate authentication types and refine model schema handling in core CRUD operations. ([c99cc45](https://github.com/clifordpereira/nuxt-auto-crud/commit/c99cc45))
- Enhance unit testing for authentication and permissions by introducing dedicated mock modules and a new test setup. ([9c546c7](https://github.com/clifordpereira/nuxt-auto-crud/commit/9c546c7))
- Internalize `resolveAuthContext` and `checkOwnership` in `auth.ts`, update `guardEventAccess` tests, and remove `src/runtime/server/tsconfig.json`. ([c8fb9eb](https://github.com/clifordpereira/nuxt-auto-crud/commit/c8fb9eb))
- Reorder 'Real-time Updates' feature in content and refine code block rendering on the index page. ([df8747c](https://github.com/clifordpereira/nuxt-auto-crud/commit/df8747c))
- Enhance SSE bus robustness with global state and KV broadcast error handling, and adjust nac-guard to exclude SSE path from agentic routes. ([c63d408](https://github.com/clifordpereira/nuxt-auto-crud/commit/c63d408))
- Improve Drizzle ORM type safety by replacing `any` with specific types across model mapping and schema generation utilities. ([dac334e](https://github.com/clifordpereira/nuxt-auto-crud/commit/dac334e))
- Remove `_sse` from agentic path guarding and token from `useNacAutoCrudSSE` connection. ([9a60342](https://github.com/clifordpereira/nuxt-auto-crud/commit/9a60342))
- Update SSE endpoint path in tests and refine `modelMapper` schema optionality validation. ([4b701d5](https://github.com/clifordpereira/nuxt-auto-crud/commit/4b701d5))
- Standardize string literals to single quotes across test files. ([1e08676](https://github.com/clifordpereira/nuxt-auto-crud/commit/1e08676))
- Enhance type safety in various test files by replacing `any` with explicit type declarations. ([913bbee](https://github.com/clifordpereira/nuxt-auto-crud/commit/913bbee))
- Enhance type safety in E2E and Nuxt component tests with explicit type annotations and minor test logic refinements. ([b7d8434](https://github.com/clifordpereira/nuxt-auto-crud/commit/b7d8434))
- Centralize base schema definition logic in `modelMapper` and enhance it in `schema`, removing the permissions guide page. ([c93e864](https://github.com/clifordpereira/nuxt-auto-crud/commit/c93e864))
- Consolidate authorization logic by exporting `hasPermission`, centralizing permission fetching, and removing obsolete test files. ([5d06d38](https://github.com/clifordpereira/nuxt-auto-crud/commit/5d06d38))
- Streamline `app-guard` middleware with `requireUserSession`, `isNacSystemPath` bypass, and improved action resolution. ([98eedab](https://github.com/clifordpereira/nuxt-auto-crud/commit/98eedab))
- Streamline `_own` permission check and enhance documentation within the `app-guard` middleware. ([6b64831](https://github.com/clifordpereira/nuxt-auto-crud/commit/6b64831))
- Extract config resolution utilities into a dedicated file and add comprehensive mocks for Drizzle, H3, and Nuxt imports to improve testability. ([1cc0629](https://github.com/clifordpereira/nuxt-auto-crud/commit/1cc0629))
- Streamline field categorization and configuration access by removing `useAutoCrudConfig` and `config-resolver` utilities, introducing explicit API, form, and data table hidden field definitions. ([8ca3221](https://github.com/clifordpereira/nuxt-auto-crud/commit/8ca3221))
- Streamline model-to-table resolution using `modelTableMap`, return raw Drizzle data from API endpoints, and update Drizzle's column introspection API. ([fe0e3b7](https://github.com/clifordpereira/nuxt-auto-crud/commit/fe0e3b7))
- Enhance CRUD error handling with specific exceptions and refactor schema validation logic. ([d972eb8](https://github.com/clifordpereira/nuxt-auto-crud/commit/d972eb8))
- Consolidate Drizzle schema validation, simplify model discovery, and remove unused pluralization utilities. ([1f2c247](https://github.com/clifordpereira/nuxt-auto-crud/commit/1f2c247))
- Consolidate Drizzle ORM schema relations into a single `relations.ts` file, integrating audit relations. ([fb42b68](https://github.com/clifordpereira/nuxt-auto-crud/commit/fb42b68))
- Explicitly define Drizzle relation columns and remove old SQLite migrations. ([fa01098](https://github.com/clifordpereira/nuxt-auto-crud/commit/fa01098))
- Centralize schema and relation retrieval logic within `modelMapper` and remove redundant utility functions. ([0cc3848](https://github.com/clifordpereira/nuxt-auto-crud/commit/0cc3848))
- Rename schema API endpoint to `_schemas` and implement active status filtering for RBAC. ([5cf3e36](https://github.com/clifordpereira/nuxt-auto-crud/commit/5cf3e36))
- Rename field selection utility, enhance API endpoint parameter validation, and remove obsolete schema tests. ([0f8c620](https://github.com/clifordpereira/nuxt-auto-crud/commit/0f8c620))
- Consolidate schema definition logic and enhance field type inference in `modelMapper.ts` while removing deprecated schema utilities and API endpoints. ([90906df](https://github.com/clifordpereira/nuxt-auto-crud/commit/90906df))
- Rename fixtures ([565ea95](https://github.com/clifordpereira/nuxt-auto-crud/commit/565ea95))
- Rename playground to playground-saas and install new basic playground ([ebc9a7b](https://github.com/clifordpereira/nuxt-auto-crud/commit/ebc9a7b))
- Streamline schema reflection utilities by removing `resolveValidatedSchema` and `NAC_OWNER_KEYS`, and adding comprehensive unit tests for model mapping and relation resolution. ([dda0f76](https://github.com/clifordpereira/nuxt-auto-crud/commit/dda0f76))
- Centralize schema validation logic and improve timestamp coercion using drizzle-zod factory. ([a88c09a](https://github.com/clifordpereira/nuxt-auto-crud/commit/a88c09a))
- Remove kv related code ([66a2170](https://github.com/clifordpereira/nuxt-auto-crud/commit/66a2170))

### 📖 Documentation

- Add module structure documentation and update testing doc frontmatter. ([801cf85](https://github.com/clifordpereira/nuxt-auto-crud/commit/801cf85))
- Mark Nuxt Auth Utils and Nuxt Authorization as optional in pre-requisites documentation. ([d4094c7](https://github.com/clifordpereira/nuxt-auto-crud/commit/d4094c7))
- Update README with information on a known bug, its local fix, and the upcoming v2.0 release. ([382cc3c](https://github.com/clifordpereira/nuxt-auto-crud/commit/382cc3c))
- Update README to reflect V2 development focus on dependency decoupling and revised release timeline. ([3a982e7](https://github.com/clifordpereira/nuxt-auto-crud/commit/3a982e7))

### 🏡 Chore

- Update core and playground dependencies to their latest versions. ([a474b28](https://github.com/clifordpereira/nuxt-auto-crud/commit/a474b28))
- Update all bun dependencies and devDependencies to 'latest' in bun.lock. ([5897722](https://github.com/clifordpereira/nuxt-auto-crud/commit/5897722))
- Configure `@nuxt/test-utils` in `.nuxtrc` files and update bun dependencies. ([db3d057](https://github.com/clifordpereira/nuxt-auto-crud/commit/db3d057))
- Setup playground for automated tests ([fd3010d](https://github.com/clifordpereira/nuxt-auto-crud/commit/fd3010d))
- Update various dependencies and add `@nuxthub/core` to peer dependencies. ([e462083](https://github.com/clifordpereira/nuxt-auto-crud/commit/e462083))
- Add Drizzle ORM and LibSQL client dev dependencies to test fixtures. ([4410d64](https://github.com/clifordpereira/nuxt-auto-crud/commit/4410d64))
- Remove unused Drizzle config and auth middleware from test fixtures. ([b4d7b22](https://github.com/clifordpereira/nuxt-auto-crud/commit/b4d7b22))
- Update bun lockfiles and playground Nuxt configuration with latest dependency versions. ([9f8a4c1](https://github.com/clifordpereira/nuxt-auto-crud/commit/9f8a4c1))
- Reinstall dependencies ([31df879](https://github.com/clifordpereira/nuxt-auto-crud/commit/31df879))
- Rename SSE endpoint to `_sse` and add e2e tests ([d7562b0](https://github.com/clifordpereira/nuxt-auto-crud/commit/d7562b0))
- Update dependencies, including `@nuxthub/core`, add `drizzle-kit` and `@libsql/client` to peer dependencies ([449c17c](https://github.com/clifordpereira/nuxt-auto-crud/commit/449c17c))
- Make `_meta` endpoint publicly accessible ([6c43a79](https://github.com/clifordpereira/nuxt-auto-crud/commit/6c43a79))
- Implement optional authentication and public `_meta` endpoint access ([38246c0](https://github.com/clifordpereira/nuxt-auto-crud/commit/38246c0))
- Correct line ([5cf5421](https://github.com/clifordpereira/nuxt-auto-crud/commit/5cf5421))
- Introduce `QueryContext` for refined authorization logic ([c5b60d9](https://github.com/clifordpereira/nuxt-auto-crud/commit/c5b60d9))
- Implement ownership-based authorization within the app guard ([baf7327](https://github.com/clifordpereira/nuxt-auto-crud/commit/baf7327))
- Show create button for allowed users only ([40e37c4](https://github.com/clifordpereira/nuxt-auto-crud/commit/40e37c4))
- Refactor server-side data access to use a permission-based authorization model via `QueryContext` ([3c40612](https://github.com/clifordpereira/nuxt-auto-crud/commit/3c40612))
- Update related permission labels. ([3971e4a](https://github.com/clifordpereira/nuxt-auto-crud/commit/3971e4a))
- Enhance CRUD operations with authorization context and audit fields ([c05ce67](https://github.com/clifordpereira/nuxt-auto-crud/commit/c05ce67))
- Implement custom ownership-based authorization, replacing `nuxt-authorization` and add `uuidv7` dependency. ([03667b3](https://github.com/clifordpereira/nuxt-auto-crud/commit/03667b3))
- Remigrate db ([b477117](https://github.com/clifordpereira/nuxt-auto-crud/commit/b477117))
- Enhance CRUD query authorization with ownership checks ([2e66851](https://github.com/clifordpereira/nuxt-auto-crud/commit/2e66851))
- Update pricing ([b5ef9ab](https://github.com/clifordpereira/nuxt-auto-crud/commit/b5ef9ab))
- Reimplement authorization system with dedicated roles, resources, and permissions schemas, including audit relations ([46649ce](https://github.com/clifordpereira/nuxt-auto-crud/commit/46649ce))
- Remove tests from playground ([3ee1c10](https://github.com/clifordpereira/nuxt-auto-crud/commit/3ee1c10))
- Install drizzle ([0965ff6](https://github.com/clifordpereira/nuxt-auto-crud/commit/0965ff6))
- Order imports ([4a68f52](https://github.com/clifordpereira/nuxt-auto-crud/commit/4a68f52))
- Standardize schema retrieval to Drizzle columns, implement field filtering for API responses, and exclude internal Drizzle tables from model mapping. ([52027f8](https://github.com/clifordpereira/nuxt-auto-crud/commit/52027f8))
- Update Drizzle ORM dependencies to beta and remove `useNacRelationDisplay` and `useNacResourceSchemas` tests. ([13bd51f](https://github.com/clifordpereira/nuxt-auto-crud/commit/13bd51f))
- Fix lint errors ([67fa774](https://github.com/clifordpereira/nuxt-auto-crud/commit/67fa774))
- Remove lint errors ([185bba3](https://github.com/clifordpereira/nuxt-auto-crud/commit/185bba3))
- Fix lint error ([7898a85](https://github.com/clifordpereira/nuxt-auto-crud/commit/7898a85))
- Fix lint errors ([6024446](https://github.com/clifordpereira/nuxt-auto-crud/commit/6024446))
- Update config ([dcd7dcf](https://github.com/clifordpereira/nuxt-auto-crud/commit/dcd7dcf))
- Clean eslint.config.mjs ([ee7dc21](https://github.com/clifordpereira/nuxt-auto-crud/commit/ee7dc21))
- Prepare playground ([040f491](https://github.com/clifordpereira/nuxt-auto-crud/commit/040f491))
- Enhance query utilities with improved permission handling, sanitization, and comprehensive unit/e2e testing infrastructure. ([92269dc](https://github.com/clifordpereira/nuxt-auto-crud/commit/92269dc))
- Fix type errors ([61bdee0](https://github.com/clifordpereira/nuxt-auto-crud/commit/61bdee0))
- Add missing import ([d801f7f](https://github.com/clifordpereira/nuxt-auto-crud/commit/d801f7f))
- Enable Nuxt Hub database and KV for test fixtures, add Drizzle ORM dependencies, and remove explicit system table schema. ([ea478b3](https://github.com/clifordpereira/nuxt-auto-crud/commit/ea478b3))
- Update virtual import 'hub:db' to '@nuxthub/db' ([e969516](https://github.com/clifordpereira/nuxt-auto-crud/commit/e969516))
- Implement public resource access control by introducing `publicResources` config, enhancing `nac-guard` for unauthenticated access, and filtering selectable fields based on query context. ([102a939](https://github.com/clifordpereira/nuxt-auto-crud/commit/102a939))
- Fix module options ([a8d677f](https://github.com/clifordpereira/nuxt-auto-crud/commit/a8d677f))
- Change name endPointPrefix to nacEndpointPrefix ([acb0a27](https://github.com/clifordpereira/nuxt-auto-crud/commit/acb0a27))
- Update packages ([393a2bc](https://github.com/clifordpereira/nuxt-auto-crud/commit/393a2bc))
- Configure Nuxt Hub database to sqlite, modernize path resolution to `import.meta.dirname`, and add `nuxi prepare` to postinstall. ([58994ec](https://github.com/clifordpereira/nuxt-auto-crud/commit/58994ec))
- Remove playground-saas ([13aae46](https://github.com/clifordpereira/nuxt-auto-crud/commit/13aae46))
- Prefix query util functions with nac ([5fdaa9f](https://github.com/clifordpereira/nuxt-auto-crud/commit/5fdaa9f))
- Rename tablePermissions to resourcePermissions ([3b27149](https://github.com/clifordpereira/nuxt-auto-crud/commit/3b27149))

### ✅ Tests

- Introduce E2E testing utilities and a basic smoke test for the playground. ([09673d9](https://github.com/clifordpereira/nuxt-auto-crud/commit/09673d9))
- Refactor test authentication helpers. ([db4d3f0](https://github.com/clifordpereira/nuxt-auto-crud/commit/db4d3f0))
- Add E2E test for basic fixture boot and update Nuxt configurations for testing. ([5de099e](https://github.com/clifordpereira/nuxt-auto-crud/commit/5de099e))
- Configure e2e setup with an explicit host and disable the module in the basic fixture. ([87521f7](https://github.com/clifordpereira/nuxt-auto-crud/commit/87521f7))
- Add unit tests for `useRelationDisplay` and `useResourceSchemas` composables, E2E tests for CRUD and SSE, and refactor `useRelationDisplay` to remove `forbiddenRelations` state. ([ef8544b](https://github.com/clifordpereira/nuxt-auto-crud/commit/ef8544b))
- Remove unnecessary `abilities` and `abilityLogic` mock properties from auth test. ([ace0c0c](https://github.com/clifordpereira/nuxt-auto-crud/commit/ace0c0c))
- Add unit tests for the `modelMapper.getSchemaDefinition` function. ([26bf295](https://github.com/clifordpereira/nuxt-auto-crud/commit/26bf295))
- Queries.ts ([f879bac](https://github.com/clifordpereira/nuxt-auto-crud/commit/f879bac))
- Add crud test cases ([3fbc391](https://github.com/clifordpereira/nuxt-auto-crud/commit/3fbc391))
- Add test-cases for _meta.test.ts ([fbf7760](https://github.com/clifordpereira/nuxt-auto-crud/commit/fbf7760))
- Add tests for api/_nac/ _schema/* ([0d9b17a](https://github.com/clifordpereira/nuxt-auto-crud/commit/0d9b17a))
- Fix expection errors. ([3012abe](https://github.com/clifordpereira/nuxt-auto-crud/commit/3012abe))
- Add sse connection test without testing the result. ([f011dcc](https://github.com/clifordpereira/nuxt-auto-crud/commit/f011dcc))
- Refactor `nac-guard` middleware to support both agentic token and user session authentication, introduce new error classes, and add E2E config tests. ([79c60cd](https://github.com/clifordpereira/nuxt-auto-crud/commit/79c60cd))
- Authz ([fea3e16](https://github.com/clifordpereira/nuxt-auto-crud/commit/fea3e16))
- Sse composable ([8aa5cda](https://github.com/clifordpereira/nuxt-auto-crud/commit/8aa5cda))

### ❤️ Contributors

- Cliford Pereira ([@clifordpereira](https://github.com/clifordpereira))

## v1.31.0

[compare changes](https://github.com/clifordpereira/nuxt-auto-crud/compare/v1.30.0...v1.31.0)

### 🚀 Enhancements

- Refactor SSE implementation for improved robustness and compatibility, and configure Nuxt to optimize for serverless environments by aliasing Node.js polyfills. ([1d95ac0](https://github.com/clifordpereira/nuxt-auto-crud/commit/1d95ac0))

### ❤️ Contributors

- Cliford Pereira ([@clifordpereira](https://github.com/clifordpereira))

## v1.30.0

[compare changes](https://github.com/clifordpereira/nuxt-auto-crud/compare/v1.29.0...v1.30.0)

### 🚀 Enhancements

- Relatime code update for cloudflare. ([2d128d3](https://github.com/clifordpereira/nuxt-auto-crud/commit/2d128d3))

### 🩹 Fixes

- Lint errors ([539c346](https://github.com/clifordpereira/nuxt-auto-crud/commit/539c346))

### ❤️ Contributors

- Cliford Pereira ([@clifordpereira](https://github.com/clifordpereira))

## v1.29.0

[compare changes](https://github.com/clifordpereira/nuxt-auto-crud/compare/v1.28.0...v1.29.0)

### 🚀 Enhancements

- Implement real-time CRUD updates via Server-Sent Events (SSE) with server-side broadcasting and a client-side composable. ([e3f34d0](https://github.com/clifordpereira/nuxt-auto-crud/commit/e3f34d0))

### 🩹 Fixes

- Lint error ([83dae88](https://github.com/clifordpereira/nuxt-auto-crud/commit/83dae88))

### 📖 Documentation

- Add documentation detailing the Clifland Architectural Model (CAM) and its core principles. ([ca028e7](https://github.com/clifordpereira/nuxt-auto-crud/commit/ca028e7))

### 🏡 Chore

- Change the word 'generate' to actual process. ([acb65e4](https://github.com/clifordpereira/nuxt-auto-crud/commit/acb65e4))

### ❤️ Contributors

- Cliford Pereira ([@clifordpereira](https://github.com/clifordpereira))

## v1.28.0

[compare changes](https://github.com/clifordpereira/nuxt-auto-crud/compare/v1.27.0...v1.28.0)

### 🚀 Enhancements

- Import `getQuery` from `h3` in the server auth utility. ([333dde8](https://github.com/clifordpereira/nuxt-auto-crud/commit/333dde8))

### ❤️ Contributors

- Cliford Pereira ([@clifordpereira](https://github.com/clifordpereira))

## v1.27.0

[compare changes](https://github.com/clifordpereira/nuxt-auto-crud/compare/v1.26.0...v1.27.0)

### 🚀 Enhancements

- Enhance Cloudflare deployment documentation, update footer navigation with YouTube demos, and add MCP server documentation for AI agents. ([9c109c3](https://github.com/clifordpereira/nuxt-auto-crud/commit/9c109c3))
- Enhance RBAC documentation with static `app.config.ts` UI/agentic constraints and clarify deployment steps. ([53d2fe3](https://github.com/clifordpereira/nuxt-auto-crud/commit/53d2fe3))
- **docs:** Add video tutorial link for Drizzle schema creation. ([55d9b04](https://github.com/clifordpereira/nuxt-auto-crud/commit/55d9b04))
- Add Cloudflare Workers deployment configuration and update compatibilityDate to 2026-01-21 across project files. ([e4c7e2b](https://github.com/clifordpereira/nuxt-auto-crud/commit/e4c7e2b))
- Introduce agentic MCP features, add v1.26.0 changelog, and update blog content with localized images. ([6aba21a](https://github.com/clifordpereira/nuxt-auto-crud/commit/6aba21a))

### 💅 Refactors

- Add `getHeader` and `useRuntimeConfig` imports to `auth.ts` utility. ([b5f2572](https://github.com/clifordpereira/nuxt-auto-crud/commit/b5f2572))

### 📖 Documentation

- Add and update documentation for Agentic & Model Context Protocol (MCP) workflows, including server details and configuration. ([893f821](https://github.com/clifordpereira/nuxt-auto-crud/commit/893f821))
- Update documentation to clarify project focus on the full-stack template and de-prioritize backend-only mode. ([385b115](https://github.com/clifordpereira/nuxt-auto-crud/commit/385b115))
- Clarify backend-only mode development priority in documentation. ([67aa6ad](https://github.com/clifordpereira/nuxt-auto-crud/commit/67aa6ad))

### 🎨 Styles

- Remove extraneous blank line in `app.config.ts`. ([227f12f](https://github.com/clifordpereira/nuxt-auto-crud/commit/227f12f))

### ❤️ Contributors

- Cliford Pereira ([@clifordpereira](https://github.com/clifordpereira))

## v1.26.0

[compare changes](https://github.com/clifordpereira/nuxt-auto-crud/compare/v1.25.0...v1.26.0)

### 🚀 Enhancements

- Add agentic API token authentication and markdown output to `_meta` endpoint, including resource methods and field writability. ([ab27bd1](https://github.com/clifordpereira/nuxt-auto-crud/commit/ab27bd1))

### 🩹 Fixes

- Improve Drizzle type handling and markdown output in meta API, and correct authentication flow in auth utility. ([7d2f941](https://github.com/clifordpereira/nuxt-auto-crud/commit/7d2f941))

### ❤️ Contributors

- Cliford Pereira ([@clifordpereira](https://github.com/clifordpereira))

## v1.25.0

[compare changes](https://github.com/clifordpereira/nuxt-auto-crud/compare/v1.24.0...v1.25.0)

### 🚀 Enhancements

- Enable configurable roles for seeding via app config and update seeding utility to use them ([03b2728](https://github.com/clifordpereira/nuxt-auto-crud/commit/03b2728))
- Integrate `drizzle-zod` for robust request body validation and field filtering in model creation and update API endpoints. ([6ffa348](https://github.com/clifordpereira/nuxt-auto-crud/commit/6ffa348))
- Add new component for displaying user profiles. ([a0a5565](https://github.com/clifordpereira/nuxt-auto-crud/commit/a0a5565))
- Add AI context markdown files for the core module and playground. ([542c227](https://github.com/clifordpereira/nuxt-auto-crud/commit/542c227))
- Add module and playground manifests, LLM context files, and simplify authentication documentation. ([0a2795b](https://github.com/clifordpereira/nuxt-auto-crud/commit/0a2795b))
- Introduce `/api/_meta` endpoint for dynamic Drizzle model metadata reflection, including fields, types, relations, and label heuristics. ([971540f](https://github.com/clifordpereira/nuxt-auto-crud/commit/971540f))
- Introduce `summary` field for docs pages with UI display and expand AI context documentation for API discovery. ([e1272cb](https://github.com/clifordpereira/nuxt-auto-crud/commit/e1272cb))
- Update agent rules and AI context to detail CAM architecture, dynamic API discovery via `_meta` endpoint, and module boundaries. ([a70c823](https://github.com/clifordpereira/nuxt-auto-crud/commit/a70c823))

### 🩹 Fixes

- Enhance Drizzle foreign key detection and refine TypeScript `any` usage in server utilities and API meta-data generation. ([aa16275](https://github.com/clifordpereira/nuxt-auto-crud/commit/aa16275))

### 💅 Refactors

- Remove `filterUpdatableFields` utility function. ([1271c4a](https://github.com/clifordpereira/nuxt-auto-crud/commit/1271c4a))
- **docs:** Reorganize installation guides ([0c566c6](https://github.com/clifordpereira/nuxt-auto-crud/commit/0c566c6))

### 📖 Documentation

- Add `rolesToSeed` configuration option to resource configuration documentation ([5afe745](https://github.com/clifordpereira/nuxt-auto-crud/commit/5afe745))
- Replace framework-agnostic analysis with internal agent workspace rules for nuxt-auto-crud. ([e59c8c9](https://github.com/clifordpereira/nuxt-auto-crud/commit/e59c8c9))
- Revamp playground README as a detailed reference implementation guide and simplify the root README. ([5da2f43](https://github.com/clifordpereira/nuxt-auto-crud/commit/5da2f43))
- Revise and expand documentation to introduce Core Engine/Template Implementation architecture, detail Drizzle-Zod validation, and streamline authentication configuration. ([22b2ff0](https://github.com/clifordpereira/nuxt-auto-crud/commit/22b2ff0))
- Update README seeding instructions, refine `nuxt-auto-crud` descriptions, and adjust footer module label. ([f068f08](https://github.com/clifordpereira/nuxt-auto-crud/commit/f068f08))
- Refactor readme of module and playground ([829285e](https://github.com/clifordpereira/nuxt-auto-crud/commit/829285e))
- Consolidate playground quick start and feature set documentation into a new core features file, and update AI context. ([063d9c2](https://github.com/clifordpereira/nuxt-auto-crud/commit/063d9c2))
- Refine documentation by updating helpful links with a new YouTube playlist, clarifying module terminology, and removing 'AI Snapshot' prefixes from introductory descriptions. ([104dd88](https://github.com/clifordpereira/nuxt-auto-crud/commit/104dd88))
- Add agent discovery guides, API protocol documentation, and contributing files for core and playground, including a `Table.vue` visibility hint. ([721b631](https://github.com/clifordpereira/nuxt-auto-crud/commit/721b631))
- Enhance and clarify documentation for installation, API protocol, type mapping, module options, and field privacy. ([c5099c2](https://github.com/clifordpereira/nuxt-auto-crud/commit/c5099c2))
- Refine AI context and architectural definitions, emphasizing agentic tools and `_meta` as the primary discovery mechanism. ([481dcdf](https://github.com/clifordpereira/nuxt-auto-crud/commit/481dcdf))

### 🏡 Chore

- Add `ts-expect-error` directives for virtual imports in server API handler and model mapper utility. ([7775cfc](https://github.com/clifordpereira/nuxt-auto-crud/commit/7775cfc))
- Temporary commit ([9cdf31b](https://github.com/clifordpereira/nuxt-auto-crud/commit/9cdf31b))

### ❤️ Contributors

- Cliford Pereira ([@clifordpereira](https://github.com/clifordpereira))

## v1.24.0

[compare changes](https://github.com/clifordpereira/nuxt-auto-crud/compare/v1.23.1...v1.24.0)

### 🚀 Enhancements

- Import createError from h3 ([7b61ce4](https://github.com/clifordpereira/nuxt-auto-crud/commit/7b61ce4))

### ❤️ Contributors

- Cliford Pereira ([@clifordpereira](https://github.com/clifordpereira))

## v1.23.1

[compare changes](https://github.com/clifordpereira/nuxt-auto-crud/compare/v1.23.0...v1.23.1)

## v1.23.0

[compare changes](https://github.com/clifordpereira/nuxt-auto-crud/compare/v1.22.1...v1.23.0)

### 🚀 Enhancements

- Introduce CMS schema, settings page, and auth error handling, alongside various schema, form, and authentication flow refinements. ([cc0b992](https://github.com/clifordpereira/nuxt-auto-crud/commit/cc0b992))
- Enhance authentication, authorization, database schema, and CRUD functionalities across the application. ([9384853](https://github.com/clifordpereira/nuxt-auto-crud/commit/9384853))
- Implement `read_own` and `list_own` permissions with server-side ownership-based filtering for resource access. ([b45fd73](https://github.com/clifordpereira/nuxt-auto-crud/commit/b45fd73))
- Implement `update_status` permission with UI and logic, and update database schema. ([e6ccdd1](https://github.com/clifordpereira/nuxt-auto-crud/commit/e6ccdd1))
- Allow role selection during signup, enable roles resource management, and cache public abilities. ([5cfc2b8](https://github.com/clifordpereira/nuxt-auto-crud/commit/5cfc2b8))
- **docs:** Enhance deployment guide with Cloudflare instructions and introduce owner-based permissions. ([6d11f3e](https://github.com/clifordpereira/nuxt-auto-crud/commit/6d11f3e))
- Add optional `command` and `commandNote` string fields to the content schema. ([8b9db1a](https://github.com/clifordpereira/nuxt-auto-crud/commit/8b9db1a))
- Implement comprehensive authentication, authorization, and CRUD functionalities with updated schemas and UI components ([d527165](https://github.com/clifordpereira/nuxt-auto-crud/commit/d527165))

### 📖 Documentation

- Add v1.22.0 changelog detailing numerous enhancements, refactors, and dependency updates. ([3b91390](https://github.com/clifordpereira/nuxt-auto-crud/commit/3b91390))

### 🏡 Chore

- **release:** V1.22.1 ([b44f38a](https://github.com/clifordpereira/nuxt-auto-crud/commit/b44f38a))

### ❤️ Contributors

- Cliford Pereira ([@clifordpereira](https://github.com/clifordpereira))

## v1.22.1

[compare changes](https://github.com/clifordpereira/nuxt-auto-crud/compare/v1.22.0...v1.22.1)

### 📖 Documentation

- Update README to reflect production readiness, simplify installation, externalize detailed authentication and configuration, and streamline links. ([92ff396](https://github.com/clifordpereira/nuxt-auto-crud/commit/92ff396))

### 🏡 Chore

- **release:** V1.22.0 ([88fab6c](https://github.com/clifordpereira/nuxt-auto-crud/commit/88fab6c))

### ❤️ Contributors

- Cliford Pereira ([@clifordpereira](https://github.com/clifordpereira))

## v1.22.0

[compare changes](https://github.com/clifordpereira/nuxt-auto-crud/compare/v1.21.0...v1.22.0)

### 🚀 Enhancements

- Introduce custom `RecordNotFoundError` for 404 responses and add error handling tests. ([81bbaf9](https://github.com/clifordpereira/nuxt-auto-crud/commit/81bbaf9))
- Add comprehensive favicon links and update SEO meta title and image paths. ([6d67e89](https://github.com/clifordpereira/nuxt-auto-crud/commit/6d67e89))
- Automatically close `CreateRow` and `EditRow` modals after form submission. ([06d3e51](https://github.com/clifordpereira/nuxt-auto-crud/commit/06d3e51))
- Defer promotional video loading, optimize star background performance, and lazy load images. ([1875e5b](https://github.com/clifordpereira/nuxt-auto-crud/commit/1875e5b))
- Implement OAuth (Google, GitHub), forgot/reset password, and CRUD table export functionality ([23b0616](https://github.com/clifordpereira/nuxt-auto-crud/commit/23b0616))
- Implement dynamic column visibility for table display and export, and enhance PDF export formatting. ([f609833](https://github.com/clifordpereira/nuxt-auto-crud/commit/f609833))
- Update PDF export table styling to use grid theme and add borders ([8967b3c](https://github.com/clifordpereira/nuxt-auto-crud/commit/8967b3c))
- Improve authentication pages with UAuthForm, add social login, and enhance PDF export formatting ([82d6da9](https://github.com/clifordpereira/nuxt-auto-crud/commit/82d6da9))
- Update PDF footer to display current page number only and disable Google Fonts provider. ([70a1daa](https://github.com/clifordpereira/nuxt-auto-crud/commit/70a1daa))
- Refactor OAuth provider handling for login/signup, update redirect path, migrate to Bun, and introduce session password configuration. ([3b773dd](https://github.com/clifordpereira/nuxt-auto-crud/commit/3b773dd))
- Send password reset emails using Nodemailer and add related configuration ([4bc8f99](https://github.com/clifordpereira/nuxt-auto-crud/commit/4bc8f99))
- Implement flexible password reset email sending via Resend API or Nodemailer with background processing and updated documentation. ([0baa7ec](https://github.com/clifordpereira/nuxt-auto-crud/commit/0baa7ec))
- Add configurable column hiding and data export exclusions for CRUD tables, introduce a posts table, and update user authentication fields. ([b69f541](https://github.com/clifordpereira/nuxt-auto-crud/commit/b69f541))
- Enhance foreign key resolution in schema utility, refactor comments schema to use `authorId`, and remove the posts table. ([470f5b2](https://github.com/clifordpereira/nuxt-auto-crud/commit/470f5b2))
- Add admin email/password env variables, update Nuxthub/db commands, simplify local email config, and remove known issues documentation. ([83314fd](https://github.com/clifordpereira/nuxt-auto-crud/commit/83314fd))
- Add nuxt-auth-utils and nuxt-authorization modules ([b83d6ca](https://github.com/clifordpereira/nuxt-auto-crud/commit/b83d6ca))

### 💅 Refactors

- Remove explicit modal state management and `CrudForm` close events from CreateRow and EditRow components. ([5a0eb7e](https://github.com/clifordpereira/nuxt-auto-crud/commit/5a0eb7e))
- Enhance type safety and clarity across server routes, composables, and UI pages, and remove unused imports. ([e22350f](https://github.com/clifordpereira/nuxt-auto-crud/commit/e22350f))

### 🏡 Chore

- **release:** V1.21.0 ([13eb9e9](https://github.com/clifordpereira/nuxt-auto-crud/commit/13eb9e9))
- Update dependencies and hide audit columns in CRUD tables. ([140fbf3](https://github.com/clifordpereira/nuxt-auto-crud/commit/140fbf3))

### ❤️ Contributors

- Cliford Pereira ([@clifordpereira](https://github.com/clifordpereira))

## v1.21.0

[compare changes](https://github.com/clifordpereira/nuxt-auto-crud/compare/v1.20.0...v1.21.0)

### 🚀 Enhancements

- Implement robust authentication with password hashing and dedicated error handling, alongside database schema updates and type definitions. ([d7b25be](https://github.com/clifordpereira/nuxt-auto-crud/commit/d7b25be))
- Implement a `usePermissions` composable to filter UI elements, enhance schema generation with foreign key references for improved CRUD forms, and refine form submission logic. ([5414e0c](https://github.com/clifordpereira/nuxt-auto-crud/commit/5414e0c))
- Hide CRUD table columns for relations failing with 403 errors by tracking forbidden relations. ([88f2f2c](https://github.com/clifordpereira/nuxt-auto-crud/commit/88f2f2c))
- Implement resource ownership and authorization checks, update pricing page content, and refine table header display. ([11364cb](https://github.com/clifordpereira/nuxt-auto-crud/commit/11364cb))
- Rename 'Nuxt Auto Crud' to 'Auto Crud', update pricing plans, add AntiGravity IDE link, and extend schema relations to include `deletedBy`. ([51e876d](https://github.com/clifordpereira/nuxt-auto-crud/commit/51e876d))
- Update footer links and layout, revise pricing plans, and adjust changelog date ([f9497be](https://github.com/clifordpereira/nuxt-auto-crud/commit/f9497be))
- Filter out `created_by` and `updated_by` system fields from the CRUD form. ([ba2ace6](https://github.com/clifordpereira/nuxt-auto-crud/commit/ba2ace6))
- Add favicon and web manifest files ([32c1141](https://github.com/clifordpereira/nuxt-auto-crud/commit/32c1141))
- Enhance authorization and permissions management across the application and refine various UI components. ([31a0975](https://github.com/clifordpereira/nuxt-auto-crud/commit/31a0975))

### 💅 Refactors

- Consolidate `created_by` and `updated_by` columns into the initial schema snapshot by removing redundant migration files." ([5af900e](https://github.com/clifordpereira/nuxt-auto-crud/commit/5af900e))
- Improve code consistency and update configurations across the playground. ([5bbecd0](https://github.com/clifordpereira/nuxt-auto-crud/commit/5bbecd0))
- Improve error handling by typing caught errors as unknown and simplifying empty catch blocks ([c7c5464](https://github.com/clifordpereira/nuxt-auto-crud/commit/c7c5464))

### 📖 Documentation

- Add documentation for owner-based permissions (RBAC) including `update_own` and `delete_own` functionality. ([f91f000](https://github.com/clifordpereira/nuxt-auto-crud/commit/f91f000))

### 🏡 Chore

- **release:** V1.20.0 ([d654643](https://github.com/clifordpereira/nuxt-auto-crud/commit/d654643))

### ❤️ Contributors

- Cliford Pereira ([@clifordpereira](https://github.com/clifordpereira))

## v1.20.0

[compare changes](https://github.com/clifordpereira/nuxt-auto-crud/compare/v1.19.1...v1.20.0)

### 🚀 Enhancements

- Implement resource ownership for authorization by adding `createdBy`/`updatedBy` fields, enhancing ability checks, and auto-populating ownership data.) ([c120087](https://github.com/clifordpereira/nuxt-auto-crud/commit/c120087))
- Refine ownership checks with improved ability context types and simplified error handling in API routes. ([43b0658](https://github.com/clifordpereira/nuxt-auto-crud/commit/43b0658))
- Add `update_own` and `delete_own` to permission display order and exclude `resources-ownership.test.ts` from Vitest config. ([ec6a74a](https://github.com/clifordpereira/nuxt-auto-crud/commit/ec6a74a))

### ❤️ Contributors

- Cliford Pereira ([@clifordpereira](https://github.com/clifordpereira))

## v1.19.1

[compare changes](https://github.com/clifordpereira/nuxt-auto-crud/compare/v1.19.0...v1.19.1)

## v1.19.0

[compare changes](https://github.com/clifordpereira/nuxt-auto-crud/compare/v1.18.1...v1.19.0)

### 🚀 Enhancements

- Make Google Analytics ID configurable via environment variable ([af186af](https://github.com/clifordpereira/nuxt-auto-crud/commit/af186af))
- Implement user profile management with refresh token support and extended permissions. ([40203ac](https://github.com/clifordpereira/nuxt-auto-crud/commit/40203ac))
- Update header logout button and allow users to update their own profile ([0a278a0](https://github.com/clifordpereira/nuxt-auto-crud/commit/0a278a0))
- Implement permission-based resource filtering for menu items, including admin override and empty state handling. ([36078d9](https://github.com/clifordpereira/nuxt-auto-crud/commit/36078d9))
- Improve test infrastructure by adding mock database implementations and refining Vitest exclusions for conditional test execution. ([9d3d5c4](https://github.com/clifordpereira/nuxt-auto-crud/commit/9d3d5c4))

### 💅 Refactors

- Remove `@ts-expect-error` comments from auth utility and update migration metadata. ([044de75](https://github.com/clifordpereira/nuxt-auto-crud/commit/044de75))
- Use CommonPassword component for password input in profile page. ([acd3a44](https://github.com/clifordpereira/nuxt-auto-crud/commit/acd3a44))
- Centralize Drizzle ORM integration using `hub:db` virtual alias and remove local `drizzle.ts` files. ([8c7dc59](https://github.com/clifordpereira/nuxt-auto-crud/commit/8c7dc59))
- Improve type safety for user session handling and error assertions in tests. ([f08ce67](https://github.com/clifordpereira/nuxt-auto-crud/commit/f08ce67))

### ❤️ Contributors

- Cliford Pereira ([@clifordpereira](https://github.com/clifordpereira))

## v1.18.1

[compare changes](https://github.com/clifordpereira/nuxt-auto-crud/compare/v1.18.0...v1.18.1)

## v1.18.0

[compare changes](https://github.com/clifordpereira/nuxt-auto-crud/compare/v1.17.3...v1.18.0)

### 🚀 Enhancements

- Integrate Drizzle ORM with NuxtHub `hub:db` abstraction, update dependencies, and refactor database tooling. ([0180203](https://github.com/clifordpereira/nuxt-auto-crud/commit/0180203))
- Add Turso/libSQL support, authorization abilities, and auth stubs, alongside general dependency and configuration updates. ([d6d190a](https://github.com/clifordpereira/nuxt-auto-crud/commit/d6d190a))
- Add Drizzle ORM schema and migrations, and update API tests with JWT authentication. ([c45e0e4](https://github.com/clifordpereira/nuxt-auto-crud/commit/c45e0e4))

### 💅 Refactors

- Remove `useAutoCrudConfig` from handler and update TypeScript ignore directives and type annotations. ([c110fef](https://github.com/clifordpereira/nuxt-auto-crud/commit/c110fef))

### 🏡 Chore

- Remove trailing commas for consistent formatting and update SEO metadata. ([1641c13](https://github.com/clifordpereira/nuxt-auto-crud/commit/1641c13))
- Apply consistent formatting and minor syntax fixes across various files. ([2cbd755](https://github.com/clifordpereira/nuxt-auto-crud/commit/2cbd755))

### ❤️ Contributors

- Cliford Pereira ([@clifordpereira](https://github.com/clifordpereira))

## v1.17.3

[compare changes](https://github.com/clifordpereira/nuxt-auto-crud/compare/v1.17.2...v1.17.3)

### 📖 Documentation

- Update documentation links to reflect new path ([a79672e](https://github.com/clifordpereira/nuxt-auto-crud/commit/a79672e))

### ❤️ Contributors

- Cliford Pereira ([@clifordpereira](https://github.com/clifordpereira))

## v1.17.2

[compare changes](https://github.com/clifordpereira/nuxt-auto-crud/compare/v1.17.1...v1.17.2)

## v1.17.1

[compare changes](https://github.com/clifordpereira/nuxt-auto-crud/compare/v1.17.0...v1.17.1)

## v1.17.0

[compare changes](https://github.com/clifordpereira/nuxt-auto-crud/compare/v1.16.0...v1.17.0)

### 🚀 Enhancements

- Add `@nuxt/scripts` module with Google Analytics ID and update various dependencies. ([11c1e44](https://github.com/clifordpereira/nuxt-auto-crud/commit/11c1e44))

### 📖 Documentation

- Update documentation links to the correct path ([e2c9097](https://github.com/clifordpereira/nuxt-auto-crud/commit/e2c9097))

### 🏡 Chore

- **release:** V1.16.1 ([7f74e59](https://github.com/clifordpereira/nuxt-auto-crud/commit/7f74e59))
- Relocate Google Analytics script configuration. ([b41f40d](https://github.com/clifordpereira/nuxt-auto-crud/commit/b41f40d))

### ❤️ Contributors

- Cliford Pereira ([@clifordpereira](https://github.com/clifordpereira))

## v1.16.1

[compare changes](https://github.com/clifordpereira/nuxt-auto-crud/compare/v1.16.0...v1.16.1)

## v1.16.0

[compare changes](https://github.com/clifordpereira/nuxt-auto-crud/compare/v1.15.2...v1.16.0)

### 🚀 Enhancements

- Simplify resource configuration and access control by consolidating into nuxt.config.ts and removing external config files. ([cb06dac](https://github.com/clifordpereira/nuxt-auto-crud/commit/cb06dac))

### 📖 Documentation

- Update module status to Beta, clarify public view configuration, and update dev dependencies. ([7bdc4ae](https://github.com/clifordpereira/nuxt-auto-crud/commit/7bdc4ae))

### 🏡 Chore

- Remove unnecessary blank lines from module and handler files. ([03f1da2](https://github.com/clifordpereira/nuxt-auto-crud/commit/03f1da2))

### ❤️ Contributors

- Cliford Pereira ([@clifordpereira](https://github.com/clifordpereira))

## v1.15.2

[compare changes](https://github.com/clifordpereira/nuxt-auto-crud/compare/v1.15.0...v1.15.2)

### 🏡 Chore

- **release:** V1.15.1 ([a2cfd52](https://github.com/clifordpereira/nuxt-auto-crud/commit/a2cfd52))
- Remove redundant `no-unused-vars` eslint disable from ability logic. ([163ebe7](https://github.com/clifordpereira/nuxt-auto-crud/commit/163ebe7))

### ❤️ Contributors

- Cliford Pereira ([@clifordpereira](https://github.com/clifordpereira))

## v1.15.1

[compare changes](https://github.com/clifordpereira/nuxt-auto-crud/compare/v1.15.0...v1.15.1)

## v1.15.0

[compare changes](https://github.com/clifordpereira/nuxt-auto-crud/compare/v1.14.1...v1.15.0)

### 🚀 Enhancements

- Implement status-based filtering and `list_all` permission for generic API endpoints, removing explicit `statusField` from schemas and dedicated active-item endpoints. ([fc97b04](https://github.com/clifordpereira/nuxt-auto-crud/commit/fc97b04))
- Implement public permissions logic, add new quick start and public permissions blog posts, and refine type safety. ([75bad6a](https://github.com/clifordpereira/nuxt-auto-crud/commit/75bad6a))
- Add testimonials table and refactor ability definition. ([595b0c5](https://github.com/clifordpereira/nuxt-auto-crud/commit/595b0c5))

### 📖 Documentation

- Add relationships and deployment guides, clarify `status` field behavior, and update pricing content. ([8d173f8](https://github.com/clifordpereira/nuxt-auto-crud/commit/8d173f8))
- Update pricing FAQ content to refer to documentation, footer, and direct contact for links and information. ([d82aabe](https://github.com/clifordpereira/nuxt-auto-crud/commit/d82aabe))

### 🏡 Chore

- Suppress ESLint warnings for unused parameters and any types in `abilityLogic` test fixture. ([fe0635a](https://github.com/clifordpereira/nuxt-auto-crud/commit/fe0635a))

### ❤️ Contributors

- Cliford Pereira ([@clifordpereira](https://github.com/clifordpereira))

## v1.14.1

[compare changes](https://github.com/clifordpereira/nuxt-auto-crud/compare/v1.14.0...v1.14.1)

## v1.14.0

[compare changes](https://github.com/clifordpereira/nuxt-auto-crud/compare/v1.13.0...v1.14.0)

### 🚀 Enhancements

- Implement comprehensive playground site with new content, pages, components, layouts, and database migrations. ([bec04a6](https://github.com/clifordpereira/nuxt-auto-crud/commit/bec04a6))
- Implement admin dashboard with user count and remove old dashboard and generic resource pages ([5802f8c](https://github.com/clifordpereira/nuxt-auto-crud/commit/5802f8c))
- Enhance Nuxt, Nitro, Hub, and AutoCRUD configurations, update content schemas, and apply minor formatting adjustments. ([0f166c3](https://github.com/clifordpereira/nuxt-auto-crud/commit/0f166c3))
- Enhance homepage content with code examples, demo login details, and updated section features, supported by UI and content schema changes. ([704b167](https://github.com/clifordpereira/nuxt-auto-crud/commit/704b167))
- Update blog content by replacing existing articles with new ones. ([db46474](https://github.com/clifordpereira/nuxt-auto-crud/commit/db46474))
- Remove external authentication provider integration and signup link from authentication forms. ([3179951](https://github.com/clifordpereira/nuxt-auto-crud/commit/3179951))
- Add resource-based permissions management with dedicated UI and ability checks for CRUD operations. ([5dc2f8e](https://github.com/clifordpereira/nuxt-auto-crud/commit/5dc2f8e))
- Add 'Manage Permissions' section with image display support and update footer branding. ([5dacfda](https://github.com/clifordpereira/nuxt-auto-crud/commit/5dacfda))
- Implement newsletter subscription with new schema, API endpoint, and refined guest authorization. ([f43011a](https://github.com/clifordpereira/nuxt-auto-crud/commit/f43011a))
- Introduce testimonials feature with database schema, API endpoint, and UI component, and refine permission checks and form validation. ([f8f14a7](https://github.com/clifordpereira/nuxt-auto-crud/commit/f8f14a7))

### 💅 Refactors

- Update public permissions API endpoint path ([6aa594c](https://github.com/clifordpereira/nuxt-auto-crud/commit/6aa594c))
- Reorganize changelog entries from descriptive names to version-based files and update content configuration. ([ae64643](https://github.com/clifordpereira/nuxt-auto-crud/commit/ae64643))
- Remove unused `abilityLogic` import and simplify guest authorization check. ([60bf71c](https://github.com/clifordpereira/nuxt-auto-crud/commit/60bf71c))

### 📖 Documentation

- Add real-world recipes for newsletter subscription and testimonials system. ([b960207](https://github.com/clifordpereira/nuxt-auto-crud/commit/b960207))

### 🏡 Chore

- Update database migration metadata. ([f52baff](https://github.com/clifordpereira/nuxt-auto-crud/commit/f52baff))
- Update dependencies, introduce Bun lockfile, and improve type safety and linting. ([76c0237](https://github.com/clifordpereira/nuxt-auto-crud/commit/76c0237))

### ❤️ Contributors

- Cliford Pereira <cliford.pereira@gmail.com>

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
