import { type Meta, type StoryObj } from '@storybook/preact';
import { expect, waitFor, within } from '@storybook/test';

import { LoadingDisplay } from './loading-display';

const meta: Meta = {
    title: 'Component/Loading',
    component: LoadingDisplay,
    parameters: { fetchMock: {} },
};

export default meta;

export const LoadingStory: StoryObj = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const loading = canvas.getByText('Loading...');
        await waitFor(() => expect(loading).toBeInTheDocument());
    },
};
