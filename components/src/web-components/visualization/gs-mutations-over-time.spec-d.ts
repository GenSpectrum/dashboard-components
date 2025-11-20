import { describe, expectTypeOf, it } from 'vitest';

import { type MutationsOverTimeComponent } from './gs-mutations-over-time';
import { type MutationsOverTimeProps } from '../../preact/mutationsOverTime/mutations-over-time';

describe('gs-mutations-over-time', () => {
    it('types of preact and lit component should match', () => {
        expectTypeOf<typeof MutationsOverTimeComponent.prototype.lapisFilter>().toEqualTypeOf<
            MutationsOverTimeProps['lapisFilter']
        >();
        expectTypeOf<typeof MutationsOverTimeComponent.prototype.sequenceType>().toEqualTypeOf<
            MutationsOverTimeProps['sequenceType']
        >();
        expectTypeOf<typeof MutationsOverTimeComponent.prototype.views>().toEqualTypeOf<
            MutationsOverTimeProps['views']
        >();
        expectTypeOf<typeof MutationsOverTimeComponent.prototype.width>().toEqualTypeOf<
            MutationsOverTimeProps['width']
        >();
        expectTypeOf<typeof MutationsOverTimeComponent.prototype.height>().toEqualTypeOf<
            MutationsOverTimeProps['height']
        >();
        expectTypeOf<typeof MutationsOverTimeComponent.prototype.granularity>().toEqualTypeOf<
            MutationsOverTimeProps['granularity']
        >();
        expectTypeOf<typeof MutationsOverTimeComponent.prototype.lapisDateField>().toEqualTypeOf<
            MutationsOverTimeProps['lapisDateField']
        >();
        expectTypeOf<typeof MutationsOverTimeComponent.prototype.displayMutations>().toEqualTypeOf<
            MutationsOverTimeProps['displayMutations']
        >();
        expectTypeOf<typeof MutationsOverTimeComponent.prototype.initialMeanProportionInterval>().toEqualTypeOf<
            MutationsOverTimeProps['initialMeanProportionInterval']
        >();
        expectTypeOf<typeof MutationsOverTimeComponent.prototype.useNewEndpoint>().toEqualTypeOf<
            MutationsOverTimeProps['useNewEndpoint']
        >();
        expectTypeOf<typeof MutationsOverTimeComponent.prototype.pageSizes>().toEqualTypeOf<
            MutationsOverTimeProps['pageSizes']
        >();
        expectTypeOf<typeof MutationsOverTimeComponent.prototype.customColumns>().toEqualTypeOf<
            MutationsOverTimeProps['customColumns']
        >();
    });
});
