import { customElement, property } from 'lit/decorators.js';

import { Aggregate, type View } from '../../preact/aggregatedData/aggregate';
import { type LapisFilter } from '../../types';
import { PreactLitAdapterWithGridJsStyles } from '../PreactLitAdapterWithGridJsStyles';

/**
 * ## Tag
 *
 * `gs-aggregate-component`
 *
 * ## Context
 *
 * This component displays aggregated data, which can provide an overview of the underlying data.
 *
 * It expects a list of fields to aggregate by and a filter to apply to the data.
 */
@customElement('gs-aggregate-component')
export class AggregateComponent extends PreactLitAdapterWithGridJsStyles {
    /**
     * The fields to aggregate by.
     */
    @property({ type: Array })
    fields: string[] = [];

    /**
     * The views are used to display the aggregated data.
     * In the table view, the data is presented in a table format where each field is a column,
     * along with the aggregated value and its proportion.
     * The proportion represents the ratio of the aggregated value to the total count of the data
     * (considering the applied filter).
     */
    @property({ type: Array })
    views: View[] = ['table'];

    /**
     * The filter to apply to the data.
     */
    @property({ type: Object })
    filter: LapisFilter = {};

    override render() {
        return <Aggregate fields={this.fields} views={this.views} filter={this.filter} />;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'gs-aggregate-component': AggregateComponent;
    }
}
