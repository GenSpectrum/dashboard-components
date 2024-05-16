import { type Meta, type StoryObj } from '@storybook/preact';
import { expect, waitFor, within } from '@storybook/test';

import { ErrorDisplay, UserFacingError } from './error-display';
import { ResizeContainer } from './resize-container';

const meta: Meta = {
    title: 'Component/Error',
    component: ErrorDisplay,
    parameters: { fetchMock: {} },
};

export default meta;

export const ErrorStory: StoryObj = {
    render: () => (
        <ResizeContainer size={{ height: '600px', width: '100%' }}>
            <ErrorDisplay error={new Error('some message')} />
        </ResizeContainer>
    ),

    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const error = canvas.getByText('Oops! Something went wrong.', { exact: false });
        await waitFor(() => expect(error).toBeInTheDocument());
        await waitFor(() => expect(canvas.queryByText('some message')).not.toBeInTheDocument());
    },
};

export const UserFacingErrorStory: StoryObj = {
    render: () => (
        <ResizeContainer size={{ height: '600px', width: '100%' }}>
            <ErrorDisplay error={new UserFacingError('some message')} />
        </ResizeContainer>
    ),

    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const error = canvas.getByText('Oops! Something went wrong.', { exact: false });
        await waitFor(() => expect(error).toBeInTheDocument());
        await waitFor(() => expect(canvas.getByText('some message')).toBeInTheDocument());
    },
};
