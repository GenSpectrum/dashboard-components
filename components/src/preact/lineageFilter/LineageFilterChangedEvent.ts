type LapisLineageFilter = Record<string, string | undefined>;

export class LineageFilterChangedEvent extends CustomEvent<LapisLineageFilter> {
    constructor(detail: LapisLineageFilter) {
        super('gs-lineage-filter-changed', {
            detail,
            bubbles: true,
            composed: true,
        });
    }
}
