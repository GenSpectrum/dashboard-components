import { html } from 'lit';
import { Meta, StoryObj } from '@storybook/web-components';
import './component-table';

const meta: Meta = {
    title: 'Component/Table',
    component: 'gs-component-table',
    parameters: { fetchMock: {} },
};

export default meta;

export const ComponentTableStory: StoryObj = {
    render: (args) => {
        return html` <gs-component-table .data=${args.data} .columns=${args.columns}></gs-component-table> `;
    },
    args: {
        data: [
            ['John Do', 'john@example.com', '123-456-7890'],
            ['Jane Doe', 'jane@example.com', '098-765-4321'],
        ],
        columns: [{ name: 'Name' }, { name: 'Email', sort: false }, { name: 'Phone Number' }],
    },
};
