import { customElement, property } from 'lit/decorators.js';

import { LocationFilter } from '../../preact/locationFilter/location-filter';
import { PreactLitAdapter } from '../PreactLitAdapter';

/**
 * @fires {CustomEvent<Record<string, string>>} gs-location-changed - When the location has changed
 */
@customElement('gs-location-filter')
export class LocationFilterComponent extends PreactLitAdapter {
    @property()
    value = '';

    @property({ type: Array })
    fields: string[] = [];

    override render() {
        return <LocationFilter value={this.value} fields={this.fields} />;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'gs-location-filter': LocationFilterComponent;
    }

    interface HTMLElementEventMap {
        'gs-location-changed': CustomEvent<Record<string, string>>;
    }
}
