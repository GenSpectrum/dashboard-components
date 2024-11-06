export * from './web-components';

export { type ErrorEvent, UserFacingError } from './preact/components/error-display';
export { type DateRangeOption, dateRangeOptionPresets } from './preact/dateRangeSelector/dateRangeOption';

declare global {
    interface HTMLElementEventMap {
        'gs-error': ErrorEvent;
    }
}
