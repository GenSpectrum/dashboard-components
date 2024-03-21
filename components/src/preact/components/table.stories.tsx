import { Meta, StoryObj } from '@storybook/preact';
import { Table } from './table';

const meta: Meta = {
    title: 'Component/Table',
    component: Table,
    parameters: { fetchMock: {} },
};

export default meta;

export const TableStory: StoryObj = {
    render: (args) => {
        return <Table data={args.data} columns={args.columns} pagination={false} />;
    },
    args: {
        data: [
            ['John Do', 'john@example.com', '123-456-7890'],
            ['Jane Doe', 'jane@example.com', '098-765-4321'],
        ],
        columns: [{ name: 'Name' }, { name: 'Email', sort: true }, { name: 'Phone Number' }],
    },
};
