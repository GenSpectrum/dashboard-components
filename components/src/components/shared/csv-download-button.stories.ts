import { html } from 'lit';
import { Meta, StoryObj } from '@storybook/web-components';
import './csv-download-button';

const meta: Meta = {
    title: 'Component/CSV Download Button',
    component: 'gs-component-csv-download-button',
    parameters: { fetchMock: {} },
};

export default meta;

export const DownloadButton: StoryObj = {
    render: (args) => html`
        <gs-component-csv-download-button
            label=${args.label}
            filename=${args.filename}
            .getData=${() => args.data}
        ></gs-component-csv-download-button>
    `,
    args: {
        data: [
            { field1: 'value1_1', fieldWithEmptyValues: null, field2: 5 },
            { field1: 'value2_1', fieldWithEmptyValues: undefined, field2: 42 },
        ],
        label: 'My Download Button',
        filename: 'myFile.csv',
    },
};
