import { customElement, property } from 'lit/decorators.js';
import type { DetailedHTMLProps, HTMLAttributes } from 'react';

import { Aggregate, type AggregateProps, type View } from '../../preact/aggregatedData/aggregate';
import { type Equals, type Expect } from '../../utils/typeAssertions';
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
     *
     * If left empty, the component will only show the absolute count of the provided `filter` and proportion `100%`.
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
    lapisFilter: Record<string, string | string[] | number | null | boolean | undefined> & {
        nucleotideMutations?: string[];
        aminoAcidMutations?: string[];
        nucleotideInsertions?: string[];
        aminoAcidInsertions?: string[];
    } = {};

    /**
     * The width of the component.
     *
     * Visit https://genspectrum.github.io/dashboard-components/?path=/docs/components-size-of-components--docs for more information.
     */
    @property({ type: String })
    width: string = '100%';

    /**
     * The height of the component.
     *
     * Visit https://genspectrum.github.io/dashboard-components/?path=/docs/components-size-of-components--docs for more information.
     */
    @property({ type: String })
    height: string = '700px';

    /**
     * The field by which the table is initially sorted.
     * Must be one of the fields specified in the fields property, 'count', or 'proportion'.
     */
    @property({ type: String })
    initialSortField: string = 'count';

    /**
     * The initial sort direction of the table.
     */
    @property({ type: String })
    initialSortDirection: 'ascending' | 'descending' = 'descending';

    /**
     * The maximum number of rows to display in the table view.
     * Set to `false` to disable pagination. Set to `true` to enable pagination with a default limit (10).
     */
    @property({ type: Object })
    pageSize: boolean | number = false;

    override render() {
        return (
            <Aggregate
                fields={this.fields}
                views={this.views}
                lapisFilter={this.lapisFilter}
                width={this.width}
                height={this.height}
                initialSortField={this.initialSortField}
                initialSortDirection={this.initialSortDirection}
                pageSize={this.pageSize}
            />
        );
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'gs-aggregate': AggregateComponent;
    }
}

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace JSX {
        interface IntrinsicElements {
            'gs-aggregate': DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
        }
    }
}

/* eslint-disable @typescript-eslint/no-unused-vars, no-unused-vars */
type FieldsMatches = Expect<Equals<typeof AggregateComponent.prototype.fields, AggregateProps['fields']>>;
type ViewsMatches = Expect<Equals<typeof AggregateComponent.prototype.views, AggregateProps['views']>>;
type FilterMatches = Expect<Equals<typeof AggregateComponent.prototype.lapisFilter, AggregateProps['lapisFilter']>>;
type WidthMatches = Expect<Equals<typeof AggregateComponent.prototype.width, AggregateProps['width']>>;
type HeightMatches = Expect<Equals<typeof AggregateComponent.prototype.height, AggregateProps['height']>>;
type InitialSortFieldMatches = Expect<
    Equals<typeof AggregateComponent.prototype.initialSortField, AggregateProps['initialSortField']>
>;
type InitialSortDirectionMatches = Expect<
    Equals<typeof AggregateComponent.prototype.initialSortDirection, AggregateProps['initialSortDirection']>
>;
type PageSizeMatches = Expect<Equals<typeof AggregateComponent.prototype.pageSize, AggregateProps['pageSize']>>;
/* eslint-enable @typescript-eslint/no-unused-vars, no-unused-vars */
