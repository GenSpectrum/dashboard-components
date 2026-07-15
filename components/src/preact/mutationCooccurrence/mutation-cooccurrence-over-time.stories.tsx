import { type Meta, type StoryObj } from '@storybook/preact';

import { AGGREGATED_ENDPOINT, LAPIS_URL } from '../../constants';
import referenceGenome from '../../lapisApi/__mockData__/referenceGenome.json';
import { LapisUrlContextProvider } from '../LapisUrlContext';
import { ReferenceGenomeContext } from '../ReferenceGenomeContext';
import mockCooccurrence from './__mockData__/cooccurrence.json';
import {
    MutationCooccurrenceOverTime,
    type MutationCooccurrenceOverTimeProps,
} from './mutation-cooccurrence-over-time';
import { expectInvalidAttributesErrorMessage } from '../shared/stories/expectErrorMessage';
import { playThatExpectsFinishedLoadingEvent } from '../shared/stories/expectFinishedLoadingEvent';

const meta: Meta<MutationCooccurrenceOverTimeProps> = {
    title: 'Visualization/Mutation Cooccurrence Over Time',
    component: MutationCooccurrenceOverTime,
    argTypes: {
        lapisFilter: { control: 'object' },
        positions: { control: 'object' },
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
    },
    parameters: {
        fetchMock: {
            mocks: [
                {
                    matcher: {
                        name: 'cooccurrenceData',
                        url: AGGREGATED_ENDPOINT,
                        body: {
                            pangoLineage: 'JN.1*',
                            dateFrom: '2024-01-15',
                            dateTo: '2024-01-31',
                            fields: ['date', '[123]', '[124]', '[126]'],
                        },
                        matchPartialBody: true,
                    },
                    response: {
                        status: 200,
                        body: mockCooccurrence,
                    },
                },
                {
                    matcher: {
                        name: 'dateRanges',
                        url: AGGREGATED_ENDPOINT,
                        body: {
                            pangoLineage: 'JN.1*',
                            dateFrom: '2024-01-15',
                            dateTo: '2024-01-31',
                            fields: ['date'],
                        },
                        matchPartialBody: true,
                    },
                    response: {
                        status: 200,
                        body: mockCooccurrence,
                    },
                },
            ],
        },
    },
};

export default meta;

export const Default: StoryObj<MutationCooccurrenceOverTimeProps> = {
    render: (args: MutationCooccurrenceOverTimeProps) => (
        <LapisUrlContextProvider value={LAPIS_URL}>
            <ReferenceGenomeContext.Provider value={referenceGenome}>
                <MutationCooccurrenceOverTime {...args} />
            </ReferenceGenomeContext.Provider>
        </LapisUrlContextProvider>
    ),
    args: {
        lapisFilter: { pangoLineage: 'JN.1*', dateFrom: '2024-01-15', dateTo: '2024-01-31' },
        positions: ['[123]', '[124]', '[126]'],
        views: ['grid'],
        granularity: 'week',
        lapisDateField: 'date',
        initialMeanProportionInterval: { min: 0, max: 1 },
        hideGaps: false,
        width: '100%',
        pageSizes: [10, 20, 50],
    },
    play: playThatExpectsFinishedLoadingEvent(),
};

export const InvalidAttributes: StoryObj<MutationCooccurrenceOverTimeProps> = {
    render: (args: MutationCooccurrenceOverTimeProps) => (
        <LapisUrlContextProvider value={LAPIS_URL}>
            <ReferenceGenomeContext.Provider value={referenceGenome}>
                <MutationCooccurrenceOverTime {...args} />
            </ReferenceGenomeContext.Provider>
        </LapisUrlContextProvider>
    ),
    args: {
        ...Default.args,
        // @ts-expect-error -- intentionally invalid
        positions: 'not-an-array',
    },
    play: async ({ canvasElement }) => {
        await expectInvalidAttributesErrorMessage(canvasElement, 'Array must contain at least 1 element(s)');
    },
};
