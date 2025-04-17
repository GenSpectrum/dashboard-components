import { describe, expectTypeOf, test } from 'vitest';

import { NumberFilterComponent } from './gs-number-filter';
import { type NumberFilterProps } from '../../preact/numberFilter/number-filter';

describe('gs-number-filter types', () => {
    test('should match', ({}) => {
        expectTypeOf(NumberFilterComponent.prototype)
            .toHaveProperty('value')
            .toEqualTypeOf<NumberFilterProps['value']>();
        expectTypeOf(NumberFilterComponent.prototype)
            .toHaveProperty('lapisField')
            .toEqualTypeOf<NumberFilterProps['lapisField']>();
        expectTypeOf(NumberFilterComponent.prototype)
            .toHaveProperty('width')
            .toEqualTypeOf<NumberFilterProps['width']>();
    });
});
