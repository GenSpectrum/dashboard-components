import { withActions } from '@storybook/addon-actions/decorator';
import { type Meta, type StoryObj } from '@storybook/preact';
import { expect, waitFor, within } from '@storybook/test';

import {
    DateRangeSelector,
    type DateRangeSelectorProps,
    PRESET_VALUE_ALL_TIMES,
    PRESET_VALUE_CUSTOM,
    PRESET_VALUE_LAST_2_MONTHS,
    PRESET_VALUE_LAST_2_WEEKS,
    PRESET_VALUE_LAST_3_MONTHS,
    PRESET_VALUE_LAST_6_MONTHS,
    PRESET_VALUE_LAST_MONTH,
} from './date-range-selector';
import { LAPIS_URL } from '../../constants';
import { LapisUrlContext } from '../LapisUrlContext';

const meta: Meta<DateRangeSelectorProps<'CustomDateRange'>> = {
    title: 'Input/DateRangeSelector',
    component: DateRangeSelector,
    parameters: {
        actions: {
            handles: ['gs-date-range-changed'],
        },
        fetchMock: {},
    },
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
        initialValue: PRESET_VALUE_LAST_3_MONTHS,
        dateColumn: 'aDateColumn',
        width: '100%',
    },
    decorators: [withActions],
};

export default meta;

export const Primary: StoryObj<DateRangeSelectorProps<'CustomDateRange'>> = {
    render: (args) => (
        <LapisUrlContext.Provider value={LAPIS_URL}>
            <DateRangeSelector
                customSelectOptions={args.customSelectOptions}
                earliestDate={args.earliestDate}
                initialValue={args.initialValue}
                width={args.width}
                dateColumn={args.dateColumn}
            />
        </LapisUrlContext.Provider>
    ),
};

export const SetCorrectInitialValues: StoryObj<DateRangeSelectorProps<'CustomDateRange'>> = {
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
