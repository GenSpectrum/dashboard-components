import { Meta } from '@storybook/web-components';
import { CsvDownloadButton, CsvDownloadButtonProps } from './csv-download-button';
import { StoryObj } from '@storybook/preact';

const meta: Meta<CsvDownloadButtonProps> = {
    title: 'Component/CSV Download Button',
    parameters: { fetchMock: {} },
};

export default meta;

export const DownloadButton: StoryObj = {
    render: (args) => {
        return <CsvDownloadButton label={args.label} filename={args.filename} getData={() => args.data} />;
    },
    args: {
        data: [
            { field1: 'value1_1', fieldWithEmptyValues: null, field2: 5 },
            { field1: 'value2_1', fieldWithEmptyValues: undefined, field2: 42 },
        ],
        label: 'My Download Button',
        filename: 'myFile.csv',
    },
};
