import { type Meta, type StoryObj } from '@storybook/preact';

import { GenomeDataViewer, type GenomeDataViewerProps } from './genome-data-viewer';
import { expectInvalidAttributesErrorMessage } from '../shared/stories/expectErrorMessage';

const meta: Meta<GenomeDataViewerProps> = {
    title: 'Visualization/GenomeDataViewer',
    component: GenomeDataViewer,
    argTypes: {
        width: { control: { type: 'text' } },
        height: { control: { type: 'text' } },
        zoom: { control: { type: 'number' } },
        offsetX: { control: { type: 'number' } },
        offsetY: { control: { type: 'number' } },
        pageSize: { control: 'object' },
    },
};

export default meta;

const gff3Url =
    'https://raw.githubusercontent.com/nextstrain/nextclade_data/8f2e791d3a59013ee88e1d1d7e83b486d39c4ecb/data/nextstrain/wnv/all-lineages/genome_annotation.gff3';

export const Default: StoryObj<GenomeDataViewerProps> = {
    render: (args) => <GenomeDataViewer {...args} />,
    args: {
        gff3Source: {
            url: gff3Url,
        },
        genomeLength: 11029,
        width: '1100px',
        height: '500px',
        views: ['genome'],
        zoom: 2,
        offsetX: 0,
        offsetY: 10,
        pageSize: 10,
    },
    parameters: {},
};

export const InvalidProps: StoryObj<GenomeDataViewerProps> = {
    ...Default,
    args: {
        ...Default.args,
        gff3Source: { url: '' },
    },
    play: async ({ canvasElement, step }) => {
        await step('expect error message', async () => {
            await expectInvalidAttributesErrorMessage(
                canvasElement,
                '"gff3Source.url": String must contain at least 1 character(s)',
            );
        });
    },
};
