import { expect, fireEvent, waitFor } from '@storybook/test';
import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

import './gs-mutations';
import '../app';
import { withComponentDocs } from '../../../.storybook/ComponentDocsBlock';
import { LAPIS_URL, NUCLEOTIDE_INSERTIONS_ENDPOINT, NUCLEOTIDE_MUTATIONS_ENDPOINT } from '../../constants';
import nucleotideInsertions from '../../preact/mutations/__mockData__/nucleotideInsertions.json';
import nucleotideMutations from '../../preact/mutations/__mockData__/nucleotideMutations.json';
import { type MutationsProps } from '../../preact/mutations/mutations';
import { withinShadowRoot } from '../withinShadowRoot.story';

const codeExample = String.raw`
<gs-mutations
    lapisFilter='{ "country": "Switzerland", "pangoLineage": "B.1.1.7", "dateTo": "2022-01-01" }'
    sequenceType="nucleotide"
    views='["grid", "table", "insertions"]'
    headline="Mutations"
    width='100%'
    height='700px'
    pageSize="10"
></gs-mutations>`;

const meta: Meta<Required<MutationsProps>> = {
    title: 'Visualization/Mutations',
    component: 'gs-mutations',
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
        headline: { control: 'text' },
        pageSize: { control: 'object' },
    },
    args: {
        lapisFilter: { country: 'Switzerland', pangoLineage: 'B.1.1.7', dateTo: '2022-01-01' },
        sequenceType: 'nucleotide',
        views: ['grid', 'table', 'insertions'],
        width: '100%',
        height: '700px',
        headline: 'Mutations',
        pageSize: 10,
    },
    parameters: withComponentDocs({
        componentDocs: {
            opensShadowDom: true,
            expectsChildren: false,
            codeExample,
        },
    }),
    tags: ['autodocs'],
};

export default meta;

const Template: StoryObj<Required<MutationsProps>> = {
    render: (args) => html`
        <gs-app lapis="${LAPIS_URL}">
            <gs-mutations
                .lapisFilter=${args.lapisFilter}
                .sequenceType=${args.sequenceType}
                .views=${args.views}
                .width=${args.width}
                .height=${args.height}
                .headline=${args.headline}
                .pageSize=${args.pageSize}
            ></gs-mutations>
        </gs-app>
    `,
};

export const Default: StoryObj<Required<MutationsProps>> = {
    ...Template,
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

export const OnTableTab: StoryObj<Required<MutationsProps>> = {
    ...Default,
    play: async ({ canvasElement }) => {
        const canvas = await withinShadowRoot(canvasElement, 'gs-mutations');

        await waitFor(() => expect(canvas.getByRole('button', { name: 'Table' })).toBeInTheDocument());

        await fireEvent.click(canvas.getByRole('button', { name: 'Table' }));
    },
};

export const OnInsertionsTab: StoryObj<Required<MutationsProps>> = {
    ...Default,
    play: async ({ canvasElement }) => {
        const canvas = await withinShadowRoot(canvasElement, 'gs-mutations');

        await waitFor(() => expect(canvas.getByRole('button', { name: 'Insertions' })).toBeInTheDocument());

        await fireEvent.click(canvas.getByRole('button', { name: 'Insertions' }));
    },
};
