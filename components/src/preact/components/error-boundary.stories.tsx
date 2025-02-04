import { type Meta, type StoryObj } from '@storybook/preact';
import { expect, waitFor, within } from '@storybook/test';
import z from 'zod';

import { ErrorBoundary, type ErrorBoundaryProps } from './error-boundary';
import { UserFacingError } from './error-display';

const meta: Meta = {
    title: 'Component/Error boundary',
    component: ErrorBoundary,
    parameters: {
        fetchMock: {},
    },
    argTypes: {
        size: { control: 'object' },
        defaultSize: { control: 'object' },
    },
    args: {
        size: { height: '600px', width: '100%' },
    },
};

export default meta;

const someSchema = z.object({
    test: z.string().min(1),
});
const someValidProps = { test: 'someValue' };
const someInvalidProps = { test: '' };

export const ErrorBoundaryWithoutErrorStory: StoryObj<ErrorBoundaryProps<typeof someValidProps>> = {
    render: (args) => (
        <ErrorBoundary size={args.size} schema={someSchema} componentProps={someValidProps}>
            <div>Some content</div>
        </ErrorBoundary>
    ),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const content = canvas.getByText('Some content', { exact: false });
        await waitFor(() => expect(content).toBeInTheDocument());
    },
};

export const ErrorBoundaryWithErrorStory: StoryObj<ErrorBoundaryProps<typeof someValidProps>> = {
    render: (args) => (
        <ErrorBoundary size={args.size} schema={someSchema} componentProps={someValidProps}>
            <ContentThatThrowsError error={() => new Error('Some error')} />
        </ErrorBoundary>
    ),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const content = canvas.queryByText('Some content.', { exact: false });
        await waitFor(() => expect(content).not.toBeInTheDocument());
        await waitFor(() => expect(canvas.getByText('Error')).toBeInTheDocument());
    },
};

export const ErrorBoundaryWithParsingErrorStory: StoryObj<ErrorBoundaryProps<typeof someValidProps>> = {
    render: (args) => (
        <ErrorBoundary size={args.size} schema={someSchema} componentProps={someInvalidProps}>
            <ContentThatThrowsError error={() => new Error('Some error')} />
        </ErrorBoundary>
    ),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const content = canvas.queryByText('Some content.', { exact: false });
        await waitFor(() => expect(content).not.toBeInTheDocument());
        await waitFor(() => expect(canvas.getByText('Error - Invalid component attributes')).toBeInTheDocument());
    },
};

export const ErrorBoundaryWithUserFacingErrorStory: StoryObj<ErrorBoundaryProps<typeof someValidProps>> = {
    render: (args) => (
        <ErrorBoundary size={args.size} schema={someSchema} componentProps={someValidProps}>
            <ContentThatThrowsError error={() => new UserFacingError('Error Headline', 'Some error')} />
        </ErrorBoundary>
    ),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const content = canvas.queryByText('Some content.', { exact: false });
        await waitFor(() => expect(content).not.toBeInTheDocument());
        await waitFor(() => expect(canvas.getByText('Error - Error Headline')).toBeInTheDocument());
    },
};

const ContentThatThrowsError = (props: { error: () => Error }) => {
    throw props.error();
};
