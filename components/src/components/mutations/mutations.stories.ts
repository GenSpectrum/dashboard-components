import type { Meta, StoryObj } from '@storybook/web-components';

import { html } from 'lit';
import '../app';
import './mutations';
// eslint-disable-next-line no-duplicate-imports
import { MutationsProps } from './mutations';
import { LAPIS_URL, NUCLEOTIDE_INSERTIONS_ENDPOINT, NUCLEOTIDE_MUTATIONS_ENDPOINT } from '../../constants';
import nucleotideMutations from './__mockData__/nucleotideMutations.json';
import nuleotideInsertions from './__mockData__/nucleotideInsertions.json';

const meta: Meta<MutationsProps> = {
    title: 'Visualization/Mutations',
    component: 'gs-mutations',
    argTypes: {
        variant: { control: 'object' },
        sequenceType: {
            options: ['nucleotide', 'amino acid'],
            control: { type: 'radio' },
        },
        views: {
            options: ['table', 'grid'],
            control: { type: 'check' },
        },
    },
};

export default meta;

const Template: StoryObj<MutationsProps> = {
    render: (args) => html`
        <gs-app lapis="${LAPIS_URL}">
            <gs-mutations
                .variant=${args.variant}
                .sequenceType=${args.sequenceType}
                .views=${args.views}
            ></gs-mutations>
        </gs-app>
    `,
};

export const Default = {
    ...Template,
    args: {
        variant: { country: 'Switzerland', pangoLineage: 'B.1.1.7', dateTo: '2022-01-01' },
        sequenceType: 'nucleotide',
        views: ['grid', 'table'],
    },
    parameters: {
        fetchMock: {
            mocks: [
                {
                    matcher: {
                        name: 'nucleotideMutations',
                        url: NUCLEOTIDE_MUTATIONS_ENDPOINT,
                        query: {
                            country: 'Switzerland',
                            pangoLineage: 'B.1.1.7',
                            dateTo: '2022-01-01',
                            minProportion: 0,
                        },
                    },
                    response: {
                        status: 200,
                        body: nucleotideMutations,
                    },
                },
                {
                    matcher: {
                        name: 'nucleotideInsertions',
                        url: NUCLEOTIDE_INSERTIONS_ENDPOINT,
                        query: { country: 'Switzerland', pangoLineage: 'B.1.1.7', dateTo: '2022-01-01' },
                    },
                    response: {
                        status: 200,
                        body: nuleotideInsertions,
                    },
                },
            ],
        },
    },
};
