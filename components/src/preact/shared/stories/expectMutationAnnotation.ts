import { expect, userEvent, waitFor, within } from '@storybook/test';

export async function expectMutationAnnotation(canvasElement: HTMLElement, mutation: string) {
    const canvas = within(canvasElement);

    await waitFor(async () => {
        const annotatedMutation = canvas.getAllByText(mutation)[0];
        await expect(annotatedMutation).toBeVisible();
        await userEvent.click(annotatedMutation);
    });

    await waitFor(() => expect(canvas.getByText(`Annotations for ${mutation}`)).toBeVisible());
}
