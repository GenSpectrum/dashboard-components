import { type Meta, type StoryObj } from '@storybook/preact';
import { expect, userEvent, waitFor, within } from '@storybook/test';

import Info, { type InfoProps } from './info';

const meta: Meta<InfoProps> = {
    title: 'Component/Info',
    component: Info,
    parameters: { fetchMock: {} },
    args: {
        height: '100px',
    },
};

export default meta;

const tooltipText = 'This is a tooltip which shows some information.';

export const InfoStory: StoryObj<InfoProps> = {
    render: (args) => (
        <div class='flex justify-center px-4 py-16'>
            <Info {...args}>{tooltipText}</Info>
        </div>
    ),
};

export const ShowsInfoOnClick: StoryObj<InfoProps> = {
    ...InfoStory,
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const openInfo = canvas.getByRole('button', { name: '?' });

        await waitFor(() => expect(openInfo).toBeInTheDocument());

        await userEvent.click(openInfo);

        await waitFor(() => expect(canvas.getByText(tooltipText, { exact: false })).toBeVisible());

        await userEvent.click(document.body);

        await waitFor(() => expect(canvas.queryByText(tooltipText, { exact: false })).not.toBeVisible());
    },
};
