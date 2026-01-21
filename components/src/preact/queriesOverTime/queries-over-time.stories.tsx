import { type Meta, type StoryObj } from '@storybook/preact';

import { QueriesOverTime, type QueriesOverTimeProps } from './queries-over-time';
import { LAPIS_URL } from '../../constants';
import referenceGenome from '../../lapisApi/__mockData__/referenceGenome.json';
import { LapisUrlContextProvider } from '../LapisUrlContext';
import { ReferenceGenomeContext } from '../ReferenceGenomeContext';
import { playThatExpectsFinishedLoadingEvent } from '../shared/stories/expectFinishedLoadingEvent';
import mockDefaultQueriesOverTime from './__mockData__/defaultMockData/queriesOverTime.json';

const meta: Meta<QueriesOverTimeProps> = {
    title: 'Visualization/Queries over time',
    component: QueriesOverTime,
    argTypes: {
        lapisFilter: { control: 'object' },
        queries: { control: 'object' },
        views: {
            options: ['grid'],
            control: { type: 'check' },
        },
        width: { control: 'text' },
        height: { control: 'text' },
        granularity: {
            options: ['day', 'week', 'month', 'year'],
            control: { type: 'radio' },
        },
        lapisDateField: { control: 'text' },
        initialMeanProportionInterval: { control: 'object' },
        hideGaps: { control: 'boolean' },
        pageSizes: { control: 'object' },
        customColumns: { control: 'object' },
    },
    parameters: {
        fetchMock: {
            mocks: [
                {
                    matcher: {
                        url: `${LAPIS_URL}/component/queriesOverTime`,
                        body: {
                            filters: {
                                pangoLineage: 'JN.1*',
                                dateFrom: '2024-01-15',
                                dateTo: '2024-04-30',
                            },
                            queries: [
                                {
                                    displayLabel: 'BA.1 Lineage',
                                    countQuery: 'pangoLineage:BA.1*',
                                    coverageQuery: '',
                                },
                                {
                                    displayLabel: 'BA.2 Lineage',
                                    countQuery: 'pangoLineage:BA.2*',
                                    coverageQuery: '',
                                },
                                {
                                    displayLabel: 'XBB Lineage',
                                    countQuery: 'pangoLineage:XBB*',
                                    coverageQuery: '',
                                },
                            ],
                            dateRanges: [
                                { dateFrom: '2024-01-01', dateTo: '2024-01-31' },
                                { dateFrom: '2024-02-01', dateTo: '2024-02-29' },
                                { dateFrom: '2024-03-01', dateTo: '2024-03-31' },
                                { dateFrom: '2024-04-01', dateTo: '2024-04-30' },
                            ],
                            dateField: 'date',
                        },
                        matchPartialBody: true,
                        response: {
                            status: 200,
                            body: mockDefaultQueriesOverTime,
                        },
                    },
                },
            ],
        },
    },
};

export default meta;

export const Default: StoryObj<QueriesOverTimeProps> = {
    render: (args: QueriesOverTimeProps) => (
        <LapisUrlContextProvider value={LAPIS_URL}>
            <ReferenceGenomeContext.Provider value={referenceGenome}>
                <QueriesOverTime {...args} />
            </ReferenceGenomeContext.Provider>
        </LapisUrlContextProvider>
    ),
    args: {
        lapisFilter: { pangoLineage: 'JN.1*', dateFrom: '2024-01-15', dateTo: '2024-04-30' },
        queries: [
            {
                displayLabel: 'BA.1 Lineage',
                countQuery: 'pangoLineage:BA.1*',
                coverageQuery: '',
            },
            {
                displayLabel: 'BA.2 Lineage',
                countQuery: 'pangoLineage:BA.2*',
                coverageQuery: '',
            },
            {
                displayLabel: 'XBB Lineage',
                countQuery: 'pangoLineage:XBB*',
                coverageQuery: '',
            },
        ],
        views: ['grid'],
        width: '100%',
        granularity: 'month',
        lapisDateField: 'date',
        initialMeanProportionInterval: { min: 0.05, max: 1 },
        hideGaps: false,
        pageSizes: [10, 20, 30, 40, 50],
    },
};

export const FiresFinishedLoadingEvent: StoryObj<QueriesOverTimeProps> = {
    ...Default,
    play: playThatExpectsFinishedLoadingEvent(),
};
