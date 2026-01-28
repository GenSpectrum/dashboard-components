import { type Meta, type StoryObj } from '@storybook/preact';
import { expect, within } from '@storybook/test';

import { QueriesOverTimeGridTooltip, type QueriesOverTimeGridTooltipProps } from './queries-over-time-grid-tooltip';

const meta: Meta<QueriesOverTimeGridTooltipProps> = {
    title: 'Component/Queries over time grid tooltip',
    component: QueriesOverTimeGridTooltip,
    argTypes: {
        query: { control: 'text' },
        date: { control: 'object' },
        value: { control: 'object' },
    },
    parameters: {
        fetchMock: {},
    },
};

export default meta;

const Template: StoryObj<QueriesOverTimeGridTooltipProps> = {
    render: (args: QueriesOverTimeGridTooltipProps) => <QueriesOverTimeGridTooltip {...args} />,
    args: {
        query: 'BA.1 Lineage',
        date: {
            type: 'Year',
            year: 2025,
            dateString: '2025',
        },
        value: null,
    },
};

export const NoValue: StoryObj<QueriesOverTimeGridTooltipProps> = {
    ...Template,
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        await expect(canvas.getByText('2025', { exact: true })).toBeVisible();
        await expect(canvas.getByText('2025-01-01 - 2025-12-31')).toBeVisible();
        await expect(canvas.getByText('BA.1 Lineage')).toBeVisible();
        await expect(canvas.getByText('No data')).toBeVisible();
    },
};

export const WithValue: StoryObj<QueriesOverTimeGridTooltipProps> = {
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
        await expect(canvas.getByText('match the query BA.1 Lineage.')).toBeVisible();
        await expect(canvas.getByText('200')).toBeVisible();
        await expect(canvas.getByText('total with coverage.')).toBeVisible();
        await expect(canvas.getByText('300')).toBeVisible();
        await expect(canvas.getByText('total in this date range.')).toBeVisible();
    },
};

export const WithValueWithZero: StoryObj<QueriesOverTimeGridTooltipProps> = {
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
        await expect(canvas.getByText('match the query BA.1 Lineage.')).toBeVisible();
        await expect(canvas.queryByText('with coverage')).not.toBeInTheDocument();
        await expect(canvas.getByText('300')).toBeVisible();
        await expect(canvas.getByText('total in this date range.')).toBeVisible();
    },
};

export const WithValueWithCoverage: StoryObj<QueriesOverTimeGridTooltipProps> = {
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
        await expect(canvas.getByText('match the query BA.1 Lineage out of')).toBeVisible();
        await expect(canvas.getByText('200')).toBeVisible();
        await expect(canvas.getByText('with coverage for this query.')).toBeVisible();
        await expect(canvas.getByText('300')).toBeVisible();
        await expect(canvas.getByText('total in this date range.')).toBeVisible();
    },
};

export const WithValueBelowThreshold: StoryObj<QueriesOverTimeGridTooltipProps> = {
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
        await expect(canvas.getByText('None or less than 0.10% match the query.')).toBeVisible();
        await expect(canvas.getByText('300')).toBeVisible();
        await expect(canvas.getByText('total in this date range.')).toBeVisible();
    },
};
