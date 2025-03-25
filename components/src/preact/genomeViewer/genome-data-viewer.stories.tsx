import { type Meta, type StoryObj } from '@storybook/preact';

import { GenomeDataViewer, type GenomeDataViewerProps } from './genome-data-viewer';
import { SplicedGeneData } from './loadGff3.spec';
import { playThatExpectsErrorMessage } from '../shared/stories/expectErrorMessage';

const meta: Meta<GenomeDataViewerProps> = {
    title: 'Visualization/GenomeDataViewer',
    component: GenomeDataViewer,
    argTypes: {
        width: { control: { type: 'text' } },
        height: { control: { type: 'text' } },
    },
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

export default meta;

const gff3Url = 'http://my.gff.data';

export const Default: StoryObj<GenomeDataViewerProps> = {
    render: (args) => <GenomeDataViewer {...args} />,
    args: {
        gff3Source: gff3Url,
        genomeLength: 11029,
        width: '1100px',
        height: '500px',
    },
    parameters: {
        fetchMock: {
            mocks: [
                {
                    matcher: {
                        name: 'gff3Data',
                        url: gff3Url,
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

export const InvalidProps: StoryObj<GenomeDataViewerProps> = {
    ...Default,
    args: {
        ...Default.args,
        gff3Source: '',
    },
    play: playThatExpectsErrorMessage('Error - Invalid gff3 source', `Invalid URL passed to parseGFF3: ""`),
};

export const SplicedGeneAndOverlap: StoryObj<GenomeDataViewerProps> = {
    render: (args) => <GenomeDataViewer {...args} />,
    args: {
        gff3Source: gff3Url,
        genomeLength: 982,
        width: '1100px',
        height: '500px',
    },
    parameters: {
        fetchMock: {
            mocks: [
                {
                    matcher: {
                        name: 'gff3Data',
                        url: gff3Url,
                    },
                    response: {
                        status: 200,
                        body: SplicedGeneData,
                        headers: {
                            'Content-Type': 'text/plain',
                        },
                    },
                },
            ],
        },
    },
};
