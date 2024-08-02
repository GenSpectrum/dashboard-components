export * from './web-components';

export { type ErrorEvent, UserFacingError } from './preact/components/error-display';

declare global {
    interface HTMLElementEventMap {
        'gs-error': ErrorEvent;
    }
}
