# Antigravity Workspace Rules: nuxt-auto-crud

## 1. Workspace Mapping
- **Core Module Logic:** Stored in `src/runtime/server/api/[model]/`. (Backend logic ONLY).
- **Reference Implementation:** The `playground/` folder is the only source for frontend/fullstack logic.
- **Service Example:** `playground-backend/` is a standalone API service example. We rarely modify this.

## 2. Default Context Inference (Implicit Scope)
Even if I fail to mention the context in my prompt, follow these defaults:
- **Frontend/UI Task:** Default to `playground/`. 
    - Within `playground/`, prioritize `app/components/crud/`. 
    - Do not scan other folders or `content/*` without asking.
- **API/Core Logic Task:** Default to `src/runtime/server/api/[model]/`.

## 3. Strict Folder Boundaries (Token Optimization)
- **playground-backend:** NEVER analyze or index this directory without my explicit consent.
- **nuxt-auto-crud (Module):** This is a saturated/stable module. 
    - Do NOT access or update folders outside of `src/` (e.g., config, build scripts) without permission.
- **Content:** Do not modify `content/*` files unless explicitly @mentioned.

## 4. Operational Instructions
- When a task involves the frontend, inform me before expanding analysis beyond the `app/components/crud/` directory.
- Prioritize **Gemini 3 Flash** as the engine for these rules to ensure high speed and low token consumption.
