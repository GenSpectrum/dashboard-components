import { describe, expect, test } from 'vitest';

import { compareAscending, queryAggregateData } from './queryAggregateData';
import { DUMMY_LAPIS_URL, lapisRequestMocks } from '../../vitest.setup';

describe('queryAggregateData', () => {
    test('should fetch aggregate data and sort initially by count descending when no initialSort is provided', async () => {
        const fields = ['division', 'host'];
        const filter = { country: 'USA' };

        lapisRequestMocks.aggregated(
            { fields, ...filter },
            {
                data: [
                    { count: 4, region: 'region1', host: 'host1' },
                    { count: 4, region: 'region1', host: 'host2' },
                    { count: 8, region: 'region2', host: 'host1' },
                    { count: 16, region: 'region2', host: 'host2' },
                ],
            },
        );

        const result = await queryAggregateData(filter, fields, DUMMY_LAPIS_URL);

        expect(result).to.deep.equal([
            { proportion: 0.5, count: 16, region: 'region2', host: 'host2' },
            { proportion: 0.25, count: 8, region: 'region2', host: 'host1' },
            { proportion: 0.125, count: 4, region: 'region1', host: 'host1' },
            { proportion: 0.125, count: 4, region: 'region1', host: 'host2' },
        ]);
    });
});

describe('compareAscending', () => {
    test('should compare numbers', () => {
        expect(compareAscending(1, 2)).to.equal(-1);
        expect(compareAscending(2, 1)).to.equal(1);
        expect(compareAscending(2, 2)).to.equal(0);
    });

    test('should compare strings', () => {
        expect(compareAscending('a', 'b')).to.equal(-1);
        expect(compareAscending('b', 'a')).to.equal(1);
        expect(compareAscending('a', 'a')).to.equal(0);
    });

    test('should compare boolean', () => {
        expect(compareAscending(true, false)).to.equal(1);
        expect(compareAscending(false, true)).to.equal(-1);
        expect(compareAscending(true, true)).to.equal(0);
        expect(compareAscending(false, false)).to.equal(0);
    });
});
