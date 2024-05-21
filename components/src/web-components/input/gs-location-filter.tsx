import { customElement, property } from 'lit/decorators.js';

import { LocationFilter } from '../../preact/locationFilter/location-filter';
import { PreactLitAdapter } from '../PreactLitAdapter';

/**
 * ## Context
 *
 * This component provides an input field to specify filters for locations.
 *
 * It expects a list of fields that form a strict hierarchical order, such as continent, country, and city.
 * The component retrieves a list of all possible values for these fields from the Lapis instance.
 * This list is then utilized to display autocomplete suggestions and to validate the input.
 *
 * Given `fields` are `['field1', 'field2', ..., 'fieldN']`,
 * then valid values for the location filter must be in the form `valueForField1 / valueForField2 / ... / valueForFieldK`,
 * where `1 <= K <= N`.
 * Values for the fields `i > K` are considered `undefined`.
 *
 * @fires {CustomEvent<Record<string, string>>} gs-location-changed
 * Fired when the field is submitted with a valid location value.
 * The `details` of this event contain an object with all `fields` as keys
 * and the corresponding values as values, if they are not `undefined`.
 * Example:
 * ```
 * {
 *   continent: "Asia",
 *   country: "China",
 *   city: "Beijing"
 * }
 * ```
 */
@customElement('gs-location-filter')
export class LocationFilterComponent extends PreactLitAdapter {
    /**
     * The initial value to use for this location filter.
     * Must be of the form `valueForField1 / valueForField2 / ... / valueForFieldN`.
     */
    @property()
    initialValue = '';

    /**
     * Required.
     *
     * The fields to display in the location filter, in hierarchical order.
     * The top-level field should be the first entry in the array.
     * This component assumes that the values for each field form a strict hierarchy
     * (e.g., `fields = ['continent', 'country', 'city']`).
     */
    @property({ type: Array })
    fields: string[] = [];

    /**
     * The width of the component.
     *
     * Visit https://genspectrum.github.io/dashboards/?path=/docs/components-size-of-components--docs for more information.
     */
    @property({ type: String })
    width: string = '100%';

    override render() {
        return <LocationFilter initialValue={this.initialValue} fields={this.fields} width={this.width} />;
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
