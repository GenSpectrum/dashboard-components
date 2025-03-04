import { describe, expectTypeOf, it } from 'vitest';

import { type WastewaterMutationsOverTimeComponent } from './gs-wastewater-mutations-over-time';
import { type WastewaterMutationsOverTimeProps } from '../../preact/wastewater/mutationsOverTime/wastewater-mutations-over-time';

describe('gs-wastewater-mutations-over-time', () => {
    it('types of preact and lit component should match', () => {
        expectTypeOf<typeof WastewaterMutationsOverTimeComponent.prototype.lapisFilter>().toEqualTypeOf<
            WastewaterMutationsOverTimeProps['lapisFilter']
        >();
        expectTypeOf<typeof WastewaterMutationsOverTimeComponent.prototype.sequenceType>().toEqualTypeOf<
            WastewaterMutationsOverTimeProps['sequenceType']
        >();
        expectTypeOf<typeof WastewaterMutationsOverTimeComponent.prototype.width>().toEqualTypeOf<
            WastewaterMutationsOverTimeProps['width']
        >();
        expectTypeOf<typeof WastewaterMutationsOverTimeComponent.prototype.height>().toEqualTypeOf<
            WastewaterMutationsOverTimeProps['height']
        >();
        expectTypeOf<typeof WastewaterMutationsOverTimeComponent.prototype.pageSizes>().toEqualTypeOf<
            WastewaterMutationsOverTimeProps['pageSizes']
        >();
    });
});
