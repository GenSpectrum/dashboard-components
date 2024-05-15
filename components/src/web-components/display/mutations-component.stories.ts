import { expect, fireEvent, waitFor } from '@storybook/test';
import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

import './mutations-component';
import '../app';
import { withComponentDocs } from '../../../.storybook/ComponentDocsBlock';
import { LAPIS_URL, NUCLEOTIDE_INSERTIONS_ENDPOINT, NUCLEOTIDE_MUTATIONS_ENDPOINT } from '../../constants';
import nucleotideInsertions from '../../preact/mutations/__mockData__/nucleotideInsertions.json';
import nucleotideMutations from '../../preact/mutations/__mockData__/nucleotideMutations.json';
import { type MutationsProps } from '../../preact/mutations/mutations';
import { withinShadowRoot } from '../withinShadowRoot.story';

const codeExample = String.raw`
<gs-mutations
    variant='{ "country": "Switzerland", "pangoLineage": "B.1.1.7", "dateTo": "2022-01-01" }'
    sequenceType="nucleotide"
    views='["grid", "table", "insertions"]'
></gs-mutations>`;

const meta: Meta<MutationsProps> = {
    title: 'Visualization/Mutations',
    component: 'gs-mutations-component',
    argTypes: {
        variant: { control: 'object' },
        sequenceType: {
            options: ['nucleotide', 'amino acid'],
            control: { type: 'radio' },
        },
        views: {
            options: ['table', 'grid', 'insertions'],
            control: { type: 'check' },
        },
        size: { control: 'object' },
        headline: { control: 'text' },
    },
    args: {
        variant: { country: 'Switzerland', pangoLineage: 'B.1.1.7', dateTo: '2022-01-01' },
        sequenceType: 'nucleotide',
        views: ['grid', 'table', 'insertions'],
        size: { width: '100%', height: '700px' },
        headline: 'Mutations',
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

const Template: StoryObj<MutationsProps> = {
    render: (args) => html`
        <gs-app lapis="${LAPIS_URL}">
            <gs-mutations-component
                .variant=${args.variant}
                .sequenceType=${args.sequenceType}
                .views=${args.views}
                .size=${args.size}
                .headline=${args.headline}
            ></gs-mutations-component>
        </gs-app>
    `,
};

export const Default: StoryObj<MutationsProps> = {
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

export const OnTableTab: StoryObj<MutationsProps> = {
    ...Default,
    play: async ({ canvasElement }) => {
        const canvas = await withinShadowRoot(canvasElement, 'gs-mutations-component');

        await waitFor(() => expect(canvas.getByRole('button', { name: 'Table' })).toBeInTheDocument());

        await fireEvent.click(canvas.getByRole('button', { name: 'Table' }));
    },
};

export const OnInsertionsTab: StoryObj<MutationsProps> = {
    ...Default,
    play: async ({ canvasElement }) => {
        const canvas = await withinShadowRoot(canvasElement, 'gs-mutations-component');

        await waitFor(() => expect(canvas.getByRole('button', { name: 'Insertions' })).toBeInTheDocument());

        await fireEvent.click(canvas.getByRole('button', { name: 'Insertions' }));
    },
};
