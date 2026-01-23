# AGENTS.md

This file contains guidelines for agentic coding agents working on this repository.

## Tech Stack

- TypeScript + Lit web components (with Preact for internal components)
- Build: Vite
- Testing: Vitest, Playwright, Storybook
- Styling: TailwindCSS 4 + DaisyUI
- Maps: chartjs, Leaflet
- Utilities: Dayjs, Zod
- Package Manager: npm

## Build / Lint / Test Commands

All commands should be run from the `components/` directory:

```bash
cd components
```

### Build
```bash
npm run build                    # Full build (dist + standalone bundle)
```

### Lint
```bash
npm run lint                     # Run lit-analyzer + eslint
npm run lint:eslint              # ESLint only
npm run lint:lit-analyzer        # Lit analyzer only
npm run check-types              # TypeScript type checking (no emit)
npm run check-format             # Prettier check
npm run format                   # Format code with Prettier
```

### Test
```bash
npm test                         # Run all tests (typechecked)
# Run single test file:
npx vitest path/to/test.spec.ts --typecheck
# Run single test file in watch mode:
npx vitest path/to/test.spec.ts --typecheck --watch
```

### Storybook
```bash
npm run storybook                # Start Storybook (web-components, port 6006)
npm run storybook-preact         # Start Preact Storybook (port 6007)
npm run test:storybook           # Test Storybook stories
npm run test:storybook:preact    # Test Preact Storybook stories
```

## Code Style Guidelines

### Import Organization
Imports are auto-sorted by ESLint in alphabetical order by group:
1. Built-in modules
2. External npm packages
3. Internal modules (this project)
4. Groups separated by blank line

Use inline type imports: `import { type Foo } from 'bar'`

### Naming Conventions
- Web components: kebab-case with `gs-` prefix (e.g., `gs-lineage-filter.ts`)
- Lit component classes: PascalCase suffix `Component` (e.g., `LineageFilterComponent`)
- Preact components: PascalCase (e.g., `MutationFilter.tsx`)
- Functions: camelCase
- Constants: UPPER_SNAKE_CASE or camelCase depending on scope
- Files with type-only exports: `.spec-d.ts` extension
- Story files: `.stories.ts` or `.stories.tsx` extension

### TypeScript
- Strict mode enabled with `noImplicitAny`, `strictNullChecks`
- Always use `type` for type imports when importing only types
- Use Zod schemas for runtime validation where input comes from external sources
- Declare global interfaces in `componentsEntrypoint.ts` as needed
- Use `FunctionComponent<T>` type for Preact components

### Lit Components
- Use decorators: `@customElement('gs-name')`, `@property()`, `@provide()`
- Extend `LitElement`, override `render()` with `html` template
- Use Lit Context (`@lit/context`) for dependency injection
- Most components use light DOM (override `createRenderRoot()` to return `this`)
- Export types separately in Preact modules, consume in Lit wrappers

### Preact Components
- Use `function` syntax, not class components
- Hooks: `useContext`, `useState`, `useEffect`, `useMemo`, `useRef`
- Event dispatch: `dispatchEvent(new CustomEvent<T>(eventName, { detail, bubbles, composed }))`
- Wrap components in `ErrorBoundary` with schema validation
- Props should have corresponding Zod schema validation

### Formatting (Prettier)
- Print width: 120 chars
- Tab width: 4 spaces
- Single quotes, semicolons required
- Trailing commas: all

### Error Handling
- Use `UserFacingError` for errors shown to users
- Wrap components in `ErrorBoundary` for error boundaries
- Validate props of web components as soon as they enter a Preact component and results from API calls with Zod schemas