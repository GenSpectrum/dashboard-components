import { describe, expect, test } from 'vitest';

import { fetchLineageAutocompleteList } from './fetchLineageAutocompleteList';
import { DUMMY_LAPIS_URL, lapisRequestMocks } from '../../../vitest.setup';

describe('fetchLineageAutocompleteList', () => {
    test('should add sublineage values', async () => {
        lapisRequestMocks.aggregated({ fields: ['lineageField'] }, { data: [{ lineageField: 'B.1.1.7', count: 1 }] });

        const result = await fetchLineageAutocompleteList(DUMMY_LAPIS_URL, 'lineageField');

        expect(result).to.deep.equal([
            {
                count: 1,
                lineageField: 'B.1.1.7',
            },
            {
                count: 1,
                lineageField: 'B.1.1.7*',
            },
            {
                count: 1,
                lineageField: 'B.1.1*',
            },
            {
                count: 1,
                lineageField: 'B.1*',
            },
            {
                count: 1,
                lineageField: 'B*',
            },
        ]);
    });
});
