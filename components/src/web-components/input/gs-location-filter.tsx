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
     * If not set, the component will take the full width of its container.
     *
     * The width should be a string with a unit in css style, e.g. '100%', '500px' or '50vw'.
     * If the unit is %, the size will be relative to the container of the component.
     */
    @property({ type: Object })
    width: string | undefined = undefined;

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
