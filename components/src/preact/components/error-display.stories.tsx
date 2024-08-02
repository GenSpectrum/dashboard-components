import { type Meta, type StoryObj } from '@storybook/preact';
import { expect, fn, userEvent, waitFor, within } from '@storybook/test';

import { ErrorDisplay, UserFacingError } from './error-display';
import { ResizeContainer } from './resize-container';

const meta: Meta = {
    title: 'Component/Error',
    component: ErrorDisplay,
    parameters: { fetchMock: {} },
};

export default meta;

export const GenericErrorStory: StoryObj = {
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
            <ErrorDisplay error={new UserFacingError('Error Title', 'some message')} />
        </ResizeContainer>
    ),

    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const error = canvas.getByText('Oops! Something went wrong.', { exact: false });
        const detailMessage = () => canvas.getByText('some message');
        await waitFor(() => expect(error).toBeInTheDocument());
        await waitFor(() => {
            expect(detailMessage()).not.toBeVisible();
        });
        await userEvent.click(canvas.getByText('Show details.'));
        await waitFor(() => {
            expect(detailMessage()).toBeVisible();
        });
    },
};

export const FiresEvent: StoryObj = {
    render: () => (
        <ResizeContainer size={{ height: '600px', width: '100%' }}>
            <ErrorDisplay error={new UserFacingError('Error Title', 'some message')} />
        </ResizeContainer>
    ),

    play: async ({ canvasElement }) => {
        const listenerMock = fn();
        canvasElement.addEventListener('gs-error', listenerMock);

        await waitFor(() => {
            expect(listenerMock.mock.calls.at(-1)[0].error.name).toStrictEqual('UserFacingError');
            expect(listenerMock.mock.calls.at(-1)[0].error.message).toStrictEqual('some message');
        });
    },
};
