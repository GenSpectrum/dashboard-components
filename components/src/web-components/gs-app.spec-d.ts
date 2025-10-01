import { describe, expectTypeOf, test } from 'vitest';

import { AppComponent } from './gs-app';
import { type MutationAnnotations } from './mutation-annotations-context';
import { type MutationLinkTemplate } from './mutation-link-template-context';

describe('gs-app types', () => {
    test('mutationAnnotations type should match', () => {
        expectTypeOf(AppComponent.prototype).toHaveProperty('mutationAnnotations').toEqualTypeOf<MutationAnnotations>();
    });

    test('mutationLinkTemplate type should match', () => {
        expectTypeOf(AppComponent.prototype)
            .toHaveProperty('mutationLinkTemplate')
            .toEqualTypeOf<MutationLinkTemplate>();
    });
});
