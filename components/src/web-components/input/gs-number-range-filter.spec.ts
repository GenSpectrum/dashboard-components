import { describe, expectTypeOf, test } from 'vitest';

import { NumberRangeFilterComponent } from './gs-number-range-filter';
import { type NumberRangeFilterProps } from '../../preact/numberRangeFilter/number-range-filter';

describe('gs-number-range-filter types', () => {
    test('should match', ({}) => {
        expectTypeOf(NumberRangeFilterComponent.prototype)
            .toHaveProperty('value')
            .toEqualTypeOf<NumberRangeFilterProps['value']>();
        expectTypeOf(NumberRangeFilterComponent.prototype)
            .toHaveProperty('lapisField')
            .toEqualTypeOf<NumberRangeFilterProps['lapisField']>();
        expectTypeOf(NumberRangeFilterComponent.prototype)
            .toHaveProperty('sliderMin')
            .toEqualTypeOf<NumberRangeFilterProps['sliderMin']>();
        expectTypeOf(NumberRangeFilterComponent.prototype)
            .toHaveProperty('sliderMax')
            .toEqualTypeOf<NumberRangeFilterProps['sliderMax']>();
        expectTypeOf(NumberRangeFilterComponent.prototype)
            .toHaveProperty('sliderStep')
            .toEqualTypeOf<NumberRangeFilterProps['sliderStep']>();
        expectTypeOf(NumberRangeFilterComponent.prototype)
            .toHaveProperty('width')
            .toEqualTypeOf<NumberRangeFilterProps['width']>();
    });
});
