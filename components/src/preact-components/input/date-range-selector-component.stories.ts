import { LAPIS_URL } from '../../constants';
import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { DateRangeSelectorProps, toYYYYMMDD } from '../../preact/dateRangeSelector/date-range-selector';
import './date-range-selector-component';
import '../../components/app';
import { withinShadowRoot } from '../../storybook/withinShadowRoot.story';
import { expect, fn, userEvent, waitFor } from '@storybook/test';

const meta: Meta<DateRangeSelectorProps> = {
    title: 'Input/DateRangeSelector',
    component: 'gs-date-range-selector',
    parameters: {
        actions: {
            handles: ['gs-date-range-changed'],
        },
        fetchMock: {},
    },
};

export default meta;

export const DateRangeSelectorStory: StoryObj<DateRangeSelectorProps> = {
    render: (args) =>
        html` <gs-app lapis="${LAPIS_URL}">
            <div class="max-w-screen-lg">
                <gs-date-range-selector
                    .customSelectOptions=${args.customSelectOptions}
                    .earliestDate=${args.earliestDate}
                ></gs-date-range-selector>
            </div>
        </gs-app>`,

    play: async ({ canvasElement, step }) => {
        const canvas = await withinShadowRoot(canvasElement, 'gs-date-range-selector');
        const dateTo = () => canvas.getByPlaceholderText('Date to');

        await step('Expect last 6 months to be selected', async () => {
            await expect(canvas.getByRole('combobox')).toHaveValue('last6Months');
            await waitFor(() => {
                expect(dateTo()).toHaveValue(toYYYYMMDD(new Date()));
            });
        });
    },
    args: {
        customSelectOptions: [{ label: 'CustomDateRange', dateFrom: '2021-01-01', dateTo: '2021-12-31' }],
        earliestDate: '1970-01-01',
    },
};

export const DateRangeSelectorWithSelectedRange: StoryObj<DateRangeSelectorProps> = {
    ...DateRangeSelectorStory,
    play: async ({ canvasElement, step }) => {
        const canvas = await withinShadowRoot(canvasElement, 'gs-date-range-selector');
        const dateFromElement = () => canvas.getByPlaceholderText('Date from');
        const dateToElement = () => canvas.getByPlaceholderText('Date to');

        const listenerMock = fn();
        await step('Setup event listener mock', async () => {
            canvasElement.addEventListener('gs-date-range-changed', listenerMock);
        });

        const someDateInThePast = '2021-10-01';
        await step(`Set custom date from: ${someDateInThePast}`, async () => {
            await userEvent.type(dateFromElement(), '{backspace>10/}');
            await userEvent.type(dateFromElement(), `${someDateInThePast}`);
            await userEvent.click(dateToElement());
        });

        await step('Expect custom date range to be selected', async () => {
            await waitFor(() => {
                expect(dateFromElement()).toHaveValue(someDateInThePast);
                expect(canvas.getByRole('combobox')).toHaveValue('custom');
            });
        });

        await step('Expect correct event is thrown', async () => {
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

            await expect(dateFromElement()).toHaveValue(threeMonthAgoString);
            await expect(dateToElement()).toHaveValue(todayString);

            await expect(listenerMock).toHaveBeenCalledTimes(2);
        });
    },
};
