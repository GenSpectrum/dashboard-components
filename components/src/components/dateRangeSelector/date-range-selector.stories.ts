import { html } from 'lit';
import { Meta, StoryObj } from '@storybook/web-components';
import './date-range-selector';
import { expect, fn, userEvent, within } from '@storybook/test';
import { withActions } from '@storybook/addon-actions/decorator';
import { toYYYYMMDD } from './date-range-selector';

const meta: Meta = {
    title: 'Input/Date Range Selector',
    component: 'gs-date-range-selector',
    parameters: {
        fetchMock: {},
        actions: {
            handles: ['gs-date-range-changed'],
        },
    },
    decorators: [withActions],
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
        const dateFrom = () => canvas.getByPlaceholderText('Date from');
        const dateTo = () => canvas.getByPlaceholderText('Date to');

        const listenerMock = fn();
        await step('Setup event listener mock', async () => {
            canvasElement.addEventListener('gs-date-range-changed', listenerMock);
        });

        const someDateInThePast = '2021-10-01';
        await step(`Set custom date from: ${someDateInThePast}`, async () => {
            await userEvent.clear(dateFrom());
            await userEvent.type(dateFrom(), `${someDateInThePast}`);

            await userEvent.click(dateTo());

            await expect(dateFrom()).toHaveValue(someDateInThePast);
            await expect(canvas.getByRole('combobox')).toHaveValue('custom');
        });

        await step('Expect correct event in thrown', async () => {
            await expect(listenerMock).toHaveBeenCalled();

            const firstCall = listenerMock.mock.calls[0][0];
            const detail = firstCall.detail;

            const dateFrom = detail.dateFrom;
            await expect(dateFrom).toEqual(someDateInThePast);

            const dateTo = detail.dateTo;
            const expectedDateTo = new Date();
            await expect(dateTo).toEqual(toYYYYMMDD(expectedDateTo));
        });

        await step('Select last 3 months', async () => {
            await userEvent.selectOptions(canvas.getByRole('combobox'), 'last3Months');

            await expect(canvas.getByRole('combobox')).toHaveValue('last3Months');

            const today = new Date();
            const todayString = today.toISOString().split('T')[0];
            const threeMonthAgo = today;
            threeMonthAgo.setMonth(threeMonthAgo.getMonth() - 3);
            const threeMonthAgoString = threeMonthAgo.toISOString().split('T')[0];

            await expect(dateFrom()).toHaveValue(threeMonthAgoString);
            await expect(dateTo()).toHaveValue(todayString);

            await expect(listenerMock).toHaveBeenCalledTimes(2);
        });
    },
};
