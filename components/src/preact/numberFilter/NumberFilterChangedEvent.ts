type LapisNumberFilter = Record<string, number | undefined>;

export const gsNumberFilterChangedEventName = 'gs-number-filter-changed';

export class NumberFilterChangedEvent extends CustomEvent<LapisNumberFilter> {
    constructor(detail: LapisNumberFilter) {
        super(gsNumberFilterChangedEventName, {
            detail,
            bubbles: true,
            composed: true,
        });
    }
}
