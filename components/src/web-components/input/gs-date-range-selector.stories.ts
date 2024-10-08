import { expect, waitFor } from '@storybook/test';
import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

import { withComponentDocs } from '../../../.storybook/ComponentDocsBlock';
import { previewHandles } from '../../../.storybook/preview';
import { LAPIS_URL } from '../../constants';
import { type DateRangeSelectorProps } from '../../preact/dateRangeSelector/date-range-selector';
import './gs-date-range-selector';
import '../app';
import { toYYYYMMDD } from '../../preact/dateRangeSelector/dateConversion';
import {
    PRESET_VALUE_ALL_TIMES,
    PRESET_VALUE_CUSTOM,
    PRESET_VALUE_LAST_2_MONTHS,
    PRESET_VALUE_LAST_2_WEEKS,
    PRESET_VALUE_LAST_3_MONTHS,
    PRESET_VALUE_LAST_6_MONTHS,
    PRESET_VALUE_LAST_MONTH,
} from '../../preact/dateRangeSelector/selectableOptions';
import { withinShadowRoot } from '../withinShadowRoot.story';

const codeExample = String.raw`
<gs-date-range-selector
    customSelectOptions='[{ "label": "Year 2021", "dateFrom": "2021-01-01", "dateTo": "2021-12-31" }]'
    earliestDate="1970-01-01"
    initialValue="${PRESET_VALUE_LAST_6_MONTHS}"
    initialDateFrom="2020-01-01"
    initialDateTo="2021-01-01"
    width="100%"
    dateColumn="myDateColumn"
></gs-date-range-selector>`;

const meta: Meta<Required<DateRangeSelectorProps<'CustomDateRange'>>> = {
    title: 'Input/DateRangeSelector',
    component: 'gs-date-range-selector',
    parameters: withComponentDocs({
        actions: {
            handles: ['gs-date-range-changed', ...previewHandles],
        },
        fetchMock: {},
        componentDocs: {
            opensShadowDom: true,
            expectsChildren: false,
            codeExample,
        },
    }),
    argTypes: {
        initialValue: {
            control: {
                type: 'select',
            },
            options: [
                PRESET_VALUE_CUSTOM,
                PRESET_VALUE_ALL_TIMES,
                PRESET_VALUE_LAST_2_WEEKS,
                PRESET_VALUE_LAST_MONTH,
                PRESET_VALUE_LAST_2_MONTHS,
                PRESET_VALUE_LAST_3_MONTHS,
                PRESET_VALUE_LAST_6_MONTHS,
                'CustomDateRange',
            ],
        },
        dateColumn: { control: { type: 'text' } },
        customSelectOptions: {
            control: {
                type: 'object',
            },
        },
        earliestDate: {
            control: {
                type: 'text',
            },
        },
        width: {
            control: {
                type: 'text',
            },
        },
    },
    args: {
        customSelectOptions: [{ label: 'CustomDateRange', dateFrom: '2021-01-01', dateTo: '2021-12-31' }],
        earliestDate: '1970-01-01',
        initialValue: PRESET_VALUE_LAST_6_MONTHS,
        dateColumn: 'aDateColumn',
        width: '100%',
        initialDateFrom: '',
        initialDateTo: '',
    },
    tags: ['autodocs'],
};

export default meta;

export const DateRangeSelectorStory: StoryObj<Required<DateRangeSelectorProps<'CustomDateRange'>>> = {
    render: (args) =>
        html` <gs-app lapis="${LAPIS_URL}">
            <div class="max-w-screen-lg">
                <gs-date-range-selector
                    .customSelectOptions=${args.customSelectOptions}
                    .earliestDate=${args.earliestDate}
                    .initialValue=${args.initialValue}
                    .initialDateFrom=${args.initialDateFrom}
                    .initialDateTo=${args.initialDateTo}
                    .width=${args.width}
                    .dateColumn=${args.dateColumn}
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

        // Due to the limitations of storybook testing which does not fire an event,
        // when selecting a value from the dropdown we can't test the fired event here.
        // An e2e test (using playwright) for that can be found in tests/dateRangeSelector.spec.ts
    },
};
