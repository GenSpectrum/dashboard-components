import { type Meta, type StoryObj } from '@storybook/preact';
import { expect, userEvent, waitFor, within } from '@storybook/test';

import { Table, type TableProps } from './table';

const meta: Meta = {
    title: 'Component/Table',
    component: Table,
    parameters: { fetchMock: {} },
    argTypes: {
        data: { control: 'object' },
        columns: { control: 'object' },
        pageSize: { control: 'object' },
    },
};

export default meta;

export const TableStory: StoryObj<TableProps> = {
    render: (args) => {
        return <Table data={args.data} columns={args.columns} pageSize={args.pageSize} />;
    },
    args: {
        data: [
            ['John Do', 'john@example.com', '123-456-7890'],
            ['Jane Doe', 'jane@example.com', '098-765-4321'],
        ],
        columns: [{ name: 'Name' }, { name: 'Email', sort: true }, { name: 'Phone Number' }],
        pageSize: 1,
    },
    play: async ({ canvasElement, step }) => {
        const canvas = within(canvasElement);

        const firstRow = () => canvas.queryByText('John Do', { exact: true });
        const secondRow = () => canvas.queryByText('Jane Doe', { exact: true });

        await step('Expect first row to be visible and not second row', async () => {
            await waitFor(() => expect(firstRow()).toBeVisible());
            await expect(secondRow()).toBeNull();
        });

        await step('Expect second row to be visible and not first row after clicking next', async () => {
            const nextButton = canvas.getByRole('button', { name: 'Next' });
            await userEvent.click(nextButton);

            await waitFor(() => expect(secondRow()).toBeVisible());
            await expect(firstRow()).toBeNull();
        });
    },
};

export const TableStoryNoPagination: StoryObj<TableProps> = {
    render: (args) => {
        return <Table data={args.data} columns={args.columns} pageSize={args.pageSize} />;
    },
    args: {
        data: [
            ['John Do', 'john@example.com', '123-456-7890'],
            ['Jane Doe', 'jane@example.com', '098-765-4321'],
        ],
        columns: [{ name: 'Name' }, { name: 'Email', sort: true }, { name: 'Phone Number' }],
        pageSize: false,
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        const firstRow = () => canvas.queryByText('John Do', { exact: true });
        const secondRow = () => canvas.queryByText('Jane Doe', { exact: true });

        await waitFor(() => expect(firstRow()).toBeVisible());
        await expect(secondRow()).toBeVisible();
        await waitFor(() => expect(canvas.queryByText('Next')).toBeNull());
    },
};
