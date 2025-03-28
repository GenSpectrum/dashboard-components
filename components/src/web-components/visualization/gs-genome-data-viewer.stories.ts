import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

import './gs-genome-data-viewer';
import '../gs-app';
import { withComponentDocs } from '../../../.storybook/ComponentDocsBlock';
import { LAPIS_URL } from '../../constants';
import type { GenomeDataViewerProps } from '../../preact/genomeViewer/genome-data-viewer';

const codeExample = String.raw`
<gs-genome-data-viewer
    gff3Source='https://raw.githubusercontent.com/nextstrain/nextclade_data/8f2e791d3a59013ee88e1d1d7e83b486d39c4ecb/data/nextstrain/wnv/all-lineages/genome_annotation.gff3'
    genomeLength=11029
    width='100%'
    height='100%'
></gs-genome-data-viewer>`;

const meta: Meta<Required<GenomeDataViewerProps>> = {
    title: 'Visualization/Genome Data Viewer',
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

const SimpleData = `
##gff-version 3
#!gff-spec-version 1.21
#!processor NCBI annotwriter
##sequence-region NC_009942.1 1 11029
##species https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?id=11082
NC_009942.1	RefSeq	region	1	11029	.	+	.	ID=NC_009942.1:1..11029;Dbxref=taxon:11082;country=USA;gb-acronym=WNV;gbkey=Src;genome=genomic;isolate=385-99;mol_type=genomic RNA;note=lineage 1%3B Vero cell passage 2 after isolation;strain=NY99
NC_009942.1	RefSeq	gene	97	10395	.	+	.	gene=POLY;ID=gene-WNVNY99_gp1;gbkey=Prot;product=anchored capsid protein ancC;protein_id=YP_005097850.1
NC_009942.1	RefSeq	CDS	97	465	.	+	.	gene=capsid;Parent=gene-WNVNY99_gp1;gbkey=Prot;product=anchored capsid protein ancC;protein_id=YP_005097850.1
NC_009942.1	RefSeq	CDS	466	966	.	+	.	gene=prM;Parent=gene-WNVNY99_gp1;gbkey=Prot;product=protein pr;protein_id=YP_009164953.1
NC_009942.1	RefSeq	CDS	967	2469	.	+	.	gene=env;Parent=gene-WNVNY99_gp1;gbkey=Prot;product=envelope protein E;protein_id=YP_001527880.1
NC_009942.1	RefSeq	CDS	2470	3525	.	+	.	gene=NS1;Parent=gene-WNVNY99_gp1;gbkey=Prot;product=nonstructural protein NS1;protein_id=YP_001527881.1
NC_009942.1	RefSeq	CDS	3526	4218	.	+	.	gene=NS2A;Parent=gene-WNVNY99_gp1;gbkey=Prot;product=nonstructural protein NS2A;protein_id=YP_001527882.1
NC_009942.1	RefSeq	CDS	4219	4611	.	+	.	gene=NS2B;Parent=gene-WNVNY99_gp1;gbkey=Prot;product=nonstructural protein NS2B;protein_id=YP_001527883.1
NC_009942.1	RefSeq	CDS	4612	6468	.	+	.	gene=NS3;Parent=gene-WNVNY99_gp1;gbkey=Prot;product=nonstructural protein NS3;protein_id=YP_001527884.1
NC_009942.1	RefSeq	CDS	6469	6846	.	+	.	gene=NS4A;Parent=gene-WNVNY99_gp1;gbkey=Prot;product=nonstructural protein NS4A;protein_id=YP_001527885.1
NC_009942.1	RefSeq	CDS	6847	6915	.	+	.	gene=2K;Parent=gene-WNVNY99_gp1;gbkey=Prot;product=protein 2K;protein_id=YP_001527885.1
NC_009942.1	RefSeq	CDS	6916	7680	.	+	.	gene=NS4B;Parent=gene-WNVNY99_gp1;gbkey=Prot;product=nonstructural protein NS4B;protein_id=YP_001527886.1
NC_009942.1	RefSeq	CDS	7681	10395	.	+	.	gene=NS5;Parent=gene-WNVNY99_gp1;gbkey=Prot;product=RNA-dependent RNA polymerase NS5;protein_id=YP_001527887.1
`;
export const Default: StoryObj<Required<GenomeDataViewerProps>> = {
    ...Template,
    args: {
        genomeLength: 11029,
        gff3Source: 'https://gff3Url',
        width: '100%',
        height: '100%',
    },
    parameters: {
        fetchMock: {
            mocks: [
                {
                    matcher: {
                        name: 'gff3Data',
                        url: 'https://gff3Url',
                    },
                    response: {
                        status: 200,
                        body: SimpleData,
                        headers: {
                            'Content-Type': 'text/plain',
                        },
                    },
                },
            ],
        },
    },
};
