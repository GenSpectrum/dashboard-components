import { LapisUrlContext } from '../LapisUrlContext';
import { LAPIS_URL } from '../../constants';
import { Meta, StoryObj } from '@storybook/preact';
import { DateRangeSelector, DateRangeSelectorProps } from './date-range-selector';

const meta: Meta<DateRangeSelectorProps> = {
    title: 'Input/DateRangeSelector',
    component: DateRangeSelector,
    parameters: {
        fetchMock: {},
    },
    args: {
        customSelectOptions: [{ label: 'CustomDateRange', dateFrom: '2021-01-01', dateTo: '2021-12-31' }],
        earliestDate: '1970-01-01',
    },
};

export default meta;

export const Primary: StoryObj<DateRangeSelectorProps> = {
    render: (args) => (
        <LapisUrlContext.Provider value={LAPIS_URL}>
            <DateRangeSelector customSelectOptions={args.customSelectOptions} earliestDate={args.earliestDate} />
        </LapisUrlContext.Provider>
    ),
};
