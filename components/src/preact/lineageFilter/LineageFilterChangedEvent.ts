import { gsEventNames } from '../../utils/gsEventNames';

type LapisLineageFilter = Record<string, string | undefined>;
type LapisLineageMultiFilter = Record<string, string[] | undefined>;

export class LineageFilterChangedEvent extends CustomEvent<LapisLineageFilter> {
    constructor(detail: LapisLineageFilter) {
        super(gsEventNames.lineageFilterChanged, {
            detail,
            bubbles: true,
            composed: true,
        });
    }
}

export class LineageMultiFilterChangedEvent extends CustomEvent<LapisLineageMultiFilter> {
    constructor(detail: LapisLineageMultiFilter) {
        super(gsEventNames.lineageFilterMultiChanged, {
            detail,
            bubbles: true,
            composed: true,
        });
    }
}
