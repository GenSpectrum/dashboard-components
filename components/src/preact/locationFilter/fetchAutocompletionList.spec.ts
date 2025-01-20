import { describe, expect, test } from 'vitest';

import { fetchAutocompletionList } from './fetchAutocompletionList';
import { DUMMY_LAPIS_URL, lapisRequestMocks } from '../../../vitest.setup';

describe('fetchAutocompletionList', () => {
    test('should fetch autocompletion list', async () => {
        const fields = ['region', 'country', 'division'];

        lapisRequestMocks.aggregated(
            { fields, country: 'Germany' },
            {
                data: [
                    { count: 0, region: 'region1', country: 'country1_1', division: 'division1_1_1' },
                    { count: 0, region: 'region1', country: 'country1_1', division: 'division1_1_2' },
                    { count: 0, region: 'region1', country: 'country1_1', division: null },
                    { count: 0, region: 'region1', country: 'country1_2', division: 'division1_2_1' },
                    { count: 0, region: 'region2', country: 'country2_1', division: null },
                ],
            },
        );

        const result = await fetchAutocompletionList({
            fields,
            lapis: DUMMY_LAPIS_URL,
            lapisFilter: { country: 'Germany' },
        });

        expect(result).to.deep.equal([
            { region: 'region1', country: undefined, division: undefined },
            { region: 'region1', country: 'country1_1', division: undefined },
            { region: 'region1', country: 'country1_1', division: 'division1_1_1' },
            { region: 'region1', country: 'country1_1', division: 'division1_1_2' },
            { region: 'region1', country: 'country1_2', division: undefined },
            { region: 'region1', country: 'country1_2', division: 'division1_2_1' },
            { region: 'region2', country: undefined, division: undefined },
            { region: 'region2', country: 'country2_1', division: undefined },
        ]);
    });
});
