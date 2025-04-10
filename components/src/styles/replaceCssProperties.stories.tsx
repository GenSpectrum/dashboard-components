import { css } from '@lit/reactive-element';
import { type Meta, type StoryObj } from '@storybook/preact';
import { expect } from '@storybook/test';
import { type FunctionComponent } from 'preact';

import { replaceCssProperties } from './replaceCssProperties';

const DummyComponent: FunctionComponent = () => 'This just runs a function in the browser';

const meta: Meta = {
    title: 'Test/replaceCssProperties',
    component: DummyComponent,
};

export default meta;

/**
 * This test somehow doesn't work with vitest on node, because the @properties are not parsed by `css()`.
 */
export const InvalidProps: StoryObj = {
    play: async () => {
        const styleSheet = css`
            .some-other-rule {
                color: red;
            }

            @property --test-with-initial-value {
                syntax: '*';
                inherits: false;
                initial-value: solid;
            }

            @property --test-without-initial-value {
                syntax: '*';
                inherits: false;
            }
        `.styleSheet!;

        replaceCssProperties(styleSheet);

        const resultingCss = [...styleSheet.cssRules]
            .map((rule) => rule.cssText)
            .join('\n')
            .replaceAll(' ', '');

        await expect(resultingCss).toContain(':host{--test-with-initial-value:solid;}');
        await expect(resultingCss).toContain('.some-other-rule{color:red;}');
    },
};
