import { customElement } from 'lit/decorators.js';

import { type TextInputComponent } from './text-input-component';
import { MutationFilter } from '../../preact/mutationFilter/mutation-filter';
import { PreactLitAdapter } from '../PreactLitAdapter';

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
        'gs-mutation-filter-changed': CustomEvent<Record<string, string[]>>;
    }

    interface HTMLElementEventMap {
        'gs-mutation-filter-on-blur': CustomEvent;
    }
}
