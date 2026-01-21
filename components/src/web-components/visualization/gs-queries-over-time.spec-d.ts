import { describe, expectTypeOf, it } from 'vitest';

import { type QueriesOverTimeComponent } from './gs-queries-over-time';
import { type QueriesOverTimeProps } from '../../preact/queriesOverTime/queries-over-time';

describe('gs-queries-over-time', () => {
    it('types of preact and lit component should match', () => {
        expectTypeOf<typeof QueriesOverTimeComponent.prototype.lapisFilter>().toEqualTypeOf<
            QueriesOverTimeProps['lapisFilter']
        >();
        expectTypeOf<typeof QueriesOverTimeComponent.prototype.queries>().toEqualTypeOf<
            QueriesOverTimeProps['queries']
        >();
        expectTypeOf<typeof QueriesOverTimeComponent.prototype.views>().toEqualTypeOf<QueriesOverTimeProps['views']>();
        expectTypeOf<typeof QueriesOverTimeComponent.prototype.width>().toEqualTypeOf<QueriesOverTimeProps['width']>();
        expectTypeOf<typeof QueriesOverTimeComponent.prototype.height>().toEqualTypeOf<
            QueriesOverTimeProps['height']
        >();
        expectTypeOf<typeof QueriesOverTimeComponent.prototype.granularity>().toEqualTypeOf<
            QueriesOverTimeProps['granularity']
        >();
        expectTypeOf<typeof QueriesOverTimeComponent.prototype.lapisDateField>().toEqualTypeOf<
            QueriesOverTimeProps['lapisDateField']
        >();
        expectTypeOf<typeof QueriesOverTimeComponent.prototype.initialMeanProportionInterval>().toEqualTypeOf<
            QueriesOverTimeProps['initialMeanProportionInterval']
        >();
        expectTypeOf<typeof QueriesOverTimeComponent.prototype.hideGaps>().toEqualTypeOf<
            QueriesOverTimeProps['hideGaps']
        >();
        expectTypeOf<typeof QueriesOverTimeComponent.prototype.pageSizes>().toEqualTypeOf<
            QueriesOverTimeProps['pageSizes']
        >();
        expectTypeOf<typeof QueriesOverTimeComponent.prototype.customColumns>().toEqualTypeOf<
            QueriesOverTimeProps['customColumns']
        >();
    });
});
