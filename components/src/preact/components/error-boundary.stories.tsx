import { type Meta, type StoryObj } from '@storybook/preact';
import { expect, waitFor, within } from '@storybook/test';

import { ErrorBoundary } from './error-boundary';

const meta: Meta = {
    title: 'Component/Error boundary',
    component: ErrorBoundary,
    parameters: { fetchMock: {} },
    argTypes: {
        size: { control: 'object' },
        defaultSize: { control: 'object' },
    },
    args: {
        size: { height: '600px', width: '100%' },
    },
};

export default meta;

export const ErrorBoundaryWithoutErrorStory: StoryObj = {
    render: (args) => (
        <ErrorBoundary size={args.size}>
            <div>Some content</div>
        </ErrorBoundary>
    ),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const content = canvas.getByText('Some content', { exact: false });
        await waitFor(() => expect(content).toBeInTheDocument());
    },
};

export const ErrorBoundaryWithErrorStory: StoryObj = {
    render: (args) => (
        <ErrorBoundary size={args.size}>
            <ContentThatThrowsError />
        </ErrorBoundary>
    ),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const content = canvas.queryByText('Some content.', { exact: false });
        await waitFor(() => expect(content).not.toBeInTheDocument());
        await waitFor(() => expect(canvas.getByText('Error')).toBeInTheDocument());
    },
};

const ContentThatThrowsError = () => {
    throw new Error('Some error');
};
