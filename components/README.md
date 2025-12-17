# GenSpectrum Components

### npm

To install the package, run:

```bash
npm i @genspectrum/dashboard-components
```

Usage with a bundler in HTML:

```html
<body>
    <script>
        import '@genspectrum/dashboard-components/components';
    </script>
    <gs-app lapis="https://your.lapis.url"></gs-app>
</body>
```

**Note for vite (and potentially other bundlers) users**:
There is currently an issue with one of our peer dependencies: leaflet.
Vite will use the commonjs style of leaflet, which will create an error, when you run it in the browser.
`Uncaught SyntaxError: The requested module ... doesn't provide an export named: 'geoJson'`
To fix this add the following to your `vite.config.js`:

```js
optimizeDeps: {
    include: ['leaflet'];
}
```

We also provide a standalone version of the components that can be used without installing the dependencies:

```html
<html>
    <head>
        <script
            type="module"
            src="https://unpkg.com/@genspectrum/dashboard-components@latest/standalone-bundle/dashboard-components.js"
        ></script>
    </head>
    <body>
        <gs-app lapis="https://your.lapis.url"></gs-app>
    </body>
</html>
```

### Core Concepts

Internally, the components use [Preact](https://preactjs.com/).
We use [Lit](https://lit.dev/) to create web components.

We have split the package into two parts:

- The web components that can be used in the browser.
    - They can be imported with `import '@genspectrum/dashboard-components/components';`
    - Note that this imports all components at once. The `import` statement will make the web components available in the browser.
- Utility functions, types and constants which can also be used in a node environment.
    - They can be imported with `import '@genspectrum/dashboard-components/util';`

We primarily provide two kinds of components:

- **Visualization components** (charts, tables, etc.)
    - Those components fetch data from the LAPIS instance and visualize it.
- **Input components** that let you specify sequence filters for the LAPIS requests.
    - Input changes will fire events that can be listened to by the visualization components.
      It is the responsibility of the dashboard maintainer to listen to those events
      and to wire the data correctly into the visualization components.

## Local Development

#### Installation

```bash
npm ci
```

> [!NOTE]  
> **For Mac users**: By default, the `package-lock.json` installs linux dependencies for the
> storybook test runner. To use it, you need to reinstall it:
>
> ```
> npm uninstall @storybook/test-runner
> npm install @storybook/test-runner --force
> ```

### Custom Elements Manifest

This package also ships a [Custom Elements Manifest](https://custom-elements-manifest.open-wc.org/),
which is a formal specification of the web components.
We use the `@custom-elements-manifest/analyzer` to autogenerate the `custom-elements.json` file:

```bash
npm run generate-manifest
```

or in watch mode:

```bash
npm run generate-manifest:watch
```

### Storybook

We use Storybook to develop our components.

To start Storybook, run (`npm run generate-manifest` makes sure to generate the `custom-elements.json` first):

```bash
npm run generate-manifest
npm run storybook-preact
npm run storybook
```

Then, open http://localhost:6006/ and http://localhost:6007/ in your browser.

The Storybook on port 6006 uses the Lit build.
Its purpose is public documentation and live demonstration of the publicly available web components.
It should focus on stories that are relevant for users of the components.
This storybook is deployed to GitHub pages.

Every web component should have a separate "Docs" page.
Storybook offers an integration of the custom-elements.json that can generate doc pages for the web components.
Refer to the
[Custom Elements Manifest Docs](https://custom-elements-manifest.open-wc.org/analyzer/getting-started/#documenting-your-components)
for how to document the components using JSDoc.

The Storybook on port 6007 uses the Preact build.
Its purpose is to test the components in a Preact environment.
It is not meant to be used outside the development environment
and contains many stories that are not relevant for the public (e.g. because they serve as a unit test for some edge case).
It should contain stories and corresponding unit tests for every Preact component that is relevant in a wider context
(either because it is a top level component that is also exposed as a web component
or because it is supposed to be reusable in other components).

### Testing

We use vitest to run our unit tests:

```bash
npm run test
```

We use Storybook and Playwright to test the components in the browser:

```bash
npm run test:storybook
npm run test:storybook:preact
npm run test:playwright
```

This assumes that the Storybooks are running.

We follow this testing concept:

- Domain logic is tested with unit tests. Thus, that code should be kept separate from the components.
- Detailed tests of the components are done with interaction tests in the Preact Storybook.
- The Lit Storybook only contains tests for the most important functionality to ensure that the web component build
  works.
- We use Playwright for
    - snapshot tests of the visualization components:
        - Screenshots of charts and tables that serve as visual regression.
        - Snapshots of the CSV data that the visualization components offer as download.
    - testing functionality of components that cannot be tested within Storybook due to technical limitations.

#### Mocking

All our tests use mock data.
Make sure that stories don't issue actual HTTP calls to LAPIS or other services.
This is to make sure that we have stable tests in CI that don't depend on the availability of other services.
We still use the real LAPIS URL so that a user can change the filters in a story and will still see data.

### How The Release Build Works

The `"exports"` field in `package.json` defines which files a user of the package can import using the normal module systems.
`"files"` defines which files are included in the package when it is published to npm.
Obviously, `"files"` must include everything that is referenced in `"exports"`,
but we also include `src/` for best practice so that users can see non-built files if they want to.

We use Vite to build the entry point files that are referenced in `"exports"`: [vite.release.config.ts](./vite.release.config.ts).
Important points to note:

- We need to build the code since we need to convert TypeScript to JavaScript.
- We also include type declarations.
- We do not minify the code. That's up to the user of the package.
- We exclude dependencies. Users should download them via their own package manager. Our libraries should not be in the build output.
- We also build a ["standalone" version](vite.release-standalone.config.ts) of the components that includes all dependencies.
  This can be used without a package manager (and it's not supposed to be used if you are using a package manager).

If you add code that's supposed to be used by the users of the package,
you need to make sure that it is exported from one of the entry points defined in `"exports"`.
Currently, we have two entry points:

- [components](src/componentsEntrypoint.ts): Supposed to be used in the browser. This file registers all web components when it's imported.
- [util](src/utilEntrypoint.ts): Can also be used in a non-browser environment. Exports some code and types so that users can reuse some of our logic.
