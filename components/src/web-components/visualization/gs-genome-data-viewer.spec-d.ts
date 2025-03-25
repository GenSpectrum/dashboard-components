import { describe, expectTypeOf, test } from 'vitest';

import { GenomeDataViewerComponent } from './gs-genome-data-viewer';

describe('gs-app types', () => {
    test('mutationAnnotations type should match', ({}) => {
        expectTypeOf(GenomeDataViewerComponent.prototype).toHaveProperty('gff3Source').toEqualTypeOf<string>();
        expectTypeOf(GenomeDataViewerComponent.prototype).toHaveProperty('genomeLength').toEqualTypeOf<number>();
        expectTypeOf(GenomeDataViewerComponent.prototype).toHaveProperty('width').toEqualTypeOf<string>();
        expectTypeOf(GenomeDataViewerComponent.prototype).toHaveProperty('height').toEqualTypeOf<string>();
    });
});
