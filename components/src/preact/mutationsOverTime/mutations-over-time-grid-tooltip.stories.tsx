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
        await expect(canvas.getByText('(2025-01-01 - 2025-12-31)')).toBeVisible();
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

        await expect(canvas.getByText('Proportion: 50.00%')).toBeVisible();
        await expect(canvas.getByText('300 samples are in the timeframe')).toBeVisible();
        await expect(canvas.getByText('200 have coverage, of those 100 have the mutation')).toBeVisible();
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

        await expect(canvas.getByText('Proportion: <0.10%')).toBeVisible();
        await expect(canvas.getByText('300 samples are in the timeframe')).toBeVisible();
        await expect(canvas.getByText('none or less than 0.10% have the mutation')).toBeVisible();
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

        await expect(canvas.getByText('Proportion: 50.00%')).toBeVisible();
        await expect(canvas.queryByText('samples are in the timeframe')).not.toBeInTheDocument();
        await expect(canvas.queryByText('have coverage')).not.toBeInTheDocument();
    },
};
