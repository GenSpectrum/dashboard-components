import { describe, expect, test } from 'vitest';

import { fetchStringAutocompleteList } from './fetchStringAutocompleteList';
import { DUMMY_LAPIS_URL, lapisRequestMocks } from '../../../vitest.setup';

describe('fetchStringAutocompleteList', () => {
    test('should fetch autocompletion list and sort by field value', async () => {
        const field = 'host';

        lapisRequestMocks.aggregated(
            { fields: [field], country: 'Germany' },
            {
                data: [
                    { count: 1, host: 'host_c' },
                    { count: 2, host: 'host_b' },
                    { count: 3, host: null },
                    { count: 4, host: 'host_a' },
                ],
            },
        );

        const result = await fetchStringAutocompleteList({
            field,
            lapis: DUMMY_LAPIS_URL,
            lapisFilter: { country: 'Germany' },
        });

        expect(result).to.deep.equal([
            { count: 4, value: 'host_a' },
            { count: 2, value: 'host_b' },
            { count: 1, value: 'host_c' },
        ]);
    });
});
