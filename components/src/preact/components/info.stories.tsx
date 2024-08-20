import { type Meta, type StoryObj } from '@storybook/preact';
import { expect, userEvent, waitFor, within } from '@storybook/test';

import Info from './info';

const meta: Meta = {
    title: 'Component/Info',
    component: Info,
    parameters: { fetchMock: {} },
};

export default meta;

const tooltipText = 'This is a tooltip which shows some information.';

export const InfoStory: StoryObj = {
    render: (args) => (
        <div class='flex justify-center px-4 py-16'>
            <Info {...args}>{tooltipText}</Info>
        </div>
    ),
};

export const OpenInfo: StoryObj = {
    ...InfoStory,
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        await openInfo(canvas);
    },
};

export const ShowsAndClosesInfoOnClick: StoryObj = {
    ...InfoStory,
    play: async ({ canvasElement, step }) => {
        const canvas = within(canvasElement);

        await openInfo(canvas);

        await step('Close the info dialog by clicking the close button', async () => {
            const dialog = await waitFor(() => canvas.getByRole('dialog'));
            const closeButton = within(dialog).getByRole('button', { name: 'Close' });
            closeButton.click();
            await waitFor(() => expect(canvas.queryByText(tooltipText, { exact: false })).not.toBeVisible());
        });

        await openInfo(canvas);
        await step('Close the info dialog by clicking the x button', async () => {
            const dialog = await waitFor(() => canvas.getByRole('dialog'));
            const xButton = within(dialog).getByRole('button', { name: '✕' });
            xButton.click();
            await waitFor(() => expect(canvas.queryByText(tooltipText, { exact: false })).not.toBeVisible());
        });

        await openInfo(canvas);
        await step('Close the info dialog by clicking outside', async () => {
            const dialog = await waitFor(() => canvas.getByRole('dialog'));
            const xButton = within(dialog).getByRole('button', { name: 'Helper to close when clicked outside' });
            xButton.click();
            await waitFor(() => expect(canvas.queryByText(tooltipText, { exact: false })).not.toBeVisible());
        });
    },
};

const openInfo = async (canvas: ReturnType<typeof within>) => {
    const openInfo = canvas.getByRole('button', { name: '?' });
    await waitFor(() => expect(openInfo).toBeInTheDocument());
    await userEvent.click(openInfo);
    await waitFor(() => expect(canvas.getByText(tooltipText, { exact: false })).toBeVisible());
};
