import { type Meta, type StoryObj } from '@storybook/preact';
import { expect, waitFor, within } from '@storybook/test';

import nucleotideInsertions from './__mockData__/nucleotideInsertions.json';
import nucleotideMutations from './__mockData__/nucleotideMutations.json';
import { Mutations, type MutationsProps } from './mutations';
import {
    AGGREGATED_ENDPOINT,
    LAPIS_URL,
    NUCLEOTIDE_INSERTIONS_ENDPOINT,
    NUCLEOTIDE_MUTATIONS_ENDPOINT,
} from '../../constants';
import referenceGenome from '../../lapisApi/__mockData__/referenceGenome.json';
import baselineNucleotideMutations from '../../preact/mutations/__mockData__/baselineNucleotideMutations.json';
import overallVariantCount from '../../preact/mutations/__mockData__/overallVariantCount.json';
import { type MutationAnnotations } from '../../web-components/mutation-annotations-context';
import { LapisUrlContextProvider } from '../LapisUrlContext';
import { MutationAnnotationsContextProvider } from '../MutationAnnotationsContext';
import { ReferenceGenomeContext } from '../ReferenceGenomeContext';
import { playThatExpectsFinishedLoadingEvent } from '../shared/stories/expectFinishedLoadingEvent';
import { expectMutationAnnotation } from '../shared/stories/expectMutationAnnotation';

const meta: Meta<MutationsProps> = {
    title: 'Visualization/Mutations',
    component: Mutations,
    argTypes: {
        lapisFilter: { control: 'object' },
        sequenceType: {
            options: ['nucleotide', 'amino acid'],
            control: { type: 'radio' },
        },
        views: {
            options: ['table', 'grid', 'insertions'],
            control: { type: 'check' },
        },
        width: { control: 'text' },
        height: { control: 'text' },
        pageSize: { control: 'object' },
    },
};

export default meta;

const mutationAnnotations = [
    {
        name: 'I am a mutation annotation!',
        description: 'This describes what is special about these mutations.',
        symbol: '#',
        nucleotideMutations: ['C241T', 'C3037T'],
        nucleotidePositions: [],
        aminoAcidMutations: ['N:G204R', 'N:S235F'],
    },
    {
        name: 'I am another mutation annotation!',
        description: 'This describes what is special about these other mutations.',
        symbol: '+',
        nucleotideMutations: ['C3037T', 'C11750T'],
        nucleotidePositions: ['14408'],
        aminoAcidMutations: ['ORF1a:S2255F'],
    },
] satisfies MutationAnnotations;

const Template = {
    render: (args: MutationsProps) => (
        <LapisUrlContextProvider value={LAPIS_URL}>
            <ReferenceGenomeContext.Provider value={referenceGenome}>
                <MutationAnnotationsContextProvider value={mutationAnnotations}>
                    <Mutations {...args} />
                </MutationAnnotationsContextProvider>
            </ReferenceGenomeContext.Provider>
        </LapisUrlContextProvider>
    ),
};

export const Default: StoryObj<MutationsProps> = {
    ...Template,
    args: {
        lapisFilter: { country: 'Switzerland', pangoLineage: 'B.1.1.7', dateTo: '2022-01-01' },
        baselineLapisFilter: { country: 'Switzerland', dateTo: '2022-01-01' },
        sequenceType: 'nucleotide',
        views: ['grid', 'table', 'insertions'],
        width: '100%',
        pageSize: 10,
    },
    parameters: {
        fetchMock: {
            mocks: [
                {
                    matcher: {
                        name: 'nucleotideMutations',
                        url: NUCLEOTIDE_MUTATIONS_ENDPOINT,
                        body: {
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
                        name: 'baselineNucleotideMutations',
                        url: NUCLEOTIDE_MUTATIONS_ENDPOINT,
                        body: {
                            country: 'Switzerland',
                            dateTo: '2022-01-01',
                            minProportion: 0,
                        },
                    },
                    response: {
                        status: 200,
                        body: baselineNucleotideMutations,
                    },
                },
                {
                    matcher: {
                        name: 'overallVariantCount',
                        url: AGGREGATED_ENDPOINT,
                        body: {
                            country: 'Switzerland',
                            pangoLineage: 'B.1.1.7',
                            dateTo: '2022-01-01',
                            fields: [],
                        },
                    },
                    response: {
                        status: 200,
                        body: overallVariantCount,
                    },
                },
                {
                    matcher: {
                        name: 'nucleotideInsertions',
                        url: NUCLEOTIDE_INSERTIONS_ENDPOINT,
                        body: { country: 'Switzerland', pangoLineage: 'B.1.1.7', dateTo: '2022-01-01' },
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

export const FiresFinishedLoadingEvent: StoryObj<MutationsProps> = {
    ...Default,
    play: playThatExpectsFinishedLoadingEvent(),
};

export const GridTab: StoryObj<MutationsProps> = {
    ...Default,
    play: async ({ canvasElement, step }) => {
        const canvas = within(canvasElement);

        const mutationAboveThreshold = () => canvas.getAllByText('51.03%');
        const mutationBelowThreshold = () => canvas.getAllByText('3.51%');

        await step('All proportions are displayed, when one is above threshold', async () => {
            await waitFor(() => expect(mutationAboveThreshold()[0]).toBeVisible());
            await waitFor(() => expect(mutationBelowThreshold()[0]).toBeVisible());
        });
    },
};

export const TableTab: StoryObj<MutationsProps> = {
    ...Default,
    args: {
        ...Default.args,
        views: ['table'],
    },
    play: async ({ canvasElement }) => {
        await expectMutationAnnotation(canvasElement, 'C241T');
    },
};
