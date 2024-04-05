import { type Meta, type StoryObj } from '@storybook/preact';
import { expect, waitFor, within } from '@storybook/test';

import { NoDataDisplay } from './no-data-display';

const meta: Meta = {
    title: 'Component/No data',
    component: NoDataDisplay,
    parameters: { fetchMock: {} },
};

export default meta;

export const NoDataStory: StoryObj = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const noData = canvas.getByText('No data available.');
        await waitFor(() => expect(noData).toBeInTheDocument());
    },
};
