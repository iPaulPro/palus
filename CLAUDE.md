# CLAUDE.md

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

## 5. Project-specific Guidelines

### Tech Stack

The user may ask about any of these technologies:

- ReactJS
- Vite
- JavaScript
- TypeScript
- HeadlessUI
- TailwindCSS
- HTML
- CSS
- Apollo GraphQL
- Radix
- Hono
- Zod
- Zustand
- Prosekit
- Remark and Rehype
- shadcn/ui

### Code Implementation Guidelines

Follow these rules when writing code:

- Use early returns whenever possible to improve readability.
- In React, always export the default component at the end of the file.
- Style elements only with Tailwind classes; do not use CSS or style tags.
- Use descriptive names for variables and functions. Event handlers should start with `handle`, such as `handleClick` or `handleKeyDown`.
- Add accessibility attributes to interactive elements. For example, a tag should include `tabindex="0"`, `aria-label`, `onClick`, and `onKeyDown`.
- Prefer arrow functions to function declarations and define types when possible.

### Monorepo Management

- Use pnpm workspaces for managing the monorepo.
- Keep packages isolated and manage dependencies carefully.
- Share configurations and scripts where appropriate.
- Follow the workspace structure defined in the root `package.json`.

### Error Handling and Validation

- Handle errors and edge cases first.
- Use early returns for error conditions to avoid nesting.
- Apply guard clauses to manage invalid states early.
- Provide clear error logging and user-friendly messages.
- Use custom error types or factories for consistency.

### State Management and Data Fetching

- Use Zustand for state management.
- Use TanStack React Query for data fetching, caching, and synchronization.
- Use Apollo Client for GraphQL operations.
- Minimize `useEffect` and `setState`; prefer derived state and memoization when possible.

### TypeScript and Zod Usage

- Use TypeScript throughout the codebase; prefer interfaces for object shapes.
- Name interfaces after their component. For example, `Account` should use `AccountProps`.
- Use Zod for schema validation and type inference.
- Avoid enums; prefer literal types or maps.
- Write functional components with TypeScript interfaces for props.

### Code Style and Structure

- Write concise TypeScript code with accurate examples.
- Use functional and declarative patterns; avoid classes.
- Prefer iteration and modularization to avoid duplication.
- Use camelCase for variables and functions.
- Use uppercase for environment variables.
- Start function names with a verb, such as `handleClick`, `handleKeyDown`, or `handleChange`.
- Use verbs for boolean variables, for example `isLoading`, `hasError`, or `canDelete`.
- Spell out words fully and use correct spelling.
- Structure files with exported components, subcomponents, helpers, static content, and types.

### References

- [Lens Protocol Docs](https://lens.xyz/docs/protocol)
- [Grove Storage Docs](https://lens.xyz/docs/storage)
