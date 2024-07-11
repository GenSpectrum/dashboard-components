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
    },
};

export const Table = {
    ...Template,
};