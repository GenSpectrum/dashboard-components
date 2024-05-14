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
        headline: { control: 'text' },
    },
};

export default meta;

export const ErrorBoundaryWithoutErrorStory: StoryObj = {
    render: (args) => (
        <ErrorBoundary size={args.size} defaultSize={args.defaultSize} headline={args.headline}>
            <div>Some content</div>
        </ErrorBoundary>
    ),
    args: {
        size: { height: '600px', width: '100%' },
        defaultSize: { height: '600px', width: '100%' },
        headline: 'Some headline',
    },

    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const content = canvas.getByText('Some content', { exact: false });
        await waitFor(() => expect(content).toBeInTheDocument());
        await waitFor(() => expect(canvas.queryByText('Some headline')).not.toBeInTheDocument());
    },
};

export const ErrorBoundaryWithErrorStory: StoryObj = {
    render: (args) => (
        <ErrorBoundary size={args.size} defaultSize={args.defaultSize} headline={args.headline}>
            <ContentThatThrowsError />
        </ErrorBoundary>
    ),
    args: {
        size: { height: '600px', width: '100%' },
        defaultSize: { height: '600px', width: '100%' },
        headline: 'Some headline',
    },

    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const content = canvas.queryByText('Some content.', { exact: false });
        await waitFor(() => expect(content).not.toBeInTheDocument());
        await waitFor(() => expect(canvas.getByText('Some headline')).toBeInTheDocument());
        await waitFor(() => expect(canvas.getByText('Error')).toBeInTheDocument());
    },
};

const ContentThatThrowsError = () => {
    throw new Error('Some error');
};
