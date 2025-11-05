import { describe, expectTypeOf, test } from 'vitest';

import { LineageFilterComponent } from './gs-lineage-filter';
import { type LineageFilterProps } from '../../preact/lineageFilter/lineage-filter';

describe('gs-lineage-filter types', () => {
    test('should match', () => {
        expectTypeOf(LineageFilterComponent.prototype)
            .toHaveProperty('value')
            .toEqualTypeOf<LineageFilterProps['value']>();
        expectTypeOf(LineageFilterComponent.prototype)
            .toHaveProperty('lapisField')
            .toEqualTypeOf<LineageFilterProps['lapisField']>();
        expectTypeOf(LineageFilterComponent.prototype)
            .toHaveProperty('lapisFilter')
            .toEqualTypeOf<LineageFilterProps['lapisFilter']>();
        expectTypeOf(LineageFilterComponent.prototype)
            .toHaveProperty('placeholderText')
            .toEqualTypeOf<LineageFilterProps['placeholderText']>();
        expectTypeOf(LineageFilterComponent.prototype)
            .toHaveProperty('width')
            .toEqualTypeOf<LineageFilterProps['width']>();
        expectTypeOf(LineageFilterComponent.prototype)
            .toHaveProperty('multiSelect')
            .toEqualTypeOf<LineageFilterProps['multiSelect']>();
        expectTypeOf(LineageFilterComponent.prototype)
            .toHaveProperty('hideCounts')
            .toEqualTypeOf<LineageFilterProps['hideCounts']>();
    });
});
