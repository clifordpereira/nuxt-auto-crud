---
trigger: always_on
glob: "**/*"
description: "Architecture and directory boundaries for NAC Interface, prioritizing runtime reflection and Playground-as-Template logic."
---

# Antigravity Workspace Rules: nuxt-auto-crud

## 1. CAM Local Mapping (Interface & Playground)
- **Interface (Core):** `src/`. Logic stored in `src/runtime/server/api/[model]/` (Backend ONLY).
- **Abstract Class (Internal):** `playground/`. The only source for frontend/fullstack logic.
- **The Sync Rule:** `playground/` is the internal mirror of the `auto-crud.clifland.in` template. 
    - Logic is identical. 
    - `playground/nuxt.config.ts` uses `../src/module`; the external Template uses `nuxt-auto-crud`.

## 2. Default Context Inference (Implicit Scope)
- **Frontend/UI Task:** Default to `playground/`. Prioritize `playground/app/components/crud/`. Do not scan other folders without asking.
- **API/Core Logic Task:** Default to `src/runtime/server/api/[model]/`.
- **Constraint:** Do not scan `content/*` unless explicitly @mentioned.

## 3. Strict Folder Boundaries (Token Optimization)
- **playground-backend:** (Service Example) NEVER analyze or index this directory without explicit consent.
- **Module Satiety:** `nuxt-auto-crud` is a saturated/stable module. Do NOT access or update folders outside of `src/` (e.g., config, build scripts) without permission.

## 4. Architectural Guardrails (CAM)
- **Interface Stability:** Ensure `src/` logic remains strictly generic and environment-agnostic. No Concrete/App-specific business logic leaks.
- **Reflective Intelligence:** Prioritize runtime reflection over hardcoded schemas.
- **Agentic Context:** Maintain `.ai-context.md` in the module as the technical specification for how the Interface handles reflection.

## 5. Operational Instructions
- Inform me before expanding analysis beyond `playground/app/components/crud/` for frontend tasks.
- Prioritize **Gemini 3 Flash** for high speed and low token consumption.