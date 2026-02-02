---
description: Project specific rules and memory for Ollama Desktop Pro
---

# Project Rules

- In order to prevent repeating the past failure, if you find a way to solve a problem that you repeatedly failed, record it in rules.md.

- **Bash Commands**: Do NOT execute bash commands directly using `run_command` or similar tools. Instead, provide the commands to the user in the chat so they can execute them manually.
- **Environment Setup**: The user will handle the initial environment setup and dependency installation.
- **Tailwind CSS v4 Setup**: 
    - If `npx tailwindcss init -p` fails with "could not determine executable", avoid using the CLI for initialization.
    - **PostCSS Compatibility**: Tailwind v4 requires the `@tailwindcss/postcss` package to work as a PostCSS plugin.
    - Manually create `tailwind.config.js` and `postcss.config.js` in the project root.
    - In `postcss.config.js`, use `@tailwindcss/postcss` instead of `tailwindcss`.
    - Manually add `@tailwind base;`, `@tailwind components;`, and `@tailwind utilities;` to the main CSS file (e.g., `src/index.css`).
    - Ensure the CSS file is imported in the entry point (e.g., `src/main.tsx`).

- **Native Modules (e.g., better-sqlite3)**:
    - **Mark as External**: In `vite.config.ts`, always mark native modules (like `better-sqlite3`) as `external` within the `electron` plugin's `main` configuration.
    - **Rebuild Required**: If a `NODE_MODULE_VERSION` mismatch occurs, installation of `electron-rebuild` and running it (e.g., `npx electron-rebuild -f -w better-sqlite3`) is mandatory.
    - **Import Method**: Use `createRequire(import.meta.url)` in ESM files to load native modules that have issues with standard ESM imports.

- **ESM Compatibility in Main Process**:
    - **__filename & __dirname**: Since these are not available in ESM, define them manually using `fileURLToPath(import.meta.url)` and `path.dirname`.
    - **Global Shims**: For dependencies that expect these variables globally, assign them to `globalThis`:
      ```typescript
      const __filename = fileURLToPath(import.meta.url)
      const __dirname = path.dirname(__filename)
      globalThis.__filename = __filename
      globalThis.__dirname = __dirname
      ```
