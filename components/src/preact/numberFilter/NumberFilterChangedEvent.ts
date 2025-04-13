type LapisNumberFilter = Record<string, number | undefined>;

export class NumberFilterChangedEvent extends CustomEvent<LapisNumberFilter> {
    constructor(detail: LapisNumberFilter) {
        super('gs-number-filter-changed', {
            detail,
            bubbles: true,
            composed: true,
        });
    }
}
