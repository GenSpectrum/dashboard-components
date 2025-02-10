type LapisTextFilter = Record<string, string | undefined>;

export class TextFilterChangedEvent extends CustomEvent<LapisTextFilter> {
    constructor(detail: LapisTextFilter) {
        super('gs-text-filter-changed', {
            detail,
            bubbles: true,
            composed: true,
        });
    }
}
