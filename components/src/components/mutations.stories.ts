import type { Meta, StoryObj } from '@storybook/web-components';

import { html } from 'lit';
import './app';
import './mutations';
import { MutationsProps } from './mutations';
import { LAPIS_URL } from '../constants';

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
            options: ['table', 'grid'],
            control: { type: 'check' },
        },
    },
};

export default meta;

const Template: StoryObj<MutationsProps> = {
    render: (args) => html`
        <gs-app lapis="${LAPIS_URL}">
            <gs-mutations
                .variant=${args.variant}
                .sequenceType=${args.sequenceType}
                .views=${args.views}
            ></gs-mutations>
        </gs-app>
    `,
};

export const Default = {
    ...Template,
    args: {
        variant: { country: 'Switzerland', pangoLineage: 'B.1.1.7', dateTo: '2022-01-01' },
        sequenceType: 'nucleotide',
        views: ['grid', 'table'],
    },
};
