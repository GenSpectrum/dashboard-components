import { expect, describe, it } from 'vitest';

import { mapLapisFilterToUrlParams } from './utils';

describe('mapLapisFilterToUrlParams', () => {
    it('should produce correct url params', () => {
        const urlSearchParams = mapLapisFilterToUrlParams({
            string: 'stringValue',
            number: 42,
            boolean: true,
            null: null,
        });

        expect(urlSearchParams.toString()).equals('string=stringValue&number=42&boolean=true&null=null');
    });
});
