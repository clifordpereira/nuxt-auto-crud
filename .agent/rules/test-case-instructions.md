---
trigger: always_on
glob: "**/*"
description: "Instructions for creating test cases for both the core module and the playground/template."
---

# Instructions for creating tests

## Core Module (nuxt-auto-crud)

Scope: Unit and integration tests for runtime reflection, Drizzle-Zod schema parsing, and Nitro middleware logic.

Objective: Validate the mechanics of the Auto-CRUD engine (e.g., endpoint generation, and field visibility constraints).

Location: /tests

## Template/Playground

Scope: E2E and functional flow tests.

Objective: Validate the Concrete Class behavior. Since this playground mirrors the nuxt-auto-crud_template, these tests serve as the baseline regression suite for all derived multi-instance applications.

Location: /playground/tests
