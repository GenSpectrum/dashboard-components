import { describe, expect, test } from 'vitest';

import { fetchLineageAutocompleteList } from './fetchLineageAutocompleteList';
import { DUMMY_LAPIS_URL, lapisRequestMocks } from '../../../vitest.setup';

describe('fetchLineageAutocompleteList', () => {
    test('should add sublineage values', async () => {
        lapisRequestMocks.aggregated(
            { fields: ['lineageField'], country: 'Germany' },
            {
                data: [
                    {
                        lineageField: 'B.1.1.7',
                        count: 1,
                    },
                ],
            },
        );

        const result = await fetchLineageAutocompleteList({
            lapis: DUMMY_LAPIS_URL,
            field: 'lineageField',
            lapisFilter: { country: 'Germany' },
        });

        expect(result).to.deep.equal(['B.1.1.7', 'B.1.1.7*']);
    });
});
