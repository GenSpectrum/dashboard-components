import { customElement } from 'lit/decorators.js';

import { type TextInputComponent } from './text-input-component';
import { MutationFilter, type SelectedFilters } from '../../preact/mutationFilter/mutation-filter';
import { PreactLitAdapter } from '../PreactLitAdapter';

/**
 * @fires {CustomEvent<SelectedFilters>} gs-mutation-filter-changed - When the mutation filter values have changed
 * @fires {CustomEvent} gs-mutation-filter-on-blur - When the mutation filter has lost focus
 */
@customElement('gs-mutation-filter')
export class MutationFilterComponent extends PreactLitAdapter {
    override render() {
        return <MutationFilter />;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'gs-mutation-filter': TextInputComponent;
    }

    interface HTMLElementEventMap {
        'gs-mutation-filter-changed': CustomEvent<SelectedFilters>;
        'gs-mutation-filter-on-blur': CustomEvent;
    }
}
