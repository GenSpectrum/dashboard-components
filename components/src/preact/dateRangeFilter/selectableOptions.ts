import { type DateRangeOption } from './dateRangeOption';

export const getSelectableOptions = (dateRangeOptions: DateRangeOption[]) => {
    return dateRangeOptions.map((customSelectOption) => {
        return { label: customSelectOption.label, value: customSelectOption.label };
    });
};
