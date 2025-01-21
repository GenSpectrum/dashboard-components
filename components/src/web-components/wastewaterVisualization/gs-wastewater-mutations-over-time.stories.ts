import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

import './gs-wastewater-mutations-over-time';
import '../app';
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
></gs-wastewater-mutations-over-time>`;

const meta: Meta<Required<WastewaterMutationsOverTimeProps>> = {
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
        height: '700px',
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

export const WastewaterMutationsOverTime: StoryObj<Required<WastewaterMutationsOverTimeProps>> = {
    render: (args) => html`
        <gs-app lapis="${WISE_LAPIS_URL}">
            <gs-wastewater-mutations-over-time
                .lapisFilter=${args.lapisFilter}
                .sequenceType=${args.sequenceType}
                .width=${args.width}
                .height=${args.height}
            ></gs-wastewater-mutations-over-time>
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
