import { type Meta, type StoryObj } from '@storybook/preact';

import { WastewaterMutationsOverTime, type WastewaterMutationsOverTimeProps } from './wastewater-mutations-over-time';
import { WISE_LAPIS_URL } from '../../../constants';
import referenceGenome from '../../../lapisApi/__mockData__/referenceGenome.json';
import { LapisUrlContext } from '../../LapisUrlContext';
import { ReferenceGenomeContext } from '../../ReferenceGenomeContext';

const meta: Meta<WastewaterMutationsOverTimeProps> = {
    title: 'Visualization/Wastewater Mutation over time',
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
                <WastewaterMutationsOverTime
                    width={args.width}
                    height={args.height}
                    lapisFilter={args.lapisFilter}
                    sequenceType={args.sequenceType}
                />
            </ReferenceGenomeContext.Provider>
        </LapisUrlContext.Provider>
    ),
};

// This test uses mock data: defaultMockData.ts (through mutationOverTimeWorker.mock.ts)
export const Default: StoryObj<WastewaterMutationsOverTimeProps> = {
    ...Template,
    args: {
        width: '100%',
        height: '700px',
        lapisFilter: {},
        sequenceType: 'nucleotide',
    },
};
