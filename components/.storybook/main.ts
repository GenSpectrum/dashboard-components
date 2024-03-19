import type { StorybookConfig } from '@storybook/web-components-vite';

const refs: any =
    process.env.DISABLE_PREACT_STORYBOOK === 'true'
        ? {}
        : {
              preact: {
                  title: 'Preact',
                  url: 'http://localhost:6007',
              },
          };

const config: StorybookConfig = {
    stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|mjs|ts)'],
    addons: [
        '@storybook/addon-links',
        '@storybook/addon-essentials',
        '@storybook/addon-interactions',
        'storybook-addon-fetch-mock',
    ],
    framework: {
        name: '@storybook/web-components-vite',
        options: {},
    },
    docs: {
        autodocs: 'tag',
    },
    refs,
};
export default config;
