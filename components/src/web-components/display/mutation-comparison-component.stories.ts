import { expect, fireEvent, waitFor } from '@storybook/test';
import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

import './mutation-comparison-component';
import '../app';
import { withComponentDocs } from '../../../.storybook/ComponentDocsBlock';
import { LAPIS_URL, NUCLEOTIDE_MUTATIONS_ENDPOINT } from '../../constants';
import nucleotideMutationsOtherVariant from '../../preact/mutationComparison/__mockData__/nucleotideMutationsOtherVariant.json';
import nucleotideMutationsSomeVariant from '../../preact/mutationComparison/__mockData__/nucleotideMutationsSomeVariant.json';
import { type MutationComparisonProps } from '../../preact/mutationComparison/mutation-comparison';
import { withinShadowRoot } from '../withinShadowRoot.story';

const codeExample = String.raw`
<gs-mutation-comparison-component
    variants='[{ "displayName": "variant1", "lapisFilter": { "country": "Switzerland" }}, { "displayName": "variant2", "lapisFilter": { "country": "Germany" }}]'
    sequenceType="nucleotide"
    views='["table", "venn"]'
></gs-mutation-comparison-component>`;

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
        size: { control: 'object' },
        headline: { control: 'text' },
    },
    parameters: withComponentDocs({
        componentDocs: {
            tag: 'gs-mutation-comparison-component',
            opensShadowDom: true,
            expectsChildren: false,
            codeExample,
        },
    }),
    tags: ['autodocs'],
};

export default meta;

const Template: StoryObj<MutationComparisonProps> = {
    render: (args) => html`
        <gs-app lapis="${LAPIS_URL}">
            <gs-mutation-comparison-component
                .variants=${args.variants}
                .sequenceType=${args.sequenceType}
                .views=${args.views}
                .size=${args.size}
                .headline=${args.headline}
            ></gs-mutation-comparison-component>
        </gs-app>
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
        size: { width: '100%', height: '700px' },
        headline: 'Mutation comparison',
    },
    parameters: {
        fetchMock: {
            mocks: [
                {
                    matcher: {
                        name: 'nucleotideMutationsSomeVariant',
                        url: NUCLEOTIDE_MUTATIONS_ENDPOINT,
                        body: {
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
                        name: 'nucleotideMutationsOtherVariant',
                        url: NUCLEOTIDE_MUTATIONS_ENDPOINT,
                        body: {
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
            ],
        },
    },
    play: async ({ canvasElement, step }) => {
        const canvas = await withinShadowRoot(canvasElement, 'gs-mutation-comparison-component');

        await step('Min and max proportions should be 50% and 100%', async () => {
            const minInput = () => canvas.getAllByLabelText('%')[0];
            const maxInput = () => canvas.getAllByLabelText('%')[1];

            await waitFor(() => expect(minInput()).toHaveValue(50));
            await waitFor(() => expect(maxInput()).toHaveValue(100));
        });
    },
};

export const VennDiagram: StoryObj<MutationComparisonProps> = {
    ...Default,
    play: async ({ canvasElement, step }) => {
        const canvas = await withinShadowRoot(canvasElement, 'gs-mutation-comparison-component');

        await step('Switch to Venn diagram view', async () => {
            await waitFor(() => expect(canvas.getByRole('button', { name: 'Venn' })).toBeInTheDocument());

            await fireEvent.click(canvas.getByRole('button', { name: 'Venn' }));

            await waitFor(() =>
                expect(
                    canvas.getByText('You have no elements selected. Click in the venn diagram to select.'),
                ).toBeVisible(),
            );
        });
    },
};
