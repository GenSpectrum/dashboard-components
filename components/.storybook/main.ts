import type { StorybookConfig } from '@storybook/web-components-vite';

const config: StorybookConfig = {
    stories: [
        '../src/web-components/introduction.mdx', // make sure this is the first story
        '../src/**/*.mdx',
        '../src/**/*.stories.@(js|mjs|ts)',
    ],
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
};
export default config;
