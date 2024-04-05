import { expect, waitFor } from '@storybook/test';
import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

import { LAPIS_URL } from '../../constants';
import { type DateRangeSelectorProps } from '../../preact/dateRangeSelector/date-range-selector';
import './date-range-selector-component';
import '../app';
import { toYYYYMMDD } from '../../preact/dateRangeSelector/dateConversion';
import { withinShadowRoot } from '../withinShadowRoot.story';

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
