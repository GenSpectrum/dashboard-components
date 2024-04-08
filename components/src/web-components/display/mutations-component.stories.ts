import { expect, fireEvent, waitFor } from '@storybook/test';
import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

import './mutations-component';
import '../app';
import { LAPIS_URL, NUCLEOTIDE_INSERTIONS_ENDPOINT, NUCLEOTIDE_MUTATIONS_ENDPOINT } from '../../constants';
import nucleotideInsertions from '../../preact/mutations/__mockData__/nucleotideInsertions.json';
import nucleotideMutations from '../../preact/mutations/__mockData__/nucleotideMutations.json';
import { type MutationsProps } from '../../preact/mutations/mutations';
import { withinShadowRoot } from '../withinShadowRoot.story';

const meta: Meta<MutationsProps> = {
    title: 'Visualization/Mutations',
    component: 'gs-mutations',
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
    },
};

export default meta;

const Template: StoryObj<MutationsProps> = {
    render: (args) => html`
        <div class="w-11/12 h-11/12">
            <gs-app lapis="${LAPIS_URL}">
                <gs-mutations-component
                    .variant=${args.variant}
                    .sequenceType=${args.sequenceType}
                    .views=${args.views}
                ></gs-mutations-component>
            </gs-app>
        </div>
    `,
};

export const Default: StoryObj<MutationsProps> = {
    ...Template,
    args: {
        variant: { country: 'Switzerland', pangoLineage: 'B.1.1.7', dateTo: '2022-01-01' },
        sequenceType: 'nucleotide',
        views: ['grid', 'table', 'insertions'],
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

        await waitFor(() => expect(canvas.getByLabelText('Table', { selector: 'input' })).toBeInTheDocument());

        await fireEvent.click(canvas.getByLabelText('Table', { selector: 'input' }));
    },
};

export const OnInsertionsTab: StoryObj<MutationsProps> = {
    ...Default,
    play: async ({ canvasElement }) => {
        const canvas = await withinShadowRoot(canvasElement, 'gs-mutations-component');

        await waitFor(() => expect(canvas.getByLabelText('Insertions', { selector: 'input' })).toBeInTheDocument());

        await fireEvent.click(canvas.getByLabelText('Insertions', { selector: 'input' }));
    },
};
