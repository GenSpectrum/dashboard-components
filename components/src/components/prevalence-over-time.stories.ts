import type { Meta, StoryObj } from '@storybook/web-components';

import { html } from 'lit';
import './app';
import './prevalence-over-time';
import { PrevalenceOverTimeProps } from './prevalence-over-time';
import { LAPIS_URL } from '../constants';

const meta: Meta<PrevalenceOverTimeProps> = {
    title: 'Visualization/Prevalence over time',
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
            options: ['bar', 'line', 'bubble', 'table'],
            control: { type: 'check' },
        },
    },
};

export default meta;

const Template: StoryObj<PrevalenceOverTimeProps> = {
    render: (args) => html`
        <gs-app lapis="${LAPIS_URL}">
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

export const TwoVariants = {
    ...Template,
    args: {
        numerator: [
            { displayName: 'EG', country: 'USA', pangoLineage: 'EG*', dateFrom: '2023-01-01' },
            { displayName: 'JN.1', country: 'USA', pangoLineage: 'JN.1*', dateFrom: '2023-01-01' },
        ],
        denominator: { country: 'USA', dateFrom: '2023-01-01' },
        granularity: 'month',
        smoothingWindow: 0,
        views: ['bar', 'line', 'bubble', 'table'],
    },
};

export const OneVariant = {
    ...Template,
    args: {
        numerator: { displayName: 'EG', country: 'USA', pangoLineage: 'BA.2.86*', dateFrom: '2023-10-01' },
        denominator: { country: 'USA', dateFrom: '2023-10-01' },
        granularity: 'day',
        smoothingWindow: 7,
        views: ['bar', 'line', 'bubble', 'table'],
    },
};
