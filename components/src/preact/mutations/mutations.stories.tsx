import { type Meta } from '@storybook/preact';

import nucleotideInsertions from './__mockData__/nucleotideInsertions.json';
import nucleotideMutations from './__mockData__/nucleotideMutations.json';
import { Mutations, type MutationsProps } from './mutations';
import { LAPIS_URL, NUCLEOTIDE_INSERTIONS_ENDPOINT, NUCLEOTIDE_MUTATIONS_ENDPOINT } from '../../constants';
import { LapisUrlContext } from '../LapisUrlContext';

const meta: Meta<MutationsProps> = {
    title: 'Visualization/Mutations',
    component: Mutations,
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

const Template = {
    render: (args: MutationsProps) => (
        <LapisUrlContext.Provider value={LAPIS_URL}>
            <Mutations variant={args.variant} sequenceType={args.sequenceType} views={args.views} />
        </LapisUrlContext.Provider>
    ),
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
                        body: nucleotideInsertions,
                    },
                },
            ],
        },
    },
};
