import { expect, waitFor, within } from '@storybook/test';

export function playThatExpectsErrorMessage(errorTitle: string, errorMessage: string) {
    return async ({ canvasElement }: { canvasElement: HTMLElement }) => {
        await expectErrorMessage(canvasElement, errorTitle, errorMessage);
    };
}

export async function expectErrorMessage(canvasElement: HTMLElement, errorTitle: string, errorMessage: string) {
    const canvas = within(canvasElement);

    await waitFor(() => expect(canvas.getByText(errorTitle, { exact: false })).toBeInTheDocument());

    canvas.getByRole('button', { name: 'Show details.' }).click();

    await waitFor(() => expect(canvas.getByText(errorMessage, { exact: false })).toBeVisible());
}

export async function expectInvalidAttributesErrorMessage(canvasElement: HTMLElement, errorMessage: string) {
    await expectErrorMessage(canvasElement, 'Error - Invalid component attributes', errorMessage);
}
