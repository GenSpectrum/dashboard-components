import type { Meta, StoryObj } from '@storybook/web-components';

import { html } from 'lit';
import './app';
import './prevalence-over-time';
import { PrevalenceOverTimeProps } from './prevalence-over-time';

const meta: Meta<PrevalenceOverTimeProps> = {
    component: 'gs-prevalence-over-time',
    argTypes: {
        numerator: { control: 'object' },
        denominator: { control: 'object' },
        granularity: {
            options: ['day', 'week', 'month', 'year'],
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
        <gs-app lapis="https://lapis.cov-spectrum.org/open/v1/sample">
            <gs-prevalence-over-time
                .numerator=${args.numerator}
                .denominator=${args.denominator}
                .granularity=${args.granularity}
                .smoothingWindow=${args.smoothingWindow}
                .views=${args.views}
            ></gs-prevalence-over-time>
        </gs-app>
    `,
};

export const Monthly = {
    ...Template,
    args: {
        numerator: [
            { displayName: 'B.1.1.7', country: 'Switzerland', pangoLineage: 'B.1.1.7*', dateTo: '2022-01-01' },
            { displayName: 'B.1.617.2', country: 'Switzerland', pangoLineage: 'B.1.617.2*', dateTo: '2022-01-01' },
        ],
        denominator: { country: 'Switzerland', dateTo: '2022-01-01' },
        granularity: 'month',
        smoothingWindow: 0,
        views: ['bar', 'line', 'table'],
    },
};

export const Daily = {
    ...Template,
    args: {
        numerator: { displayName: 'B.1.1.7', country: 'Switzerland', pangoLineage: 'B.1.1.7', dateTo: '2022-01-01' },
        denominator: { country: 'Switzerland', dateTo: '2022-01-01' },
        granularity: 'day',
        smoothingWindow: 7,
        views: ['line', 'table'],
    },
};
