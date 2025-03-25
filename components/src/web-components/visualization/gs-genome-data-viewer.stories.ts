import { expect, waitFor } from '@storybook/test';
import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

import './gs-genome-data-viewer';
import '../gs-app';
import { withComponentDocs } from '../../../.storybook/ComponentDocsBlock';
import { LAPIS_URL } from '../../constants';
import type { GenomeDataViewerProps } from '../../preact/genomeViewer/genome-data-viewer';
import { withinShadowRoot } from '../withinShadowRoot.story';

const codeExample = String.raw`
<gs-genome-data-viewer
    gff3Source='https://raw.githubusercontent.com/nextstrain/nextclade_data/8f2e791d3a59013ee88e1d1d7e83b486d39c4ecb/data/nextstrain/wnv/all-lineages/genome_annotation.gff3'
    genomeLength=11029
    width='100%'
    height='100%'
></gs-genome-data-viewer>`;

const meta: Meta<Required<GenomeDataViewerProps>> = {
    title: 'Genome Data Viewer',
    component: 'gs-genome-data-viewer',
    argTypes: {
        gff3Source: { control: 'text' },
        genomeLength: { control: 'number' },
        width: { control: 'text' },
        height: { control: 'text' },
    },
    parameters: withComponentDocs({
        componentDocs: {
            opensShadowDom: true,
            expectsChildren: false,
            codeExample,
        },
    }),
    tags: ['autodocs'],
};

export default meta;

const Template: StoryObj<Required<GenomeDataViewerProps>> = {
    render: (args) => html`
        <gs-app lapis="${LAPIS_URL}">
            <gs-genome-data-viewer
                .genomeLength=${args.genomeLength}
                .gff3Source=${args.gff3Source}
                .width=${args.width}
                .height=${args.height}
            ></gs-genome-data-viewer>
        </gs-app>
    `,
};

export const Default: StoryObj<Required<GenomeDataViewerProps>> = {
    ...Template,
    args: {
        genomeLength: 11029,
        gff3Source:
            'https://raw.githubusercontent.com/nextstrain/nextclade_data/8f2e791d3a59013ee88e1d1d7e83b486d39c4ecb/data/nextstrain/wnv/all-lineages/genome_annotation.gff3',
        width: '100%',
        height: '100%',
    },
    parameters: {
        fetchMock: {
            mocks: [],
        },
    },
    play: async ({ canvasElement, step }) => {
        const canvas = await withinShadowRoot(canvasElement, 'gs-genome-data-viewer');

        await step('CDS and slider visible', async () => {
            await waitFor(() => expect(canvas.getByText('Genome Data Viewer')).toBeVisible());
        });
    },
};
