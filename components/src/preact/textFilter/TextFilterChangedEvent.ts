import { gsEventNames } from '../../utils/gsEventNames';

type LapisTextFilter = Record<string, string | undefined>;

export class TextFilterChangedEvent extends CustomEvent<LapisTextFilter> {
    constructor(detail: LapisTextFilter) {
        super(gsEventNames.textFilterChanged, {
            detail,
            bubbles: true,
            composed: true,
        });
    }
}
