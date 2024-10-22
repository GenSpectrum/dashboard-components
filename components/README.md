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
        import '@genspectrum/dashboard-components';
        import '@genspectrum/dashboard-components/style.css';
    </script>
    <gs-app lapis="https://your.lapis.url"></gs-app>
</body>
```

We also provide a standalone version of the components that can be used without installing the dependencies:

```html
<html>
    <head>
        <script
            type="module"
            src="https://unpkg.com/@genspectrum/dashboard-components@latest/standalone-bundle/dashboard-components.js"
        ></script>
        <link rel="stylesheet" href="https://unpkg.com/@genspectrum/dashboard-components@latest/dist/style.css" />
    </head>
    <body>
        <gs-app lapis="https://your.lapis.url"></gs-app>
    </body>
</html>
```

### Core Concepts

Internally, the components use [Preact](https://preactjs.com/).
We use [Lit](https://lit.dev/) to create web components.

We primarily provide two kinds of components:

-   **Visualization components** (charts, tables, etc.)
    -   Those components fetch data from the LAPIS instance and visualize it.
-   **Input components** that let you specify sequence filters for the LAPIS requests.
    -   Input changes will fire events that can be listened to by the visualization components.
        It is the responsibility of the dashbaord maintainer to listen to those events
        and to wire the data correctly into the visualization components.

## Local Development

#### Installation

```bash
npm ci
```

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
The Storybook on port 6007 uses the Preact build.
The Storybook on port 6006 uses the Lit build and includes the Preact Storybook.
Note that some Storybook integrations (such as interaction tests) do not work in the included Storybook.
We only deploy the Lit part of the Storybook to GitHub pages.

Storybook offers an integration of the custom-elements.json that can generate doc pages for the web components.
Refer to the
[Custom Elements Manifest Docs](https://custom-elements-manifest.open-wc.org/analyzer/getting-started/#documenting-your-components)
for how to document the components using JSDoc.

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

-   Domain logic is tested with unit tests. Thus, that code should be kept separate from the components.
-   Detailed tests of the components are done with interaction tests in the Preact Storybook.
-   The Lit Storybook only contains tests for the most important functionality to ensure that the web component build
    works.
-   We use Playwright for
    -   snapshot tests of the visualization components:
        -   Screenshots of charts and tables that serve as visual regression.
        -   Snapshots of the CSV data that the visualization components offer as download.
    -   testing functionality of components that cannot be tested within Storybook due to technical limitations.

#### Mocking

All our tests use mock data. In general, we use `storybook-addon-fetch-mock` for all outgoing requests. This strategy cannot be used for components that use web workers, like gs-mutations-over-time. Therefore, we created custom mock workers that return mocked data. The mock workers are enabled in the package.json using Node.js [subpath imports](https://nodejs.org/api/packages.html#subpath-imports), following the guide from [storybook](https://storybook.js.org/docs/writing-stories/mocking-data-and-modules/mocking-modules). This ensures that when importing the worker in the component, the mock worker is used inside Storybook instead of the real worker.
