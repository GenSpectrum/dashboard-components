import { type LapisLocationFilter } from '../../types';

export class LocationChangedEvent extends CustomEvent<LapisLocationFilter> {
    constructor(detail: LapisLocationFilter) {
        super('gs-location-changed', {
            detail,
            bubbles: true,
            composed: true,
        });
    }
}
