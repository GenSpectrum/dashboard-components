import { type Meta, type StoryObj } from '@storybook/preact';

import { WastewaterMutationsOverTime, type WastewaterMutationsOverTimeProps } from './wastewater-mutations-over-time';
import { WISE_DETAILS_ENDPOINT, WISE_LAPIS_URL } from '../../../constants';
import referenceGenome from '../../../lapisApi/__mockData__/referenceGenome.json';
import { LapisUrlContext } from '../../LapisUrlContext';
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
    },
    parameters: {
        fetchMock: {},
    },
};

export default meta;

const Template = {
    render: (args: WastewaterMutationsOverTimeProps) => (
        <LapisUrlContext.Provider value={WISE_LAPIS_URL}>
            <ReferenceGenomeContext.Provider value={referenceGenome}>
                <WastewaterMutationsOverTime {...args} />
            </ReferenceGenomeContext.Provider>
        </LapisUrlContext.Provider>
    ),
};

export const Default: StoryObj<WastewaterMutationsOverTimeProps> = {
    ...Template,
    args: {
        width: '100%',
        height: '700px',
        lapisFilter: {},
        sequenceType: 'nucleotide',
        maxNumberOfGridRows: 100,
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
