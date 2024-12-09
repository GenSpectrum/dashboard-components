import { expect, waitFor, within } from '@storybook/test';

export async function expectInvalidAttributesErrorMessage(canvasElement: HTMLElement, errorMessage: string) {
    const canvas = within(canvasElement);

    await waitFor(() =>
        expect(canvas.getByText('Error - Invalid component attributes', { exact: false })).toBeInTheDocument(),
    );

    canvas.getByRole('button', { name: 'Show details.' }).click();

    await waitFor(() => expect(canvas.getByText(errorMessage, { exact: false })).toBeVisible());
}
