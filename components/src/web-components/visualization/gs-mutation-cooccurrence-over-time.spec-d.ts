import { describe, expectTypeOf, it } from 'vitest';

import { type MutationCooccurrenceOverTimeComponent } from './gs-mutation-cooccurrence-over-time';
import { type MutationCooccurrenceOverTimeProps } from '../../preact/mutationCooccurrence/mutation-cooccurrence-over-time';

describe('gs-mutation-cooccurrence-over-time', () => {
    it('types of preact and lit component should match', () => {
        expectTypeOf<typeof MutationCooccurrenceOverTimeComponent.prototype.lapisFilter>().toEqualTypeOf<
            MutationCooccurrenceOverTimeProps['lapisFilter']
        >();
        expectTypeOf<typeof MutationCooccurrenceOverTimeComponent.prototype.positions>().toEqualTypeOf<
            MutationCooccurrenceOverTimeProps['positions']
        >();
        expectTypeOf<typeof MutationCooccurrenceOverTimeComponent.prototype.views>().toEqualTypeOf<
            MutationCooccurrenceOverTimeProps['views']
        >();
        expectTypeOf<typeof MutationCooccurrenceOverTimeComponent.prototype.width>().toEqualTypeOf<
            MutationCooccurrenceOverTimeProps['width']
        >();
        expectTypeOf<typeof MutationCooccurrenceOverTimeComponent.prototype.height>().toEqualTypeOf<
            MutationCooccurrenceOverTimeProps['height']
        >();
        expectTypeOf<typeof MutationCooccurrenceOverTimeComponent.prototype.granularity>().toEqualTypeOf<
            MutationCooccurrenceOverTimeProps['granularity']
        >();
        expectTypeOf<typeof MutationCooccurrenceOverTimeComponent.prototype.lapisDateField>().toEqualTypeOf<
            MutationCooccurrenceOverTimeProps['lapisDateField']
        >();
        expectTypeOf<
            typeof MutationCooccurrenceOverTimeComponent.prototype.initialMeanProportionInterval
        >().toEqualTypeOf<MutationCooccurrenceOverTimeProps['initialMeanProportionInterval']>();
        expectTypeOf<typeof MutationCooccurrenceOverTimeComponent.prototype.hideGaps>().toEqualTypeOf<
            MutationCooccurrenceOverTimeProps['hideGaps']
        >();
        expectTypeOf<typeof MutationCooccurrenceOverTimeComponent.prototype.pageSizes>().toEqualTypeOf<
            MutationCooccurrenceOverTimeProps['pageSizes']
        >();
    });
});
