import { type Meta, type PreactRenderer, type StoryObj } from '@storybook/preact';
import { expect, fn, userEvent, waitFor, within } from '@storybook/test';
import type { StepFunction } from '@storybook/types';
import dayjs from 'dayjs/esm';

import { DateRangeSelector, type DateRangeSelectorProps } from './date-range-selector';
import { previewHandles } from '../../../.storybook/preview';
import { LAPIS_URL } from '../../constants';
import { LapisUrlContextProvider } from '../LapisUrlContext';
import { dateRangeOptionPresets } from './dateRangeOption';
import { expectInvalidAttributesErrorMessage } from '../shared/stories/expectErrorMessage';

const earliestDate = '1970-01-01';

const customDateRange = {
    label: 'CustomDateRange',
    dateFrom: '2021-01-01',
    dateTo: '2021-12-31',
};

const meta: Meta<DateRangeSelectorProps> = {
    title: 'Input/DateRangeSelector',
    component: DateRangeSelector,
    parameters: {
        actions: {
            handles: ['gs-date-range-filter-changed', 'gs-date-range-option-changed', ...previewHandles],
        },
        fetchMock: {},
    },
    argTypes: {
        initialValue: {
            control: {
                type: 'select',
            },
            options: [dateRangeOptionPresets.lastMonth.label, dateRangeOptionPresets.allTimes.label, 'CustomDateRange'],
        },
        dateRangeOptions: {
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
        dateRangeOptions: [dateRangeOptionPresets.lastMonth, dateRangeOptionPresets.allTimes, customDateRange],
        earliestDate,
        initialValue: dateRangeOptionPresets.lastMonth.label,
        lapisDateField: 'aDateColumn',
        width: '100%',
        initialDateFrom: undefined,
        initialDateTo: undefined,
    },
};

export default meta;

export const Primary: StoryObj<DateRangeSelectorProps> = {
    render: (args) => (
        <LapisUrlContextProvider value={LAPIS_URL}>
            <DateRangeSelector {...args} />
        </LapisUrlContextProvider>
    ),
};

export const SetCorrectInitialValues: StoryObj<DateRangeSelectorProps> = {
    ...Primary,
    args: {
        ...Primary.args,
        initialValue: 'CustomDateRange',
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        await waitFor(() => {
            expect(selectField(canvas)).toHaveValue('CustomDateRange');
            expect(dateFromPicker(canvas)).toHaveValue('2021-01-01');
            expect(dateToPicker(canvas)).toHaveValue('2021-12-31');
        });
    },
};

const initialDateFrom = '2000-01-01';

export const SetCorrectInitialDateFrom: StoryObj<DateRangeSelectorProps> = {
    ...Primary,
    args: {
        ...Primary.args,
        initialDateFrom,
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        await waitFor(() => {
            expect(selectField(canvas)).toHaveValue('Custom');
            expect(dateFromPicker(canvas)).toHaveValue(initialDateFrom);
            expect(dateToPicker(canvas)).toHaveValue(dayjs().format('YYYY-MM-DD'));
        });
    },
};

const initialDateTo = '2000-01-01';

export const SetCorrectInitialDateTo: StoryObj<DateRangeSelectorProps> = {
    ...Primary,
    args: {
        ...Primary.args,
        initialDateTo,
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        await waitFor(() => {
            expect(selectField(canvas)).toHaveValue('Custom');
            expect(dateFromPicker(canvas)).toHaveValue(earliestDate);
            expect(dateToPicker(canvas)).toHaveValue(initialDateTo);
        });
    },
};

export const ChangingDateSetsOptionToCustom: StoryObj<DateRangeSelectorProps> = {
    ...Primary,
    play: async ({ canvasElement, step }) => {
        const { canvas, filterChangedListenerMock, optionChangedListenerMock } = await prepare(canvasElement, step);

        await waitFor(() => {
            expect(selectField(canvas)).toHaveValue('Last month');
        });

        step('Change date to custom value', async () => {
            await userEvent.type(dateFromPicker(canvas), '{backspace>12}');
            await userEvent.type(dateFromPicker(canvas), '2000-01-01');
            await userEvent.click(dateToPicker(canvas));

            await waitFor(() => {
                expect(selectField(canvas)).toHaveValue('Custom');
            });

            await expect(filterChangedListenerMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    detail: {
                        aDateColumnFrom: '2000-01-01',
                        aDateColumnTo: dayjs().format('YYYY-MM-DD'),
                    },
                }),
            );

            await expect(optionChangedListenerMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    detail: {
                        dateFrom: '2000-01-01',
                        dateTo: dayjs().format('YYYY-MM-DD'),
                    },
                }),
            );
        });
    },
};

export const ChangingDateOption: StoryObj<DateRangeSelectorProps> = {
    ...Primary,
    play: async ({ canvasElement, step }) => {
        const { canvas, filterChangedListenerMock, optionChangedListenerMock } = await prepare(canvasElement, step);

        await waitFor(() => {
            expect(selectField(canvas)).toHaveValue('Last month');
        });

        step('Change date to custom', async () => {
            await userEvent.selectOptions(selectField(canvas), 'CustomDateRange');

            await waitFor(() => {
                expect(selectField(canvas)).toHaveValue('CustomDateRange');
            });

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
    },
};

export const HandlesInvalidInitialDateFrom: StoryObj<DateRangeSelectorProps> = {
    ...Primary,
    args: {
        ...Primary.args,
        initialDateFrom: 'not a date',
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        await waitFor(() => {
            expect(canvas.getByText('Oops! Something went wrong.')).toBeVisible();
        });
    },
};

export const WithNoDateColumn: StoryObj<DateRangeSelectorProps> = {
    ...Primary,
    args: {
        ...Primary.args,
        lapisDateField: '',
    },
    play: async ({ canvasElement, step }) => {
        step('expect error message', async () => {
            await expectInvalidAttributesErrorMessage(canvasElement, 'String must contain at least 1 character(s)');
        });
    },
};

async function prepare(canvasElement: HTMLElement, step: StepFunction<PreactRenderer, unknown>) {
    const canvas = within(canvasElement);

    const filterChangedListenerMock = fn();
    await step('Setup event listener mock', async () => {
        canvasElement.addEventListener('gs-date-range-filter-changed', filterChangedListenerMock);
    });

    const optionChangedListenerMock = fn();
    await step('Setup event listener mock', async () => {
        canvasElement.addEventListener('gs-date-range-option-changed', optionChangedListenerMock);
    });

    return { canvas, filterChangedListenerMock, optionChangedListenerMock };
}

const dateFromPicker = (canvas: ReturnType<typeof within>) => canvas.getByPlaceholderText('Date from');
const dateToPicker = (canvas: ReturnType<typeof within>) => canvas.getByPlaceholderText('Date to');
const selectField = (canvas: ReturnType<typeof within>) => canvas.getByRole('combobox');
