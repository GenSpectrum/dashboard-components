import { type Meta, type StoryObj } from '@storybook/preact';
import { expect, userEvent, waitFor } from '@storybook/test';
import { type Canvas } from '@storybook/types';

import { MutationsOverTime, type MutationsOverTimeProps } from './mutations-over-time';
import { LAPIS_URL } from '../../constants';
import referenceGenome from '../../lapisApi/__mockData__/referenceGenome.json';
import mockDefaultNucleotideMutations from './__mockData__/defaultMockData/nucleotideMutations.json';
import mockDefaultMutationsOverTime from './__mockData__/defaultMockData/mutationsOverTime.json';
import mock1800sNucleotideMutations from './__mockData__/request1800s/nucleotideMutations.json';
import mock1800sMutationsOverTime from './__mockData__/request1800s/mutationsOverTime.json';
import mockWithDisplayMutationsMutationsOverTime from './__mockData__/withDisplayMutations/mutationsOverTime.json';
import { type MutationAnnotations } from '../../web-components/mutation-annotations-context';
import { LapisUrlContextProvider } from '../LapisUrlContext';
import { MutationAnnotationsContextProvider } from '../MutationAnnotationsContext';
import { ReferenceGenomeContext } from '../ReferenceGenomeContext';
import { expectInvalidAttributesErrorMessage } from '../shared/stories/expectErrorMessage';
import { playThatExpectsFinishedLoadingEvent } from '../shared/stories/expectFinishedLoadingEvent';
import { expectMutationAnnotation } from '../shared/stories/expectMutationAnnotation';

const meta: Meta<MutationsOverTimeProps> = {
    title: 'Visualization/Mutation over time',
    component: MutationsOverTime,
    argTypes: {
        lapisFilter: { control: 'object' },
        sequenceType: {
            options: ['nucleotide', 'amino acid'],
            control: { type: 'radio' },
        },
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
        displayMutations: { control: 'object' },
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
                        url: `${LAPIS_URL}/sample/nucleotideMutations`,
                        body: {
                            pangoLineage: 'JN.1*',
                            dateFrom: '2024-01-01',
                            dateTo: '2024-07-31',
                            minProportion: 0.001,
                        },
                        response: {
                            status: 200,
                            body: mockDefaultNucleotideMutations,
                        },
                    },
                },
                {
                    matcher: {
                        url: `${LAPIS_URL}/component/nucleotideMutationsOverTime`,
                        body: {
                            filters: {
                                pangoLineage: 'JN.1*',
                                dateFrom: '2024-01-15',
                                dateTo: '2024-07-10',
                            },
                            dateRanges: [
                                { dateFrom: '2024-01-01', dateTo: '2024-01-31' },
                                { dateFrom: '2024-02-01', dateTo: '2024-02-29' },
                                { dateFrom: '2024-03-01', dateTo: '2024-03-31' },
                                { dateFrom: '2024-04-01', dateTo: '2024-04-30' },
                                { dateFrom: '2024-05-01', dateTo: '2024-05-31' },
                                { dateFrom: '2024-06-01', dateTo: '2024-06-30' },
                                { dateFrom: '2024-07-01', dateTo: '2024-07-31' },
                            ],
                            dateField: 'date',
                        },
                        matchPartialBody: true, // includeMutations left out
                        response: {
                            status: 200,
                            body: mockDefaultMutationsOverTime,
                        },
                    },
                },
            ],
        },
    },
};

export default meta;

const mutationAnnotations = [
    {
        name: 'I am a mutation annotation!',
        description: 'This describes what is special about these mutations.',
        symbol: '#',
        nucleotideMutations: ['C44T', 'C774T', 'G24872T', 'T23011-'],
        aminoAcidMutations: ['S:501Y', 'S:S31-', 'ORF1a:S4286C'],
        nucleotidePositions: ['17334'],
    },
    {
        name: 'I am another mutation annotation!',
        description: 'This describes what is special about these other mutations.',
        symbol: '+',
        nucleotideMutations: ['C44T', 'A13121T'],
        aminoAcidMutations: ['S:501Y', 'S:S31-', 'ORF1a:S4286C'],
    },
] satisfies MutationAnnotations;

export const Default: StoryObj<MutationsOverTimeProps> = {
    render: (args: MutationsOverTimeProps) => (
        <MutationAnnotationsContextProvider value={mutationAnnotations}>
            <LapisUrlContextProvider value={LAPIS_URL}>
                <ReferenceGenomeContext.Provider value={referenceGenome}>
                    <MutationsOverTime {...args} />
                </ReferenceGenomeContext.Provider>
            </LapisUrlContextProvider>
        </MutationAnnotationsContextProvider>
    ),
    args: {
        lapisFilter: { pangoLineage: 'JN.1*', dateFrom: '2024-01-15', dateTo: '2024-07-10' },
        sequenceType: 'nucleotide',
        views: ['grid'],
        width: '100%',
        granularity: 'month',
        lapisDateField: 'date',
        initialMeanProportionInterval: { min: 0.05, max: 0.9 },
        hideGaps: false,
        pageSizes: [10, 20, 30, 40, 50],
    },
};

export const FiresFinishedLoadingEvent: StoryObj<MutationsOverTimeProps> = {
    ...Default,
    play: playThatExpectsFinishedLoadingEvent(),
};

export const ShowsMutationAnnotations: StoryObj<MutationsOverTimeProps> = {
    ...Default,
    play: async ({ canvasElement }) => {
        await expectMutationAnnotation(canvasElement, 'C44T');
    },
};

export const ShowsNoDataWhenNoMutationsAreInFilter: StoryObj<MutationsOverTimeProps> = {
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
                        url: `${LAPIS_URL}/sample/nucleotideMutations`,
                        body: { dateFrom: '1800-01-01', dateTo: '1800-12-31', minProportion: 0.001 },
                        response: {
                            status: 200,
                            body: mock1800sNucleotideMutations,
                        },
                    },
                },
                {
                    matcher: {
                        name: 'mockDefaultMutationsOverTime',
                        url: `${LAPIS_URL}/component/nucleotideMutationsOverTime`,
                        body: {
                            filters: { dateFrom: '1800-01-01', dateTo: '1800-01-02' },
                            dateRanges: [{ dateFrom: '1800-01-01', dateTo: '1800-12-31' }],
                            includeMutations: [],
                            dateField: 'date',
                        },
                        response: {
                            status: 200,
                            body: mock1800sMutationsOverTime,
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

export const UsesHideGaps: StoryObj<MutationsOverTimeProps> = {
    ...Default,
    args: {
        ...Default.args,
        displayMutations: ['A13121T', 'G24872T', 'T21653-'],
    },
    parameters: {
        fetchMock: {
            mocks: [
                {
                    matcher: {
                        url: `${LAPIS_URL}/sample/nucleotideMutations`,
                        body: {
                            pangoLineage: 'JN.1*',
                            dateFrom: '2024-01-01',
                            dateTo: '2024-07-31',
                            minProportion: 0.001,
                        },
                        response: {
                            status: 200,
                            body: mockDefaultNucleotideMutations,
                        },
                    },
                },
                {
                    matcher: {
                        url: `${LAPIS_URL}/component/nucleotideMutationsOverTime`,
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
                            includeMutations: ['A13121T', 'T21653-', 'G24872T'],
                            dateField: 'date',
                        },
                        response: {
                            status: 200,
                            body: mockWithDisplayMutationsMutationsOverTime,
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

export const UsesPagination: StoryObj<MutationsOverTimeProps> = {
    ...Default,
    play: async ({ canvas, step }) => {
        const mutationOnFirstPage = 'C44T';
        const mutationOnSecondPage = 'T21653-';
        await expectMutationOnPage(canvas, mutationOnFirstPage);

        await step('Navigate to next page', async () => {
            canvas.getByRole('button', { name: 'Next page' }).click();

            await expectMutationOnPage(canvas, mutationOnSecondPage);
        });

        await step('Use goto page input', async () => {
            const gotoPageInput = canvas.getByRole('spinbutton', { name: 'Enter page number to go to' });
            await userEvent.clear(gotoPageInput);
            await userEvent.type(gotoPageInput, '1');
            await userEvent.tab();

            await expectMutationOnPage(canvas, mutationOnFirstPage);
        });

        await step('Change number of rows per page', async () => {
            const pageSizeSelector = canvas.getByLabelText('Select number of rows per page');
            await userEvent.selectOptions(pageSizeSelector, '20');

            await expectMutationOnPage(canvas, mutationOnFirstPage);
            await expectMutationOnPage(canvas, mutationOnSecondPage);
        });
    },
};

export const UsesMutationFilter: StoryObj<MutationsOverTimeProps> = {
    ...Default,
    play: async ({ canvas, step }) => {
        await expectMutationOnPage(canvas, 'C44T');

        await step('input filter', async () => {
            const filterButton = canvas.getByRole('button', { name: 'Filter mutations' });
            await userEvent.click(filterButton);

            const filterInput = canvas.getByPlaceholderText('Filter');
            await userEvent.type(filterInput, 'T21');
        });

        await step('should show only matching filter', async () => {
            await expectMutationOnPage(canvas, 'T21653-');
            await expectMutationOnPage(canvas, 'T21655-');

            const filteredMutation = canvas.queryByText('C44T');
            await expect(filteredMutation).not.toBeInTheDocument();
        });
    },
};

export const WithCustomColumns: StoryObj<MutationsOverTimeProps> = {
    ...Default,
    args: {
        ...Default.args,
        displayMutations: ['A13121T', 'G24872T', 'T21653-'],
        customColumns: [
            {
                header: 'Jaccard Index',
                values: {
                    A13121T: 0.75,
                    G24872T: 'Foobar',
                },
            },
        ],
    },
    parameters: {
        fetchMock: {
            mocks: [
                {
                    matcher: {
                        url: `${LAPIS_URL}/sample/nucleotideMutations`,
                        body: {
                            pangoLineage: 'JN.1*',
                            dateFrom: '2024-01-01',
                            dateTo: '2024-07-31',
                            minProportion: 0.001,
                        },
                        response: {
                            status: 200,
                            body: mockDefaultNucleotideMutations,
                        },
                    },
                },
                {
                    matcher: {
                        url: `${LAPIS_URL}/component/nucleotideMutationsOverTime`,
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
                            includeMutations: ['A13121T', 'T21653-', 'G24872T'],
                            dateField: 'date',
                        },
                        response: {
                            status: 200,
                            body: mockWithDisplayMutationsMutationsOverTime,
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

async function expectMutationOnPage(canvas: Canvas, mutation: string) {
    await waitFor(async () => {
        const mutationOnFirstPage = canvas.getAllByText(mutation)[0];
        await expect(mutationOnFirstPage).toBeVisible();
    });
}

async function expectDateRangeOnPage(canvas: Canvas, dateRange: string) {
    await waitFor(async () => {
        const dateRangeOnFirstPage = canvas.getAllByText(dateRange)[0];
        await expect(dateRangeOnFirstPage).toBeVisible();
    });
}

export const ShowsNoDataMessageWhenThereAreNoDatesInFilter: StoryObj<MutationsOverTimeProps> = {
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
                        url: `${LAPIS_URL}/sample/nucleotideMutations`,
                        body: {
                            filters: { dateFrom: '2345-01-01', dateTo: '2020-01-02' },
                            dateRanges: [],
                            includeMutations: [],
                            dateField: 'date',
                        },
                        response: {
                            status: 200,
                            body: {
                                data: { mutations: [], dateRanges: [], data: [], totalCountsByDateRange: [] },
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

export const ShowsNoDataMessageForStrictFilters: StoryObj<MutationsOverTimeProps> = {
    ...Default,
    play: async ({ canvas }) => {
        await waitFor(() => expect(canvas.getByText('Grid')).toBeVisible(), { timeout: 10000 });

        const button = canvas.getByRole('button', { name: 'Mean proportion 5.0% - 90.0%' });
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

export const ShowsNoDataForStrictInitialProportionInterval: StoryObj<MutationsOverTimeProps> = {
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

export const WithNoLapisDateFieldField: StoryObj<MutationsOverTimeProps> = {
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
