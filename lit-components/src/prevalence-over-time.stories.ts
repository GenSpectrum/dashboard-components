import type { Meta, StoryObj } from '@storybook/web-components';

import { html } from 'lit';
import './genspectrum-app';
import './prevalence-over-time';
import { PrevalenceOverTimeProps } from './prevalence-over-time';

const meta: Meta<PrevalenceOverTimeProps> = {
    component: 'prevalence-over-time',
    argTypes: {
        numerator: { control: 'object' },
        denominator: { control: 'object' },
        granularity: {
            options: ['day', 'month', 'year'],
            control: { type: 'radio' },
        },
        smoothingWindow: { control: 'number' },
        views: {
            options: ['bar', 'line', 'table'],
            control: { type: 'check' },
        },
    },
};

export default meta;

const Template: StoryObj<PrevalenceOverTimeProps> = {
    render: (args) => html`
        <genspectrum-app lapis="https://lapis.cov-spectrum.org/open/v1/sample">
            <prevalence-over-time
                .numerator=${args.numerator}
                .denominator=${args.denominator}
                .granularity=${args.granularity}
                .smoothingWindow=${args.smoothingWindow}
                .views=${args.views}
            ></prevalence-over-time>
        </genspectrum-app>
    `,
};

export const Monthly = {
    ...Template,
    args: {
        numerator: { country: 'Switzerland', pangoLineage: 'B.1.1.7', dateTo: '2022-01-01' },
        denominator: { country: 'Switzerland', dateTo: '2022-01-01' },
        granularity: 'month',
        smoothingWindow: 0,
        views: ['bar', 'line', 'table'],
    },
};

export const Daily = {
    ...Template,
    args: {
        numerator: { country: 'Switzerland', pangoLineage: 'B.1.1.7', dateTo: '2022-01-01' },
        denominator: { country: 'Switzerland', dateTo: '2022-01-01' },
        granularity: 'day',
        smoothingWindow: 7,
        views: ['line', 'table'],
    },
};
