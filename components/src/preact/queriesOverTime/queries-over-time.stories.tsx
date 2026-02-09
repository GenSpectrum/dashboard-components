import { type Meta, type StoryObj } from '@storybook/preact';
import { expect, userEvent, waitFor } from '@storybook/test';
import { type Canvas } from '@storybook/types';

import { LAPIS_URL } from '../../constants';
import referenceGenome from '../../lapisApi/__mockData__/referenceGenome.json';
import { LapisUrlContextProvider } from '../LapisUrlContext';
import { ReferenceGenomeContext } from '../ReferenceGenomeContext';
import { expectInvalidAttributesErrorMessage } from '../shared/stories/expectErrorMessage';
import { playThatExpectsFinishedLoadingEvent } from '../shared/stories/expectFinishedLoadingEvent';
import mockDefaultQueriesOverTime from './__mockData__/defaultMockData/queriesOverTime.json';
import mockManyQueriesOverTime from './__mockData__/manyQueries.json';
import mock1800sQueriesOverTime from './__mockData__/request1800s.json';
import mockWithGapsQueriesOverTime from './__mockData__/withGaps.json';
import { QueriesOverTime, type QueriesOverTimeProps } from './queries-over-time';

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
                                    displayLabel: 'S:F456L (single mutation)',
                                    countQuery: 'S:456L',
                                    coverageQuery: '!S:456N',
                                },
                                {
                                    displayLabel: 'R346T + F456L (combination)',
                                    countQuery: 'S:346T & S:456L',
                                    coverageQuery: '!S:346N & !S:456N',
                                },
                                {
                                    displayLabel: 'C22916T or T22917G (nucleotide OR)',
                                    countQuery: 'C22916T | T22917G',
                                    coverageQuery: '!22916N & !22917N',
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
                displayLabel: 'S:F456L (single mutation)',
                countQuery: 'S:456L',
                coverageQuery: '!S:456N',
            },
            {
                displayLabel: 'R346T + F456L (combination)',
                countQuery: 'S:346T & S:456L',
                coverageQuery: '!S:346N & !S:456N',
            },
            {
                displayLabel: 'C22916T or T22917G (nucleotide OR)',
                countQuery: 'C22916T | T22917G',
                coverageQuery: '!22916N & !22917N',
            },
        ],
        views: ['grid'],
        width: '100%',
        granularity: 'month',
        lapisDateField: 'date',
        initialMeanProportionInterval: { min: 0, max: 1 },
        hideGaps: false,
        pageSizes: [10, 20, 30, 40, 50],
    },
};

export const FiresFinishedLoadingEvent: StoryObj<QueriesOverTimeProps> = {
    ...Default,
    play: playThatExpectsFinishedLoadingEvent(),
};

export const ShowsNoDataWhenNoQueriesMatch: StoryObj<QueriesOverTimeProps> = {
    ...Default,
    args: {
        ...Default.args,
        lapisFilter: { dateFrom: '1800-01-01', dateTo: '1800-01-02' },
        height: '700px',
        granularity: 'year',
    },
    parameters: {
        fetchMock: {
            mocks: [
                {
                    matcher: {
                        url: `${LAPIS_URL}/component/queriesOverTime`,
                        body: {
                            filters: { dateFrom: '1800-01-01', dateTo: '1800-01-02' },
                            dateRanges: [{ dateFrom: '1800-01-01', dateTo: '1800-12-31' }],
                            dateField: 'date',
                        },
                        matchPartialBody: true,
                        response: {
                            status: 200,
                            body: mock1800sQueriesOverTime,
                        },
                    },
                },
            ],
        },
    },
    play: async ({ canvas }) => {
        await waitFor(() => expect(canvas.getByText('No data available.', { exact: false })).toBeVisible());
    },
};

export const UsesHideGaps: StoryObj<QueriesOverTimeProps> = {
    ...Default,
    args: {
        ...Default.args,
        queries: [
            { displayLabel: 'S:F456L', countQuery: 'S:456L', coverageQuery: '!S:456N' },
            { displayLabel: 'S:R346T', countQuery: 'S:346T', coverageQuery: '!S:346N' },
            { displayLabel: 'S:Q493E', countQuery: 'S:493E', coverageQuery: '!S:493N' },
        ],
        lapisFilter: { pangoLineage: 'JN.1*', dateFrom: '2024-01-15', dateTo: '2024-07-10' },
        granularity: 'month',
    },
    parameters: {
        fetchMock: {
            mocks: [
                {
                    matcher: {
                        url: `${LAPIS_URL}/component/queriesOverTime`,
                        body: {
                            filters: { pangoLineage: 'JN.1*', dateFrom: '2024-01-15', dateTo: '2024-07-10' },
                            dateRanges: [
                                { dateFrom: '2024-01-01', dateTo: '2024-01-31' },
                                { dateFrom: '2024-02-01', dateTo: '2024-02-29' },
                                { dateFrom: '2024-03-01', dateTo: '2024-03-31' },
                                { dateFrom: '2024-04-01', dateTo: '2024-04-30' },
                                { dateFrom: '2024-05-01', dateTo: '2024-05-31' },
                                { dateFrom: '2024-06-01', dateTo: '2024-06-30' },
                                { dateFrom: '2024-07-01', dateTo: '2024-07-31' },
                            ],
                            queries: [
                                { displayLabel: 'S:F456L', countQuery: 'S:456L', coverageQuery: '!S:456N' },
                                { displayLabel: 'S:R346T', countQuery: 'S:346T', coverageQuery: '!S:346N' },
                                { displayLabel: 'S:Q493E', countQuery: 'S:493E', coverageQuery: '!S:493N' },
                            ],
                            dateField: 'date',
                        },
                        response: {
                            status: 200,
                            body: mockWithGapsQueriesOverTime,
                        },
                    },
                },
            ],
        },
    },
    play: async ({ canvas, step }) => {
        await expectDateRangeOnPage(canvas, '2024-04');

        await step('hide gaps', async () => {
            const hideGapsButton = canvas.getByRole('button', { name: 'Hide gaps' });
            await userEvent.click(hideGapsButton);
        });

        const filteredDateRange = canvas.queryByText('2024-04');
        await expect(filteredDateRange).not.toBeInTheDocument();

        await step('un-hide gaps', async () => {
            const hideGapsButton = canvas.getByRole('button', { name: 'Gaps hidden' });
            await userEvent.click(hideGapsButton);
        });

        await expectDateRangeOnPage(canvas, '2024-04');
    },
};

export const UsesPagination: StoryObj<QueriesOverTimeProps> = {
    ...Default,
    args: {
        ...Default.args,
        queries: [
            { displayLabel: 'S:F456L', countQuery: 'S:456L', coverageQuery: '!S:456N' },
            { displayLabel: 'S:R346T', countQuery: 'S:346T', coverageQuery: '!S:346N' },
            { displayLabel: 'S:Q493E', countQuery: 'S:493E', coverageQuery: '!S:493N' },
            { displayLabel: 'S:F486P', countQuery: 'S:486P', coverageQuery: '!S:486N' },
            { displayLabel: 'S:N460K', countQuery: 'S:460K', coverageQuery: '!S:460N' },
            { displayLabel: 'S:L455F', countQuery: 'S:455F', coverageQuery: '!S:455N' },
            { displayLabel: 'S:L455S', countQuery: 'S:455S', coverageQuery: '!S:455N' },
            { displayLabel: 'S:T572I', countQuery: 'S:572I', coverageQuery: '!S:572N' },
            { displayLabel: 'S:R190S', countQuery: 'S:190S', coverageQuery: '!S:190N' },
            { displayLabel: 'S:R190T', countQuery: 'S:190T', coverageQuery: '!S:190N' },
            { displayLabel: 'S:K478T', countQuery: 'S:478T', coverageQuery: '!S:478N' },
            { displayLabel: 'S:T22N', countQuery: 'S:22N', coverageQuery: '!S:22N' },
            { displayLabel: 'S:S31P', countQuery: 'S:31P', coverageQuery: '!S:31N' },
            { displayLabel: 'ORF1b:S997L', countQuery: 'ORF1b:997L', coverageQuery: '!ORF1b:997N' },
            { displayLabel: 'C875A', countQuery: 'C875A', coverageQuery: '!875N' },
        ],
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
                        },
                        matchPartialBody: true,
                        response: {
                            status: 200,
                            body: mockManyQueriesOverTime,
                        },
                    },
                },
            ],
        },
    },
    play: async ({ canvas, step }) => {
        const queryOnFirstPage = 'S:F456L';
        const queryOnSecondPage = 'S:K478T';
        await expectQueryOnPage(canvas, queryOnFirstPage);

        await step('Navigate to next page', async () => {
            canvas.getByRole('button', { name: 'Next page' }).click();

            await expectQueryOnPage(canvas, queryOnSecondPage);
        });

        await step('Use goto page input', async () => {
            const gotoPageInput = canvas.getByRole('spinbutton', { name: 'Enter page number to go to' });
            await userEvent.clear(gotoPageInput);
            await userEvent.type(gotoPageInput, '1');
            await userEvent.tab();

            await expectQueryOnPage(canvas, queryOnFirstPage);
        });

        await step('Change number of rows per page', async () => {
            const pageSizeSelector = canvas.getByLabelText('Select number of rows per page');
            await userEvent.selectOptions(pageSizeSelector, '20');

            await expectQueryOnPage(canvas, queryOnFirstPage);
            await expectQueryOnPage(canvas, queryOnSecondPage);
        });
    },
};

export const UsesQueryFilter: StoryObj<QueriesOverTimeProps> = {
    ...Default,
    play: async ({ canvas, step }) => {
        await expectQueryOnPage(canvas, 'S:F456L (single mutation)');

        await step('input filter', async () => {
            const filterInput = canvas.getByPlaceholderText('Filter queries...');
            await userEvent.type(filterInput, 'nucleotide');
        });

        await step('should show only matching filter', async () => {
            await expectQueryOnPage(canvas, 'C22916T or T22917G (nucleotide OR)');

            const filteredQuery = canvas.queryByText('S:F456L (single mutation)');
            await expect(filteredQuery).not.toBeInTheDocument();
        });
    },
};

export const WithCustomColumns: StoryObj<QueriesOverTimeProps> = {
    ...Default,
    args: {
        ...Default.args,
        queries: [
            { displayLabel: 'S:F456L', countQuery: 'S:456L', coverageQuery: '!S:456N' },
            { displayLabel: 'S:R346T', countQuery: 'S:346T', coverageQuery: '!S:346N' },
            { displayLabel: 'S:Q493E', countQuery: 'S:493E', coverageQuery: '!S:493N' },
        ],
        customColumns: [
            {
                header: 'Jaccard Index',
                values: {
                    'S:F456L': 0.75,
                    'S:R346T': 'Foobar',
                },
            },
        ],
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
                        },
                        matchPartialBody: true,
                        response: {
                            status: 200,
                            body: mockWithGapsQueriesOverTime,
                        },
                    },
                },
            ],
        },
    },
    play: async ({ canvas }) => {
        await waitFor(() => expect(canvas.getByText('Jaccard Index')).toBeVisible(), {
            timeout: 5000,
        });

        await waitFor(() => expect(canvas.getByText('0.75')).toBeVisible());

        await waitFor(() => expect(canvas.getByText('Foobar')).toBeVisible());
    },
};

export const ShowsNoDataMessageWhenThereAreNoDatesInFilter: StoryObj<QueriesOverTimeProps> = {
    ...Default,
    args: {
        ...Default.args,
        lapisFilter: { dateFrom: '2345-01-01', dateTo: '2020-01-02' },
        height: '700px',
        granularity: 'year',
    },
    parameters: {
        fetchMock: {
            mocks: [
                {
                    matcher: {
                        url: `${LAPIS_URL}/component/queriesOverTime`,
                        body: {
                            filters: { dateFrom: '2345-01-01', dateTo: '2020-01-02' },
                            dateField: 'date',
                        },
                        matchPartialBody: true,
                        response: {
                            status: 200,
                            body: {
                                data: { queries: [], dateRanges: [], data: [], totalCountsByDateRange: [] },
                            },
                        },
                    },
                },
            ],
        },
    },
    play: async ({ canvas }) => {
        await waitFor(() => expect(canvas.getByText('No data available.', { exact: false })).toBeVisible(), {
            timeout: 10000,
        });
    },
};

export const ShowsNoDataMessageForStrictFilters: StoryObj<QueriesOverTimeProps> = {
    ...Default,
    play: async ({ canvas }) => {
        await waitFor(() => expect(canvas.getByText('Grid')).toBeVisible(), { timeout: 10000 });

        const button = canvas.getByRole('button', { name: 'Mean proportion 0.0% - 100.0%' });
        await userEvent.click(button);

        const minInput = canvas.getAllByLabelText('%')[0];
        await userEvent.clear(minInput);
        await userEvent.type(minInput, '40');

        const maxInput = canvas.getAllByLabelText('%')[1];
        await userEvent.clear(maxInput);
        await userEvent.type(maxInput, '41');

        await waitFor(
            () => expect(canvas.getByText('No data available for your filters.', { exact: false })).toBeVisible(),
            {
                timeout: 10000,
            },
        );
    },
};

export const ShowsNoDataForStrictInitialProportionInterval: StoryObj<QueriesOverTimeProps> = {
    ...ShowsNoDataMessageForStrictFilters,
    args: {
        ...ShowsNoDataMessageForStrictFilters.args,
        initialMeanProportionInterval: { min: 0.4, max: 0.41 },
    },
    play: async ({ canvas }) => {
        await waitFor(
            () => expect(canvas.getByText('No data available for your filters.', { exact: false })).toBeVisible(),
            {
                timeout: 10000,
            },
        );
    },
};

export const WithNoLapisDateFieldField: StoryObj<QueriesOverTimeProps> = {
    ...Default,
    args: {
        ...Default.args,
        lapisDateField: '',
    },
    play: async ({ canvasElement, step }) => {
        await step('expect error message', async () => {
            await expectInvalidAttributesErrorMessage(canvasElement, 'String must contain at least 1 character(s)');
        });
    },
};

export const WithDuplicateDisplayLabels: StoryObj<QueriesOverTimeProps> = {
    ...Default,
    args: {
        ...Default.args,
        queries: [
            {
                displayLabel: 'S:F456L (single mutation)',
                countQuery: 'S:456L',
                coverageQuery: '!S:456N',
            },
            {
                displayLabel: 'S:F456L (single mutation)',
                countQuery: 'S:346T & S:456L',
                coverageQuery: '!S:346N & !S:456N',
            },
        ],
    },
    play: async ({ canvasElement, step }) => {
        await step('expect error message', async () => {
            await expectInvalidAttributesErrorMessage(canvasElement, 'Display labels must be unique');
        });
    },
};

async function expectQueryOnPage(canvas: Canvas, query: string) {
    await waitFor(async () => {
        const queryOnPage = canvas.getAllByText(query)[0];
        await expect(queryOnPage).toBeVisible();
    });
}

async function expectDateRangeOnPage(canvas: Canvas, dateRange: string) {
    await waitFor(async () => {
        const dateRangeOnPage = canvas.getAllByText(dateRange)[0];
        await expect(dateRangeOnPage).toBeVisible();
    });
}
