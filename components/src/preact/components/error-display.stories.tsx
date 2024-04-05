import { type Meta, type StoryObj } from '@storybook/preact';
import { expect, waitFor, within } from '@storybook/test';

import { ErrorDisplay } from './error-display';

const meta: Meta = {
    title: 'Component/Error',
    component: ErrorDisplay,
    parameters: { fetchMock: {} },
};

export default meta;

export const ErrorStory: StoryObj = {
    render: () => <ErrorDisplay error={new Error('some message')} />,

    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const error = canvas.getByText('Error: ', { exact: false });
        await waitFor(() => expect(error).toBeInTheDocument());
    },
};
