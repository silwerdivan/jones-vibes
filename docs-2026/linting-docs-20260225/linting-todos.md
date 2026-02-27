# Linting & Code Quality Roadmap (2026-02-25)

## Overview
Current project state uses TypeScript with strict mode but lacks automated style enforcement and deep static analysis.

## Recommended Actions

### 1. Automated Code Formatting (Prettier)
- **Goal:** Ensure 100% consistent code style across the project.
- **Action:** Add `.prettierrc` and integrate with editor/CI.

### 2. Static Analysis & Best Practices (ESLint)
- **Goal:** Catch logical pitfalls and architectural smells (e.g., `any` usage).
- **Action:** Install `eslint` with `@typescript-eslint/recommended`.

### 3. Commit Gatekeeping (Husky & lint-staged)
- **Goal:** Prevent "dirty" code from entering the repository.
- **Action:** Use `husky` to run checks on staged files before commit.

### 4. CSS Linting (Stylelint)
- **Goal:** Maintain consistency and catch bugs in `style.css`.
- **Action:** Add `stylelint` with standard configuration.

### 5. CI/CD Enforcement
- **Goal:** Validate quality on every push.
- **Action:** Add `npm run lint` step to GitHub Actions.

### 6. Documentation Quality (Markdownlint)
- **Goal:** Keep documentation professional and readable.
- **Action:** Integrate markdownlint for `.md` files.

### 7. Import Organization
- **Goal:** Automated sorting of imports for clarity and fewer merge conflicts.
- **Action:** Add `eslint-plugin-simple-import-sort`.

### 8. Editor Consistency (EditorConfig)
- **Goal:** Set base editor rules (tabs, spaces, line endings).
- **Action:** Add `.editorconfig`.
