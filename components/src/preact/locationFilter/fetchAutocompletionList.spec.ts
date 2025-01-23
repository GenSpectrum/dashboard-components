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
                    { count: 1, region: 'region1', country: 'country1_1', division: 'division1_1_1' },
                    { count: 2, region: 'region1', country: 'country1_1', division: 'division1_1_2' },
                    { count: 3, region: 'region1', country: 'country1_1', division: null },
                    { count: 4, region: 'region1', country: 'country1_2', division: 'division1_2_1' },
                    { count: 5, region: 'region2', country: 'country2_1', division: null },
                ],
            },
        );

        const result = await fetchAutocompletionList({
            fields,
            lapis: DUMMY_LAPIS_URL,
            lapisFilter: { country: 'Germany' },
        });

        expect(result).to.deep.equal([
            { value: { region: 'region1', country: undefined, division: undefined }, count: 10 },
            { value: { region: 'region1', country: 'country1_1', division: undefined }, count: 6 },
            { value: { region: 'region1', country: 'country1_1', division: 'division1_1_1' }, count: 1 },
            { value: { region: 'region1', country: 'country1_1', division: 'division1_1_2' }, count: 2 },
            { value: { region: 'region1', country: 'country1_2', division: undefined }, count: 4 },
            { value: { region: 'region1', country: 'country1_2', division: 'division1_2_1' }, count: 4 },
            { value: { region: 'region2', country: undefined, division: undefined }, count: 5 },
            { value: { region: 'region2', country: 'country2_1', division: undefined }, count: 5 },
        ]);
    });
});
