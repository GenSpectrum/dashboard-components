import { describe, expectTypeOf, test } from 'vitest';

import { GenomeDataViewerComponent } from './gs-genome-data-viewer';
import type { GenomeDataViewerProps } from '../../preact/genomeViewer/genome-data-viewer';

describe('gs-app types', () => {
    test('mutationAnnotations type should match', ({}) => {
        expectTypeOf(GenomeDataViewerComponent.prototype)
            .toHaveProperty('gff3Source')
            .toEqualTypeOf<GenomeDataViewerProps['gff3Source']>();
        expectTypeOf(GenomeDataViewerComponent.prototype)
            .toHaveProperty('genomeLength')
            .toEqualTypeOf<GenomeDataViewerProps['genomeLength']>();
        expectTypeOf(GenomeDataViewerComponent.prototype)
            .toHaveProperty('width')
            .toEqualTypeOf<GenomeDataViewerProps['width']>();
        expectTypeOf(GenomeDataViewerComponent.prototype)
            .toHaveProperty('height')
            .toEqualTypeOf<GenomeDataViewerProps['height']>();
    });
});
