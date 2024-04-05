import { type Meta, type StoryObj } from '@storybook/preact';
import { expect, userEvent, waitFor, within } from '@storybook/test';

import nucleotideInsertionsOtherVariant from './__mockData__/nucleotideInsertionsOtherVariant.json';
import nucleotideInsertionsSomeVariant from './__mockData__/nucleotideInsertionsSomeVariant.json';
import nucleotideMutationsOtherVariant from './__mockData__/nucleotideMutationsOtherVariant.json';
import nucleotideMutationsSomeVariant from './__mockData__/nucleotideMutationsSomeVariant.json';
import { MutationComparison, type MutationComparisonProps } from './mutation-comparison';
import { LAPIS_URL, NUCLEOTIDE_INSERTIONS_ENDPOINT, NUCLEOTIDE_MUTATIONS_ENDPOINT } from '../../constants';
import { LapisUrlContext } from '../LapisUrlContext';

const dateToSomeVariant = '2022-01-01';

const dateFromOtherVariant = '2021-01-01';
const dateToOtherVariant = '2022-01-02';

const meta: Meta<MutationComparisonProps> = {
    title: 'Visualization/Mutation comparison',
    component: MutationComparison,
    argTypes: {
        variants: [{ control: 'object' }],
        sequenceType: {
            options: ['nucleotide', 'amino acid'],
            control: { type: 'radio' },
        },
        views: {
            options: ['table', 'venn'],
            control: { type: 'check' },
        },
    },
    parameters: {
        fetchMock: {
            mocks: [
                {
                    matcher: {
                        name: 'nucleotideMutationsSomeVariant',
                        url: NUCLEOTIDE_MUTATIONS_ENDPOINT,
                        query: {
                            country: 'Switzerland',
                            pangoLineage: 'B.1.1.7',
                            dateTo: dateToSomeVariant,
                            minProportion: 0,
                        },
                    },
                    response: {
                        status: 200,
                        body: nucleotideMutationsSomeVariant,
                    },
                },
                {
                    matcher: {
                        name: 'nucleotideInsertionsSomeVariant',
                        url: NUCLEOTIDE_INSERTIONS_ENDPOINT,
                        query: { country: 'Switzerland', pangoLineage: 'B.1.1.7', dateTo: dateToSomeVariant },
                    },
                    response: {
                        status: 200,
                        body: nucleotideInsertionsSomeVariant,
                    },
                },
                {
                    matcher: {
                        name: 'nucleotideMutationsOtherVariant',
                        url: NUCLEOTIDE_MUTATIONS_ENDPOINT,
                        query: {
                            country: 'Switzerland',
                            pangoLineage: 'B.1.1.7',
                            dateFrom: dateFromOtherVariant,
                            dateTo: dateToOtherVariant,
                            minProportion: 0,
                        },
                    },
                    response: {
                        status: 200,
                        body: nucleotideMutationsOtherVariant,
                    },
                },
                {
                    matcher: {
                        name: 'nucleotideInsertionsOtherVariant',
                        url: NUCLEOTIDE_INSERTIONS_ENDPOINT,
                        query: {
                            country: 'Switzerland',
                            pangoLineage: 'B.1.1.7',
                            dateFrom: dateFromOtherVariant,
                            dateTo: dateToOtherVariant,
                        },
                    },
                    response: {
                        status: 200,
                        body: nucleotideInsertionsOtherVariant,
                    },
                },
            ],
        },
    },
};

export default meta;

const Template: StoryObj<MutationComparisonProps> = {
    render: (args) => (
        <LapisUrlContext.Provider value={LAPIS_URL}>
            <MutationComparison variants={args.variants} sequenceType={args.sequenceType} views={args.views} />
        </LapisUrlContext.Provider>
    ),
};

export const TwoVariants: StoryObj<MutationComparisonProps> = {
    ...Template,
    args: {
        variants: [
            {
                displayName: 'Some variant',
                lapisFilter: { country: 'Switzerland', pangoLineage: 'B.1.1.7', dateTo: dateToSomeVariant },
            },
            {
                displayName: 'Other variant',
                lapisFilter: {
                    country: 'Switzerland',
                    pangoLineage: 'B.1.1.7',
                    dateFrom: dateFromOtherVariant,
                    dateTo: dateToOtherVariant,
                },
            },
        ],
        sequenceType: 'nucleotide',
        views: ['table', 'venn'],
    },
};

export const FilterForOnlyDeletions: StoryObj<MutationComparisonProps> = {
    ...TwoVariants,
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        const someSubstitution = () => canvas.queryByText('C241T');
        const someDeletion = () => canvas.queryByText('G199-');

        await waitFor(() => expect(someSubstitution()).toBeVisible());
        await waitFor(() => expect(someDeletion()).toBeVisible());

        canvas.getByRole('button', { name: /Types:/ }).click();
        canvas.getByLabelText('Substitutions').click();

        await waitFor(() => expect(someSubstitution()).not.toBeInTheDocument());
        await waitFor(() => expect(someDeletion()).toBeVisible());
    },
};

export const FilterByProportion: StoryObj<MutationComparisonProps> = {
    ...TwoVariants,
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        const rareSubstitution = () => canvas.queryByText('T1234C');
        const frequentSubstitution = () => canvas.queryByText('C241T');
        const minInput = () => canvas.getAllByLabelText('%')[0];
        const maxInput = () => canvas.getAllByLabelText('%')[1];

        await waitFor(() => expect(rareSubstitution()).not.toBeInTheDocument());
        await waitFor(() => expect(frequentSubstitution()).toBeVisible());

        await userEvent.click(canvas.getByRole('button', { name: /Proportion/ }));
        await userEvent.clear(minInput());
        await userEvent.type(minInput(), '1');

        await waitFor(() => expect(rareSubstitution()).toBeInTheDocument());
        await waitFor(() => expect(frequentSubstitution()).toBeVisible());

        await userEvent.clear(maxInput());
        await userEvent.type(maxInput(), '50');

        await waitFor(() => expect(rareSubstitution()).toBeInTheDocument());
        await waitFor(() => expect(frequentSubstitution()).not.toBeInTheDocument());
    },
};
