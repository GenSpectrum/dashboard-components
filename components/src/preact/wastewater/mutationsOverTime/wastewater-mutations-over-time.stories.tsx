import { type Meta, type StoryObj } from '@storybook/preact';
import { expect, userEvent, waitFor } from '@storybook/test';
import type { Canvas } from '@storybook/types';

import { WastewaterMutationsOverTime, type WastewaterMutationsOverTimeProps } from './wastewater-mutations-over-time';
import { WISE_DETAILS_ENDPOINT, WISE_LAPIS_URL } from '../../../constants';
import referenceGenome from '../../../lapisApi/__mockData__/referenceGenome.json';
import { LapisUrlContextProvider } from '../../LapisUrlContext';
import { ReferenceGenomeContext } from '../../ReferenceGenomeContext';
import details from './__mockData__/details.json';
import type { MutationsOverTimeProps } from '../../mutationsOverTime/mutations-over-time';
import { playThatExpectsFinishedLoadingEvent } from '../../shared/stories/expectFinishedLoadingEvent';

const meta: Meta<WastewaterMutationsOverTimeProps> = {
    title: 'Wastewater visualization/Wastewater mutations over time',
    component: WastewaterMutationsOverTime,
    argTypes: {
        width: { control: 'text' },
        height: { control: 'text' },
        lapisFilter: { control: 'object' },
        sequenceType: {
            options: ['nucleotide', 'amino acid'],
            control: { type: 'radio' },
        },
        pageSizes: { control: 'object' },
    },
    parameters: {
        fetchMock: {},
    },
};

export default meta;

const Template = {
    render: (args: WastewaterMutationsOverTimeProps) => (
        <LapisUrlContextProvider value={WISE_LAPIS_URL}>
            <ReferenceGenomeContext.Provider value={referenceGenome}>
                <WastewaterMutationsOverTime {...args} />
            </ReferenceGenomeContext.Provider>
        </LapisUrlContextProvider>
    ),
};

export const Default: StoryObj<WastewaterMutationsOverTimeProps> = {
    ...Template,
    args: {
        width: '100%',
        lapisFilter: {},
        sequenceType: 'nucleotide',
        pageSizes: [10, 20, 30, 40, 50],
    },
    parameters: {
        fetchMock: {
            mocks: [
                {
                    matcher: {
                        name: 'details',
                        url: WISE_DETAILS_ENDPOINT,
                        body: {
                            fields: ['date', 'location', 'nucleotideMutationFrequency', 'aminoAcidMutationFrequency'],
                        },
                    },
                    response: {
                        status: 200,
                        body: details,
                    },
                },
            ],
        },
    },
    play: playThatExpectsFinishedLoadingEvent(),
};

export const ChangingRowsPerPageChangesItForEveryTag: StoryObj<WastewaterMutationsOverTimeProps> = {
    ...Default,
    play: async ({ canvas, step }) => {
        await step('Wait for component to render', async () => {
            await canvas.findByText('Lugano');
        });

        const getRowsPerPageSelectors = async () => await canvas.findAllByLabelText('Rows per page', { exact: false });

        await step('change rows per page', async () => {
            await expect((await getRowsPerPageSelectors())[0]).toHaveValue('10');
            await expect((await getRowsPerPageSelectors())[1]).toHaveValue('10');
            await userEvent.selectOptions((await getRowsPerPageSelectors())[0], '20');
            await expect((await getRowsPerPageSelectors())[1]).toHaveValue('20');
        });
    },
};

export const AminoAcids: StoryObj<WastewaterMutationsOverTimeProps> = {
    ...Default,
    args: {
        ...Default.args,
        sequenceType: 'amino acid',
    },
    play: async ({ canvas, step }) => {
        await step('Wait for component to render', async () => {
            await canvas.findByText('All genes');
        });

        await step("Click 'All genes' button", async () => {
            canvas.getByRole('button', { name: 'All genes' }).click();
            await expect(canvas.getByText('Select none')).toBeInTheDocument();
            canvas.getByRole('button', { name: 'Select none' }).click();
            await canvas.findAllByText('No data available for your filters.');
            canvas.getByRole('checkbox', { name: 'S' }).click();
            await canvas.findAllByText('S:Q493E');
            const element = canvas.queryByText(/ORF1a:/);
            await expect(element).not.toBeInTheDocument();
        });
    },
};

export const UsesMutationFilter: StoryObj<MutationsOverTimeProps> = {
    ...Default,
    play: async ({ canvas, step }) => {
        await expectMutationOnPage(canvas, 'A966C');

        await step('input filter', async () => {
            const filterButton = canvas.getByRole('button', { name: 'Filter mutations' });
            await userEvent.click(filterButton);

            const filterInput = canvas.getByPlaceholderText('Filter');
            await userEvent.type(filterInput, '26');
        });

        await step('should show only matching filter', async () => {
            await expectMutationOnPage(canvas, 'T4026G');
            await expectMutationOnPage(canvas, 'T5260C');

            await waitFor(async () => {
                const filteredMutation = canvas.queryByText('A966C');
                await expect(filteredMutation).not.toBeInTheDocument();
            });
        });
    },
};

async function expectMutationOnPage(canvas: Canvas, mutation: string) {
    await waitFor(async () => {
        const mutationOnFirstPage = canvas.getAllByText(mutation)[0];
        await expect(mutationOnFirstPage).toBeVisible();
    });
}
