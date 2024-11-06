import { type Meta, type StoryObj } from '@storybook/preact';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import dayjs from 'dayjs/esm';

import { DateRangeSelector, type DateRangeSelectorProps } from './date-range-selector';
import { previewHandles } from '../../../.storybook/preview';
import { LAPIS_URL } from '../../constants';
import { LapisUrlContext } from '../LapisUrlContext';
import { dateRangeOptionPresets } from './dateRangeOption';

const earliestDate = '1970-01-01';

const meta: Meta<DateRangeSelectorProps> = {
    title: 'Input/DateRangeSelector',
    component: DateRangeSelector,
    parameters: {
        actions: {
            handles: ['gs-date-range-changed', ...previewHandles],
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
        dateRangeOptions: [
            dateRangeOptionPresets.lastMonth,
            dateRangeOptionPresets.allTimes,
            {
                label: 'CustomDateRange',
                dateFrom: '2021-01-01',
                dateTo: '2021-12-31',
            },
        ],
        earliestDate,
        initialValue: dateRangeOptionPresets.lastMonth.label,
        dateColumn: 'aDateColumn',
        width: '100%',
        initialDateFrom: '',
        initialDateTo: '',
    },
};

export default meta;

export const Primary: StoryObj<DateRangeSelectorProps> = {
    render: (args) => (
        <LapisUrlContext.Provider value={LAPIS_URL}>
            <DateRangeSelector
                dateRangeOptions={args.dateRangeOptions}
                earliestDate={args.earliestDate}
                initialValue={args.initialValue}
                initialDateFrom={args.initialDateFrom}
                initialDateTo={args.initialDateTo}
                width={args.width}
                dateColumn={args.dateColumn}
            />
        </LapisUrlContext.Provider>
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

        const dateFrom = () => canvas.getByPlaceholderText('Date from');
        const dateTo = () => canvas.getByPlaceholderText('Date to');
        const selectField = () => canvas.getByRole('combobox');

        await waitFor(() => {
            expect(selectField()).toHaveValue('CustomDateRange');
            expect(dateFrom()).toHaveValue('2021-01-01');
            expect(dateTo()).toHaveValue('2021-12-31');
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

        const dateFrom = () => canvas.getByPlaceholderText('Date from');
        const dateTo = () => canvas.getByPlaceholderText('Date to');
        const selectField = () => canvas.getByRole('combobox');

        await waitFor(() => {
            expect(selectField()).toHaveValue('Custom');
            expect(dateFrom()).toHaveValue(initialDateFrom);
            expect(dateTo()).toHaveValue(dayjs().format('YYYY-MM-DD'));
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

        const dateFrom = () => canvas.getByPlaceholderText('Date from');
        const dateTo = () => canvas.getByPlaceholderText('Date to');
        const selectField = () => canvas.getByRole('combobox');

        await waitFor(() => {
            expect(selectField()).toHaveValue('Custom');
            expect(dateFrom()).toHaveValue(earliestDate);
            expect(dateTo()).toHaveValue(initialDateTo);
        });
    },
};

export const ChangingDateSetsOptionToCustom: StoryObj<DateRangeSelectorProps> = {
    ...Primary,
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        const dateFrom = () => canvas.getByPlaceholderText('Date from');
        const dateTo = () => canvas.getByPlaceholderText('Date to');
        const selectField = () => canvas.getByRole('combobox');

        await waitFor(() => {
            expect(selectField()).toHaveValue('Last month');
        });

        await userEvent.type(dateFrom(), '{backspace>12}');
        await userEvent.type(dateFrom(), '2000-01-01');
        await userEvent.click(dateTo());

        await waitFor(() => {
            expect(selectField()).toHaveValue('Custom');
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
