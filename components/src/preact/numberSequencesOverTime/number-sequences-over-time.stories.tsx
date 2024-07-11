import { type StoryObj } from '@storybook/preact';

import { NumberSequencesOverTime, type NumberSequencesOverTimeProps } from './number-sequences-over-time';
import { LAPIS_URL } from '../../constants';
import { LapisUrlContext } from '../LapisUrlContext';

export default {
    title: 'Visualization/NumberSequencesOverTime',
    component: NumberSequencesOverTime,
    parameters: {
        fetchMock: {},
    },
    argTypes: {
        granularity: {
            options: ['day', 'week', 'month', 'year'],
            control: { type: 'radio' },
        },
        views: {
            options: ['bar', 'line', 'table'],
            control: { type: 'check' },
        },
        pageSize: { control: 'object' },
    },
};

const Template: StoryObj<NumberSequencesOverTimeProps> = {
    render: (args) => (
        <LapisUrlContext.Provider value={LAPIS_URL}>
            <NumberSequencesOverTime
                lapisFilter={args.lapisFilter}
                lapisDateField={args.lapisDateField}
                views={args.views}
                width={args.width}
                height={args.height}
                headline={args.headline}
                granularity={args.granularity}
                smoothingWindow={args.smoothingWindow}
                pageSize={args.pageSize}
            />
        </LapisUrlContext.Provider>
    ),
    args: {
        views: ['bar', 'line', 'table'],
        lapisFilter: [
            { displayName: 'EG', lapisFilter: { country: 'USA', pangoLineage: 'EG*', dateFrom: '2023-01-01' } },
        ],
        lapisDateField: 'date',
        width: '100%',
        height: '700px',
        headline: 'Number of sequences over time',
        smoothingWindow: 0,
        granularity: 'month',
        pageSize: 10,
    },
};

export const Table = {
    ...Template,
};

export const TwoVariants = {
    ...Template,
    args: {
        ...Template.args,
        lapisFilter: [
            { displayName: 'EG', lapisFilter: { country: 'USA', pangoLineage: 'EG*', dateTo: '2023-06-30' } },
            { displayName: 'JN.1', lapisFilter: { country: 'USA', pangoLineage: 'JN.1*', dateFrom: '2023-01-01' } },
        ],
    },
};
