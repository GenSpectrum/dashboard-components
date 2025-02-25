import { type Meta, type StoryObj } from '@storybook/preact';

import { WastewaterMutationsOverTime, type WastewaterMutationsOverTimeProps } from './wastewater-mutations-over-time';
import { WISE_DETAILS_ENDPOINT, WISE_LAPIS_URL } from '../../../constants';
import referenceGenome from '../../../lapisApi/__mockData__/referenceGenome.json';
import { LapisUrlContextProvider } from '../../LapisUrlContext';
import { ReferenceGenomeContext } from '../../ReferenceGenomeContext';
import details from './__mockData__/details.json';

const meta: Meta<WastewaterMutationsOverTimeProps> = {
    title: 'Wastewater visualization/Wastewater mutations over time',
    component: WastewaterMutationsOverTime,
    argTypes: {
        width: { control: 'text' },
        height: { control: 'text' },
        lapisFilter: { control: 'object' },
        sequenceType: {
            options: ['nucleotide', 'amino acid'],
            control: { type: 'radio' },
        },
        pageSizes: { control: 'object' },
    },
    parameters: {
        fetchMock: {},
    },
};

export default meta;

const Template = {
    render: (args: WastewaterMutationsOverTimeProps) => (
        <LapisUrlContextProvider value={WISE_LAPIS_URL}>
            <ReferenceGenomeContext.Provider value={referenceGenome}>
                <WastewaterMutationsOverTime {...args} />
            </ReferenceGenomeContext.Provider>
        </LapisUrlContextProvider>
    ),
};

export const Default: StoryObj<WastewaterMutationsOverTimeProps> = {
    ...Template,
    args: {
        width: '100%',
        lapisFilter: {},
        sequenceType: 'nucleotide',
        pageSizes: [10, 20, 30, 40, 50],
    },
    parameters: {
        fetchMock: {
            mocks: [
                {
                    matcher: {
                        name: 'details',
                        url: WISE_DETAILS_ENDPOINT,
                        body: {
                            fields: ['date', 'location', 'nucleotideMutationFrequency', 'aminoAcidMutationFrequency'],
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
