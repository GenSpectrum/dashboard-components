import { type Meta, type StoryObj } from '@storybook/preact';
import { expect, waitFor, within } from '@storybook/test';

import Tooltip, { type TooltipProps } from './tooltip';

const meta: Meta<TooltipProps> = {
    title: 'Component/Tooltip',
    component: Tooltip,
    parameters: { fetchMock: {} },
    argTypes: {
        content: { control: 'text' },
        position: {
            control: {
                type: 'radio',
            },
            options: ['top', 'top-start', 'top-end', 'bottom', 'bottom-start', 'bottom-end', 'left', 'right'],
        },
    },
};

export default meta;

const tooltipContent = 'This is some content.';

export const TooltipStory: StoryObj<TooltipProps> = {
    render: (args) => (
        <div className='flex justify-center px-4 py-16'>
            <Tooltip {...args}>
                <div className='bg-red-200'>Hover me</div>
            </Tooltip>
        </div>
    ),
    args: {
        content: tooltipContent,
        position: 'bottom',
    },
};

export const RendersStringContent: StoryObj<TooltipProps> = {
    ...TooltipStory,
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const tooltipBase = canvas.getByText('Hover me');

        await waitFor(() => expect(tooltipBase).toBeInTheDocument());

        await waitFor(() => expect(canvas.queryByText(tooltipContent, { exact: false })).toBeInTheDocument());
    },
};

export const RendersComponentContent: StoryObj<TooltipProps> = {
    ...TooltipStory,
    args: {
        content: <div>{tooltipContent}</div>,
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const tooltipBase = canvas.getByText('Hover me');

        await waitFor(() => expect(tooltipBase).toBeInTheDocument());

        await waitFor(() => expect(canvas.queryByText(tooltipContent, { exact: false })).toBeInTheDocument());
    },
};
