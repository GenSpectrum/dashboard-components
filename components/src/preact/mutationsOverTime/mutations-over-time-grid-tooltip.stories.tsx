import { type Meta, type StoryObj } from '@storybook/preact';
import { expect, within } from '@storybook/test';

import {
    MutationsOverTimeGridTooltip,
    type MutationsOverTimeGridTooltipProps,
} from './mutations-over-time-grid-tooltip';

const meta: Meta<MutationsOverTimeGridTooltipProps> = {
    title: 'Component/Mutation over time grid tooltip',
    component: MutationsOverTimeGridTooltip,
    argTypes: {
        mutation: { control: 'object' },
        date: { control: 'object' },
        value: { control: 'object' },
    },
    parameters: {
        fetchMock: {},
    },
};

export default meta;

const Template: StoryObj<MutationsOverTimeGridTooltipProps> = {
    render: (args: MutationsOverTimeGridTooltipProps) => <MutationsOverTimeGridTooltip {...args} />,
    args: {
        mutation: {
            type: 'deletion',
            position: 500,
            code: 'A500-',
            valueAtReference: 'A',
        },
        date: {
            type: 'Year',
            year: 2025,
            dateString: '2025',
        },
        value: null,
    },
};

export const NoValue: StoryObj<MutationsOverTimeGridTooltipProps> = {
    ...Template,
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        await expect(canvas.getByText('2025', { exact: true })).toBeVisible();
        await expect(canvas.getByText('2025-01-01 - 2025-12-31')).toBeVisible();
        await expect(canvas.getByText('A500-')).toBeVisible();
        await expect(canvas.getByText('No data')).toBeVisible();
    },
};

export const WithValue: StoryObj<MutationsOverTimeGridTooltipProps> = {
    ...Template,
    args: {
        ...Template.args,
        value: {
            type: 'value',
            proportion: 0.5,
            count: 100,
            totalCount: 300,
        },
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        await expect(canvas.getByText('50.00%')).toBeVisible();
        await expect(canvas.getByText('100')).toBeVisible();
        await expect(canvas.getByText('have the mutation A500-.')).toBeVisible();
        await expect(canvas.getByText('200')).toBeVisible();
        await expect(canvas.getByText('have coverage at position 500.')).toBeVisible();
        await expect(canvas.getByText('300')).toBeVisible();
        await expect(canvas.getByText('total in this date range.')).toBeVisible();
    },
};

export const WithValueWithZero: StoryObj<MutationsOverTimeGridTooltipProps> = {
    ...Template,
    args: {
        ...Template.args,
        value: {
            type: 'value',
            proportion: 0,
            count: 0,
            totalCount: 300,
        },
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        await expect(canvas.getByText('0.00%')).toBeVisible();
        await expect(canvas.getByText('0')).toBeVisible();
        await expect(canvas.getByText('have the mutation A500-.')).toBeVisible();
        await expect(canvas.queryByText('with coverage at position 500.')).not.toBeInTheDocument();
        await expect(canvas.getByText('300')).toBeVisible();
        await expect(canvas.getByText('total in this date range.')).toBeVisible();
    },
};

export const WithValueWithCoverage: StoryObj<MutationsOverTimeGridTooltipProps> = {
    ...Template,
    args: {
        ...Template.args,
        value: {
            type: 'valueWithCoverage',
            count: 100,
            coverage: 200,
            totalCount: 300,
        },
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        await expect(canvas.getByText('50.00%')).toBeVisible();
        await expect(canvas.getByText('100')).toBeVisible();
        await expect(canvas.getByText('have the mutation A500- out of')).toBeVisible();
        await expect(canvas.getByText('200')).toBeVisible();
        await expect(canvas.getByText('with coverage at position 500.')).toBeVisible();
        await expect(canvas.getByText('300')).toBeVisible();
        await expect(canvas.getByText('total in this date range.')).toBeVisible();
    },
};

export const WithValueBelowThreshold: StoryObj<MutationsOverTimeGridTooltipProps> = {
    ...Template,
    args: {
        ...Template.args,
        value: {
            type: 'belowThreshold',
            totalCount: 300,
        },
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        await expect(canvas.getByText('<0.10%')).toBeVisible();
        await expect(canvas.getByText('None or less than 0.10% have the mutation.')).toBeVisible();
        await expect(canvas.getByText('300')).toBeVisible();
        await expect(canvas.getByText('total in this date range.')).toBeVisible();
    },
};

export const WithWastewaterValue: StoryObj<MutationsOverTimeGridTooltipProps> = {
    ...Template,
    args: {
        ...Template.args,
        value: {
            type: 'wastewaterValue',
            proportion: 0.5,
        },
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        await expect(canvas.getByText('50.00%')).toBeVisible();
        await expect(canvas.queryByText('total in this date range.')).not.toBeInTheDocument();
        await expect(canvas.queryByText('coverage')).not.toBeInTheDocument();
    },
};
