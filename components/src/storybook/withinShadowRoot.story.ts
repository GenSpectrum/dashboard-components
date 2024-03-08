import { expect } from '@storybook/jest';
import { waitFor, within } from '@storybook/testing-library';

export default {};

/**
 * taken from https://github.com/storybookjs/testing-library/issues/24#issuecomment-1593709872
 *
 * Usage:
 * ```ts
 * export const MyStory: StoryObj = {
 *     render: () => html` <my-web-component />`,
 *     play: async ({ canvasElement, step }) => {
 *         const canvas = await withinShadowRoot(canvasElement, 'my-web-component');
 *
 *         await userEvent.click(canvas.getByRole('button'));
 *         // ...
 *     },
 * };
 * ```
 */
export async function withinShadowRoot(customElement: HTMLElement, selector: string) {
    const webComponent = customElement.querySelector(selector);

    await waitFor(
        () => {
            const shadowRootFirstEl = webComponent?.shadowRoot?.firstElementChild as HTMLElement;
            return expect(shadowRootFirstEl).toContainElement(shadowRootFirstEl);
        },
        { timeout: 1000 },
    );

    // force type HTMLElement to ignore the type checking of the "within" function
    return within(webComponent?.shadowRoot as unknown as HTMLElement);
}
