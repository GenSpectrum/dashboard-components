type LapisTextFilter = Record<string, string | null | undefined>;

export class TextChangedEvent extends CustomEvent<LapisTextFilter> {
    constructor(detail: LapisTextFilter) {
        super('gs-text-input-changed', {
            detail,
            bubbles: true,
            composed: true,
        });
    }
}
