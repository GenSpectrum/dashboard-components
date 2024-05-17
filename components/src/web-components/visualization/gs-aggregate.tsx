import { customElement, property } from 'lit/decorators.js';

import { Aggregate, type View } from '../../preact/aggregatedData/aggregate';
import { type LapisFilter } from '../../types';
import { PreactLitAdapterWithGridJsStyles } from '../PreactLitAdapterWithGridJsStyles';

/**
 * ## Context
 *
 * This component displays aggregated data in a table, which can provide an overview of the underlying data.
 *
 * It expects a list of `fields` to aggregate by and a `filter` to apply to the data.
 *
 * ## Views
 *
 * ### Table View
 *
 * In the table view, the data is presented in a table format where each field is a column,
 * along with the aggregated value and its proportion.
 * The proportion represents the ratio of the aggregated value to the total count of the data
 * (considering the applied filter).
 */
@customElement('gs-aggregate')
export class AggregateComponent extends PreactLitAdapterWithGridJsStyles {
    /**
     * The fields to aggregate by.
     * Every field will be a table column.
     * Every field must exist in the backing LAPIS instance.
     */
    @property({ type: Array })
    fields: string[] = [];

    /**
     * A list of tabs with views that this component should provide.
     */
    @property({ type: Array })
    views: View[] = ['table'];

    /**
     * The filter to apply to the data.
     * It must be a valid LAPIS filter object.
     */
    @property({ type: Object })
    filter: LapisFilter = {};

    /**
     * The size of the component.
     *
     * If not set, the component will take the full width of its container with height 700px.
     *
     * The width and height should be a string with a unit in css style, e.g. '100%', '500px' or '50vh'.
     * If the unit is %, the size will be relative to the container of the component.
     */
    @property({ type: Object })
    size: { width?: string; height?: string } | undefined = undefined;

    /**
     * The headline of the component. Set to an empty string to hide the headline.
     */
    @property({ type: String })
    headline: string = 'Aggregate';

    override render() {
        return (
            <Aggregate
                fields={this.fields}
                views={this.views}
                filter={this.filter}
                size={this.size}
                headline={this.headline}
            />
        );
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'gs-aggregate-component': AggregateComponent;
    }
}
