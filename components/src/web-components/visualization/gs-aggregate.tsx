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
     * The width of the component.
     *
     * Visit https://genspectrum.github.io/dashboards/?path=/docs/components-size-of-components--docs for more information.
     */
    @property({ type: String })
    width: string = '100%';

    /**
     * The height of the component.
     *
     * Visit https://genspectrum.github.io/dashboards/?path=/docs/components-size-of-components--docs for more information.
     */
    @property({ type: String })
    height: string = '700px';

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
                width={this.width}
                height={this.height}
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
