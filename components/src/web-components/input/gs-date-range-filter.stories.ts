import { expect, fn, userEvent, waitFor, type within } from '@storybook/test';
import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

import { withComponentDocs } from '../../../.storybook/ComponentDocsBlock';
import { previewHandles } from '../../../.storybook/preview';
import { LAPIS_URL } from '../../constants';
import { type DateRangeFilterProps } from '../../preact/dateRangeFilter/date-range-filter';
import './gs-date-range-filter';
import '../gs-app';
import { dateRangeOptionPresets } from '../../preact/dateRangeFilter/dateRangeOption';
import { gsEventNames } from '../../utils/gsEventNames';
import { withinShadowRoot } from '../withinShadowRoot.story';

const codeExample = String.raw`
<gs-date-range-filter
    dateRangeOptions='[{ "label": "Year 2021", "dateFrom": "2021-01-01", "dateTo": "2021-12-31" }]'
    value="Year 2021"
    width="100%"
    lapisDateField="myDateColumn"
    placeholder="My date column"
></gs-date-range-filter>`;

const customDateRange = { label: 'CustomDateRange', dateFrom: '2021-01-01', dateTo: '2021-12-31' };

const meta: Meta<Required<DateRangeFilterProps>> = {
    title: 'Input/DateRangeFilter',
    component: 'gs-date-range-filter',
    parameters: withComponentDocs({
        actions: {
            handles: [gsEventNames.dateRangeFilterChanged, gsEventNames.dateRangeOptionChanged, ...previewHandles],
        },
        fetchMock: {},
        componentDocs: {
            opensShadowDom: true,
            expectsChildren: false,
            codeExample,
        },
    }),
    argTypes: {
        value: {
            control: { type: 'object' },
        },
        lapisDateField: { control: { type: 'text' } },
        dateRangeOptions: {
            control: { type: 'object' },
        },
        width: {
            control: { type: 'text' },
        },
        placeholder: {
            control: { type: 'text' },
        },
    },
    args: {
        dateRangeOptions: [
            dateRangeOptionPresets().lastMonth,
            dateRangeOptionPresets().last3Months,
            { label: '2021', dateFrom: '2021-01-01', dateTo: '2021-12-31' },
            customDateRange,
        ],
        value: dateRangeOptionPresets().lastMonth.label,
        lapisDateField: 'aDateColumn',
        width: '100%',
        placeholder: 'Date range',
    },
    tags: ['autodocs'],
};

export default meta;

export const Default: StoryObj<Required<DateRangeFilterProps>> = {
    render: (args) =>
        html` <gs-app lapis="${LAPIS_URL}">
            <div class="max-w-(--breakpoint-lg)">
                <gs-date-range-filter
                    .dateRangeOptions=${args.dateRangeOptions}
                    .value=${args.value}
                    .width=${args.width}
                    .lapisDateField=${args.lapisDateField}
                    .placeholder=${args.placeholder}
                ></gs-date-range-filter>
            </div>
        </gs-app>`,
};

export const TestRenderAttributesInHtmlInsteadOfUsingPropertyExpression: StoryObj<Required<DateRangeFilterProps>> = {
    render: (args) =>
        html` <gs-app lapis="${LAPIS_URL}">
            <div class="max-w-(--breakpoint-lg)">
                <gs-date-range-filter
                    .dateRangeOptions=${args.dateRangeOptions}
                    value="${args.value ?? 'null'}"
                    width="${args.width}"
                    lapisDateField="${args.lapisDateField}"
                    placeholder="${args.placeholder}"
                ></gs-date-range-filter>
            </div>
        </gs-app>`,
    play: async ({ canvasElement }) => {
        await waitFor(async () => {
            const canvas = await withinShadowRoot(canvasElement, 'gs-date-range-filter');
            const placeholderOption = canvas.getByRole('combobox').querySelector('option:checked');
            await expect(placeholderOption).toHaveTextContent('Last month');
        });
    },
    argTypes: {
        value: {
            control: {
                type: 'text',
            },
        },
    },
};

export const TestSettingANumericValueIsTreatedAsString: StoryObj<Required<DateRangeFilterProps>> = {
    ...TestRenderAttributesInHtmlInsteadOfUsingPropertyExpression,
    args: {
        ...TestRenderAttributesInHtmlInsteadOfUsingPropertyExpression.args,
        value: '2021',
    },
    play: async ({ canvasElement }) => {
        const canvas = await withinShadowRoot(canvasElement, 'gs-date-range-filter');

        await waitFor(async () => {
            await expect(selectField(canvas)).toHaveValue('2021');
        });
    },
};

export const FiresEvents: StoryObj<Required<DateRangeFilterProps>> = {
    ...Default,
    play: async ({ canvasElement, step }) => {
        const canvas = await withinShadowRoot(canvasElement, 'gs-date-range-filter');

        const filterChangedListenerMock = fn();
        const optionChangedListenerMock = fn();
        await step('Setup event listener mock', () => {
            canvasElement.addEventListener(gsEventNames.dateRangeFilterChanged, filterChangedListenerMock);
            canvasElement.addEventListener(gsEventNames.dateRangeOptionChanged, optionChangedListenerMock);
        });

        await step('Expect last 6 months to be selected', async () => {
            await waitFor(async () => {
                const placeholderOption = canvas.getByRole('combobox').querySelector('option:checked');
                await expect(placeholderOption).toHaveTextContent('Last month');
            });
            await waitFor(async () => {
                await expect(dateToPicker(canvas)).toHaveValue('');
            });
        });

        await step('Expect event to be fired when selecting a different value', async () => {
            await userEvent.selectOptions(selectField(canvas), 'CustomDateRange');
            await userEvent.click(canvas.getByText('CustomDateRange'));

            await waitFor(async () => {
                await expect(dateToPicker(canvas)).toHaveValue(customDateRange.dateTo);

                await expect(filterChangedListenerMock).toHaveBeenCalledWith(
                    expect.objectContaining({
                        detail: {
                            aDateColumnFrom: customDateRange.dateFrom,
                            aDateColumnTo: customDateRange.dateTo,
                        },
                    }),
                );

                await expect(optionChangedListenerMock).toHaveBeenCalledWith(
                    expect.objectContaining({
                        detail: customDateRange.label,
                    }),
                );
            });
        });
    },
};

const dateToPicker = (canvas: ReturnType<typeof within>): HTMLElement => canvas.getByPlaceholderText('Date to');
const selectField = (canvas: ReturnType<typeof within>): HTMLElement => canvas.getByRole('combobox');
