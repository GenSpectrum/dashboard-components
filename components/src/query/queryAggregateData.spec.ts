import { describe, expect, test } from 'vitest';

import { queryAggregateData } from './queryAggregateData';
import { DUMMY_LAPIS_URL, lapisRequestMocks } from '../../vitest.setup';

describe('queryAggregateData', () => {
    test('should fetch aggregate data', async () => {
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
            { proportion: 0.125, count: 4, region: 'region1', host: 'host1' },
            { proportion: 0.125, count: 4, region: 'region1', host: 'host2' },
            { proportion: 0.25, count: 8, region: 'region2', host: 'host1' },
            { proportion: 0.5, count: 16, region: 'region2', host: 'host2' },
        ]);
    });
});
