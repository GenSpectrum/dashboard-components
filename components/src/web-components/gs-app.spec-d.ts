import { describe, expectTypeOf, test } from 'vitest';

import { AppComponent } from './gs-app';
import { type MutationAnnotations } from './mutation-annotations-context';

describe('gs-app types', () => {
    test('mutationAnnotations type should match', ({}) => {
        expectTypeOf(AppComponent.prototype).toHaveProperty('mutationAnnotations').toEqualTypeOf<MutationAnnotations>();
    });
});
