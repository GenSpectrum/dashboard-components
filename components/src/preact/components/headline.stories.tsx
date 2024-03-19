import { Meta, StoryObj } from '@storybook/preact';
import Headline, { HeadlineProps } from './headline';
import { expect, within } from '@storybook/test';

const meta: Meta<typeof Headline> = {
    title: 'Component/Headline',
    component: Headline,
    parameters: { fetchMock: {} },
};

export default meta;

export const HeadlineStory: StoryObj<HeadlineProps> = {
    render: (args) => (
        <Headline {...args}>
            <div class='flex justify-center px-4 py-16 bg-base-200'>Some Content</div>
        </Headline>
    ),
    args: {
        heading: 'My Headline',
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        await expect(canvas.getByText('My Headline')).toBeInTheDocument();
        await expect(canvas.getByText('Some Content')).toBeInTheDocument();
    },
};
