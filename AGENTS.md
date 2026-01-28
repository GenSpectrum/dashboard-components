# AGENTS.md

This file contains guidelines for agentic coding agents working on this repository.

## Project Overview

GenSpectrum Dashboards Components is a collection of web components for building interactive dashboards
that visualize data from [LAPIS](https://github.com/GenSpectrum/LAPIS) instances.
The main package is published to npm as `@genspectrum/dashboard-components`.

All component code lives in the `/components/` directory.
The root package.json is minimal and only used for tooling (commitlint, release-please).

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

### Installation

```bash
npm ci                           # Install dependencies
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

### Development

```bash
# Generate custom elements manifest (required before starting Storybook)
npm run generate-manifest

# Start Lit Storybook (public documentation, port 6006)
npm run storybook

# Start Preact Storybook (development & testing, port 6007)
npm run storybook-preact

# Watch mode for manifest generation
npm run generate-manifest:watch
```

### Test
```bash
# Unit tests
npm run test

# Storybook interaction tests (requires Storybook to be running)
npm run test:storybook          # Lit Storybook
npm run test:storybook:preact   # Preact Storybook

# Playwright tests (visual regression, CSV snapshots)
npm run test:playwright
npm run test:playwright:update-snapshots  # Update snapshots
```


## Architecture

### Three-Layer Component Architecture

The codebase uses a unique three-layer architecture that combines Preact and Lit:

1. **Preact Components** (`/src/preact/`) - Internal implementation layer
    - Contains all business logic, state management, and UI rendering
    - Written using Preact hooks and functional components
    - Validated with Zod schemas
    - Tested in Preact Storybook (port 6007)

2. **PreactLitAdapter** (`/src/web-components/PreactLitAdapter.tsx`) - Bridge layer
    - Base class that extends Lit's `ReactiveElement`
    - Renders Preact components into Lit's shadow DOM using Preact's `render()`
    - Injects context (LAPIS URL, reference genome) via Lit Context API
    - Handles CSS injection (Tailwind, DaisyUI, GridJS)
    - Variants: `PreactLitAdapter` (base), `PreactLitAdapterWithGridJsStyles` (with table styles)

3. **Lit Web Components** (`/src/web-components/`) - Public API layer
    - Standards-compliant web components registered as custom elements
    - Use Lit decorators (`@customElement`, `@property`)
    - Each property mirrors the Preact component's props exactly
    - Documented in Lit Storybook (port 6006), which is deployed to GitHub pages

**Why this pattern?** Preact provides excellent DX with hooks, while Lit provides standards-compliant web components that work anywhere.

### Directory Structure

```
/src/
├── web-components/          # Lit web component wrappers (public API)
│   ├── visualization/       # Charts, tables, data visualizations
│   ├── input/              # Filter and input components
│   └── wastewaterVisualization/  # Specialized wastewater components
├── preact/                 # Preact component implementations (internal)
│   ├── components/         # Shared UI components
│   ├── shared/            # Shared utilities and helpers
│   └── [domain-folders]/  # Domain-specific components
├── operator/              # Data transformation pipeline operators
├── query/                 # Query composition functions
├── lapisApi/              # LAPIS backend API client
├── utils/                 # General utilities
└── styles/                # Tailwind CSS configuration
```

### Operator Pattern (Data Transformation Pipeline)

The `/operator/` directory contains a composable data transformation pipeline inspired by functional programming:

```typescript
interface Operator<T> {
    evaluate(lapis: string, signal?: AbortSignal): Promise<Dataset<T>>;
}
```

**Key operators:**
- `FetchAggregatedOperator`, `FetchDetailsOperator`, `FetchInsertionsOperator`, `FetchSubstitutionsOrDeletionsOperator` - Fetch from LAPIS
- `MapOperator` - Transform each item (like Array.map)
- `DivisionOperator` - Join two datasets and divide values (for prevalence)
- `GroupByOperator`, `GroupByAndSumOperator` - Group and aggregate data
- `SortOperator` - Sort dataset
- `FillMissingOperator` - Fill missing data points (e.g., dates with no data)
- `SlidingOperator` - Sliding window aggregation (for smoothing)
- `RenameFieldOperator` - Rename fields

**Usage:** Query functions in `/query/` compose operators into pipelines. Operators are lazy (nothing executes until `evaluate()` is called) and support abort signals for cancellation.

### Data Flow

```
User Interaction
    ↓
Web Component (Lit) receives props
    ↓
PreactLitAdapter renders Preact component
    ↓
Preact component uses useQuery hook
    ↓
Query function composes Operators
    ↓
Operator pipeline evaluates against LAPIS
    ↓
Data flows back through pipeline transformations
    ↓
Preact component renders with data
    ↓
Displayed in shadow DOM
```

### Event System

Input components fire custom events (e.g., `gs-location-changed`) that bubble through the DOM. Dashboard maintainers wire these events to update visualization component props. This keeps inputs decoupled from visualizations.

### Context Injection

The `gs-app` component provides global context (LAPIS URL, reference genome, mutation annotations) using Lit's Context API. Child components consume this context via `@consume` decorator (Lit) or `useContext` (Preact).

## Build System

### Two Build Outputs

**vite.release.config.ts** - Library build:
- Entry points: `components` (browser) and `util` (Node.js compatible)
- ES modules only
- Dependencies are external (not bundled)
- Generates TypeScript declarations
- No minification (left to consumers)

**vite.release-standalone.config.ts** - Standalone build:
- Bundles ALL dependencies into single file
- For use without package manager (CDN, unpkg)
- Output: `/standalone-bundle/dashboard-components.js`

### Package Exports

```json
"exports": {
  "./components": "./dist/components.js",  // Web components (browser only)
  "./util": "./dist/util.js"               // Utilities (Node.js compatible)
}
```

## Testing Strategy

- **Unit tests** (Vitest): Domain logic in operators, utilities, and helper functions
- **Preact Storybook interaction tests**: Detailed component testing with user interactions (port 6007)
- **Lit Storybook smoke tests**: Ensure web component build works (port 6006)
- **Playwright tests**: Visual regression (screenshots) and CSV download snapshots

**Important:** All tests use mocked data. Stories must not issue actual HTTP calls to LAPIS to ensure stable tests in CI.

## Styling Conventions

- Use **Tailwind CSS** and **DaisyUI** classes whenever possible
- Only use custom CSS if Tailwind/DaisyUI don't work for your use case
- **Never** import CSS files like `import './my-component.css'` - this generates unwanted CSS files in the build output
- Instead, apply CSS via Lit's `static styles` field
- Tailwind classes cannot be generated dynamically (Tailwind scans code at build time)

## Commit Conventions

This repo uses [Conventional Commits](https://www.conventionalcommits.org/) for automated releases via [Release Please](https://github.com/google-github-actions/release-please-action).

**PR titles must follow this format** (we squash-merge, so only the PR title matters):

- `feat(components): add new component` - New minor version
- `fix(components): fix bug` - New patch version
- Breaking changes require a footer:
  ```
  feat(components): change API

  BREAKING CHANGE: describe the breaking change
  ```

**Valid scopes:** `components`, `examples`, `github-actions`, `root`

**Important:** If a `feat` or `fix` commit edits files in `components/`, it will appear in the changelog. Don't edit `components/` files in commits you don't want in the release notes.

## Development Workflow

1. Develop Preact component in Preact Storybook (port 6007)
2. Write interaction tests in Storybook stories
3. Create Lit wrapper extending `PreactLitAdapter` or `PreactLitAdapterWithGridJsStyles`
4. Mirror all Preact props as Lit `@property` decorated properties
5. Add to Lit Storybook (port 6006) with basic documentation stories
6. Document with JSDoc for custom elements manifest generation
7. Run Playwright tests for visual regression

## Adding New Components

When adding code for package users:

1. **For web components:** Export from `/src/componentsEntrypoint.ts`
2. **For utilities/types:** Export from `/src/utilEntrypoint.ts`
3. Ensure it's included in the `"files"` field of package.json
4. Generate manifest: `npm run generate-manifest`
5. Update Lit Storybook with documentation

## Naming Conventions

- Component names: `gs-` prefix (GenSpectrum)
- Event names: Defined in `gsEventNames` constant
- Mutation types: `nucleotide` vs `amino acid`
- Temporal granularities: `day`, `week`, `month`, `year`
