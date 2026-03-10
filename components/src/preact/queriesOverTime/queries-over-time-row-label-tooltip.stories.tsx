import { type Meta, type StoryObj } from '@storybook/preact';
import { expect, within } from '@storybook/test';

import {
    QueriesOverTimeRowLabelTooltip,
    type QueriesOverTimeRowLabelTooltipProps,
} from './queries-over-time-row-label-tooltip';

const meta: Meta<QueriesOverTimeRowLabelTooltipProps> = {
    title: 'Component/Queries over time row label tooltip',
    component: QueriesOverTimeRowLabelTooltip,
    argTypes: {
        query: { control: 'object' },
    },
    parameters: {
        fetchMock: {},
    },
};

export default meta;

export const Default: StoryObj<QueriesOverTimeRowLabelTooltipProps> = {
    render: (args) => <QueriesOverTimeRowLabelTooltip {...args} />,
    args: {
        query: {
            displayLabel: 'Foo variant',
            description: 'These mutations are associated with increased transmissibility.',
            countQuery: 'S:451L & S:452L & S:453L & S:454L & S:455L & S:456L & S:457L & S:458L & S:459L & S:460L',
            coverageQuery: '!S:456N',
        },
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByText('Foo variant', { exact: true })).toBeVisible();
        await expect(canvas.getByText('These mutations are associated with increased transmissibility.')).toBeVisible();
        await expect(canvas.getByText('Count query:')).toBeVisible();
        await expect(
            canvas.getByText('S:451L & S:452L & S:453L & S:454L & S:455L & S:456L & S:457L & S:458L & S:459L & S:460L'),
        ).toBeVisible();
    },
};

export const WithoutDescription: StoryObj<QueriesOverTimeRowLabelTooltipProps> = {
    render: (args) => <QueriesOverTimeRowLabelTooltip {...args} />,
    args: {
        query: {
            displayLabel: 'S:R346T',
            countQuery: 'S:346T',
            coverageQuery: '!S:346N',
        },
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByText('S:R346T', { exact: true })).toBeVisible();
        await expect(canvas.getByText('Count query:')).toBeVisible();
        await expect(canvas.getByText('S:346T')).toBeVisible();
        await expect(canvas.getByText('Coverage query:')).toBeVisible();
        await expect(canvas.getByText('!S:346N')).toBeVisible();
    },
};
