import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

import './gs-wastewater-mutations-over-time';
import '../gs-app';
import { withComponentDocs } from '../../../.storybook/ComponentDocsBlock';
import { WISE_DETAILS_ENDPOINT, WISE_LAPIS_URL } from '../../constants';
import details from '../../preact/wastewater/mutationsOverTime/__mockData__/details.json';
import { type WastewaterMutationsOverTimeProps } from '../../preact/wastewater/mutationsOverTime/wastewater-mutations-over-time';

const codeExample = String.raw`
<gs-wastewater-mutations-over-time
    lapisFilter='{ "dateFrom": "2024-01-01" }'
    sequenceType='nucleotide'
    width='100%'
    height='700px'
    pageSizes='[5,10]'
>
    <span slot="infoText">Some info text</span>
</gs-wastewater-mutations-over-time>`;

const meta: Meta<WastewaterMutationsOverTimeProps & { infoText: string }> = {
    title: 'Wastewater visualization/Wastewater mutations over time',
    component: 'gs-wastewater-mutations-over-time',
    argTypes: {
        lapisFilter: { control: 'object' },
        sequenceType: {
            options: ['nucleotide', 'amino acid'],
            control: { type: 'radio' },
        },
        width: { control: 'text' },
        height: { control: 'text' },
    },
    args: {
        lapisFilter: { versionStatus: 'LATEST_VERSION', isRevocation: false },
        sequenceType: 'nucleotide',
        width: '100%',
        height: undefined,
        infoText: 'Some info text',
        pageSizes: [10, 20, 30, 40, 50],
    },
    parameters: withComponentDocs({
        componentDocs: {
            opensShadowDom: true,
            expectsChildren: false,
            codeExample,
        },
        fetchMock: {},
    }),
    tags: ['autodocs'],
};

export default meta;

const mutationAnnotations = [
    {
        name: 'I am an annotation!',
        description: 'This describes what is special about these mutations.',
        symbol: '*',
        nucleotideMutations: ['C3422A', 'G6661A', 'G7731A'],
        aminoAcidMutations: ['S:501Y', 'S:S31-', 'ORF1a:S4286C'],
    },
];

export const WastewaterMutationsOverTime: StoryObj<WastewaterMutationsOverTimeProps & { infoText: string }> = {
    render: (args) => html`
        <gs-app lapis="${WISE_LAPIS_URL}" .mutationAnnotations=${mutationAnnotations}>
            <gs-wastewater-mutations-over-time
                .lapisFilter=${args.lapisFilter}
                .sequenceType=${args.sequenceType}
                .width=${args.width}
                .height=${args.height}
                .pageSizes=${args.pageSizes}
            >
                <span slot="infoText">${args.infoText}</span>
            </gs-wastewater-mutations-over-time>
        </gs-app>
    `,
    parameters: {
        fetchMock: {
            mocks: [
                {
                    matcher: {
                        name: 'details',
                        url: WISE_DETAILS_ENDPOINT,
                        body: {
                            fields: ['date', 'location', 'nucleotideMutationFrequency', 'aminoAcidMutationFrequency'],
                            versionStatus: 'LATEST_VERSION',
                            isRevocation: false,
                        },
                    },
                    response: {
                        status: 200,
                        body: details,
                    },
                },
            ],
        },
    },
};

export const WithFixedHeight: StoryObj<WastewaterMutationsOverTimeProps & { infoText: string }> = {
    ...WastewaterMutationsOverTime,
    args: {
        ...WastewaterMutationsOverTime.args,
        height: '700px',
    },
};
