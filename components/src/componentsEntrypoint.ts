import { type gsEventNames } from './utils/gsEventNames';

export * from './web-components';

export { type ErrorEvent, UserFacingError } from './preact/components/error-display';

declare global {
    interface HTMLElementEventMap {
        [gsEventNames.error]: ErrorEvent;
    }
}
