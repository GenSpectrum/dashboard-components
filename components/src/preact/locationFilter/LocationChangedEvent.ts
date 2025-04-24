import { type LapisLocationFilter } from '../../types';
import { gsEventNames } from '../../utils/gsEventNames';

export class LocationChangedEvent extends CustomEvent<LapisLocationFilter> {
    constructor(detail: LapisLocationFilter) {
        super(gsEventNames.locationChanged, {
            detail,
            bubbles: true,
            composed: true,
        });
    }
}
