import type { Meta, StoryObj } from '@storybook/web-components';

import { html } from 'lit';
import './app';
import './relative-growth-advantage';
import { RelativeGrowthAdvantageProps } from './relative-growth-advantage';

const meta: Meta<RelativeGrowthAdvantageProps> = {
    title: 'Visualization/Relative growth advantage',
    component: 'gs-relative-growth-advantage',
    argTypes: {
        numerator: { control: 'object' },
        denominator: { control: 'object' },
        generationTime: { control: 'number' },
        views: {
            options: ['line'],
            control: { type: 'check' },
        },
    },
};

export default meta;

const Template: StoryObj<RelativeGrowthAdvantageProps> = {
    render: (args) => html`
        <gs-app lapis="https://lapis.cov-spectrum.org/open/v1/sample">
            <gs-relative-growth-advantage
                .numerator=${args.numerator}
                .denominator=${args.denominator}
                .generationTime=${args.generationTime}
                .views=${args.views}
            ></gs-relative-growth-advantage>
        </gs-app>
    `,
};

export const Default = {
    ...Template,
    args: {
        numerator: { country: 'Switzerland', pangoLineage: 'B.1.1.7', dateTo: '2022-01-01' },
        denominator: { country: 'Switzerland', dateTo: '2022-01-01' },
        generationTime: 7,
        views: ['line'],
    },
};
