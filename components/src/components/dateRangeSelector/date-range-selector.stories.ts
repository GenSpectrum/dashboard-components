import { html } from 'lit';
import { Meta, StoryObj } from '@storybook/web-components';
import './date-range-selector';
import { expect, userEvent, within } from '@storybook/test';

const meta: Meta = {
    title: 'Input/Date Range Selector',
    component: 'gs-date-range-selector',
    parameters: { fetchMock: {} },
};

export default meta;

export const DateRangeSelectorStory: StoryObj = {
    render: (args) => html`
        <gs-date-range-selector
            .selectedValue=${args.selectedValue}
            .customSelectOptions=${args.customSelectOptions}
            .earliestDate=${args.earliestDate}
        ></gs-date-range-selector>
    `,
    play: async ({ canvasElement, step }) => {
        const canvas = within(canvasElement);
        const dateTo = canvas.getByPlaceholderText('Date to');

        await step('Expect last 6 months to be selected', async () => {
            await expect(canvas.getByRole('combobox')).toHaveValue('last6Months');
            await expect(dateTo).toHaveValue(new Date().toISOString().split('T')[0]);
        });
    },
    args: {
        selectedValue: 'last6Months',
        customSelectOptions: [{ label: 'CustomDateRange', dateFrom: '2021-01-01', dateTo: '2021-12-31' }],
        earliestDate: '1970-01-01',
    },
};

export const DateRangeSelectorWithSelectedRange: StoryObj = {
    ...DateRangeSelectorStory,
    play: async ({ canvasElement, step }) => {
        const canvas = within(canvasElement);
        const dateFrom = canvas.getByPlaceholderText('Date from');
        const dateTo = canvas.getByPlaceholderText('Date to');

        const someDateInThePast = '2021-10-01';
        await step(`Set custom date from: ${someDateInThePast}`, async () => {
            await userEvent.clear(dateFrom);
            await userEvent.type(dateFrom, `${someDateInThePast}{enter}`);

            await expect(dateFrom).toHaveValue(someDateInThePast);
            // TODO(#80): Reenable this line when hitting enter works on the input.
            // await expect(canvas.getByRole('combobox')).toHaveValue('custom');
        });

        await step('Select last 3 months', async () => {
            await userEvent.selectOptions(canvas.getByRole('combobox'), 'last3Months');

            await expect(canvas.getByRole('combobox')).toHaveValue('last3Months');

            const today = new Date();
            const todayString = today.toISOString().split('T')[0];
            const threeMonthAgo = today;
            threeMonthAgo.setMonth(threeMonthAgo.getMonth() - 3);
            const threeMonthAgoString = threeMonthAgo.toISOString().split('T')[0];

            await expect(dateFrom).toHaveValue(threeMonthAgoString);
            await expect(dateTo).toHaveValue(todayString);
        });
    },
};
