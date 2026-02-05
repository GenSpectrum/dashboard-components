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
        query: { control: 'text' },
    },
    parameters: {
        fetchMock: {},
    },
};

export default meta;

export const Default: StoryObj<QueriesOverTimeRowLabelTooltipProps> = {
    render: (args) => <QueriesOverTimeRowLabelTooltip {...args} />,
    args: {
        query: 'S:F456L (single mutation)',
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByText('S:F456L (single mutation)', { exact: true })).toBeVisible();
        await expect(canvas.getByText('foobar')).toBeVisible();
    },
};
