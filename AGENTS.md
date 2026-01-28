# AGENTS.md

This file contains guidelines for agentic coding agents working on this repository.

## Project Overview

GenSpectrum Dashboards Components is a collection of web components for building interactive dashboards
that visualize data from [LAPIS](https://github.com/GenSpectrum/LAPIS) instances.
The main package is published to npm as `@genspectrum/dashboard-components`.

All component code lives in the `/components/` directory.
Refer to [components/AGENTS.md](./components/AGENTS.md) for specific guidelines related to the components package.
The root package.json is minimal and only used for tooling (commitlint, release-please).

`./examples/` contains example projects demonstrating usage of the components package.
There are currently two examples: one that uses vanilla JavaScript and another that uses React.

## Commit Conventions

This repo uses [Conventional Commits](https://www.conventionalcommits.org/) for automated releases via
[Release Please](https://github.com/google-github-actions/release-please-action).

**PR titles must follow this format** (we squash-merge, so only the PR title matters):

- `feat(components): add new component` - New minor version
- `fix(components): fix bug` - New patch version
- Breaking changes require a footer:
  ```
  feat(components): change API

  BREAKING CHANGE: describe the breaking change
  ```

**Valid scopes:** `components`, `examples`, `github-actions`, `root`

**Important:** If a `feat` or `fix` commit edits files in `components/`, it will appear in the changelog.
Don't edit `components/` files in commits you don't want in the release notes.
