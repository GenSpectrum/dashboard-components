import { expect, fireEvent, waitFor } from '@storybook/test';
import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

import './mutation-comparison-component';
import '../app';
import { LAPIS_URL, NUCLEOTIDE_INSERTIONS_ENDPOINT, NUCLEOTIDE_MUTATIONS_ENDPOINT } from '../../constants';
import nucleotideInsertionsOtherVariant from '../../preact/mutationComparison/__mockData__/nucleotideInsertionsOtherVariant.json';
import nucleotideInsertionsSomeVariant from '../../preact/mutationComparison/__mockData__/nucleotideInsertionsSomeVariant.json';
import nucleotideMutationsOtherVariant from '../../preact/mutationComparison/__mockData__/nucleotideMutationsOtherVariant.json';
import nucleotideMutationsSomeVariant from '../../preact/mutationComparison/__mockData__/nucleotideMutationsSomeVariant.json';
import { type MutationComparisonProps } from '../../preact/mutationComparison/mutation-comparison';
import { withinShadowRoot } from '../withinShadowRoot.story';

const meta: Meta<MutationComparisonProps> = {
    title: 'Visualization/Mutation comparison',
    component: 'gs-mutation-comparison-component',
    argTypes: {
        variants: { control: 'object' },
        sequenceType: {
            options: ['nucleotide', 'amino acid'],
            control: { type: 'radio' },
        },
        views: {
            options: ['table', 'venn'],
            control: { type: 'check' },
        },
    },
};

export default meta;

const Template: StoryObj<MutationComparisonProps> = {
    render: (args) => html`
        <div class="w-11/12 h-11/12">
            <gs-app lapis="${LAPIS_URL}">
                <gs-mutation-comparison-component
                    .variants=${args.variants}
                    .sequenceType=${args.sequenceType}
                    .views=${args.views}
                ></gs-mutation-comparison-component>
            </gs-app>
        </div>
    `,
};

const dateTo = '2022-01-01';
const dateFrom = '2021-01-01';

export const Default: StoryObj<MutationComparisonProps> = {
    ...Template,
    args: {
        variants: [
            {
                displayName: 'Some variant',
                lapisFilter: { country: 'Switzerland', pangoLineage: 'B.1.1.7', dateTo },
            },
            {
                displayName: 'Other variant',
                lapisFilter: {
                    country: 'Switzerland',
                    pangoLineage: 'B.1.1.7',
                    dateFrom,
                    dateTo,
                },
            },
        ],
        sequenceType: 'nucleotide',
        views: ['table', 'venn'],
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
                            dateTo,
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
                        query: { country: 'Switzerland', pangoLineage: 'B.1.1.7', dateTo },
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
                            dateFrom,
                            dateTo,
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
                        query: { country: 'Switzerland', pangoLineage: 'B.1.1.7', dateFrom, dateTo },
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

export const VennDiagram: StoryObj<MutationComparisonProps> = {
    ...Default,
    play: async ({ canvasElement }) => {
        const canvas = await withinShadowRoot(canvasElement, 'gs-mutation-comparison-component');

        await waitFor(() => expect(canvas.getByLabelText('Venn', { selector: 'input' })).toBeInTheDocument());

        await fireEvent.click(canvas.getByLabelText('Venn', { selector: 'input' }));

        await waitFor(() =>
            expect(
                canvas.getByText('You have no elements selected. Click in the venn diagram to select.'),
            ).toBeVisible(),
        );
    },
};
