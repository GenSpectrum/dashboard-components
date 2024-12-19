export type LapisLocationFilter = Record<string, string | null>;

export class LocationChangedEvent extends CustomEvent<LapisLocationFilter> {
    constructor(detail: LapisLocationFilter) {
        super('gs-location-changed', {
            detail,
            bubbles: true,
            composed: true,
        });
    }
}
