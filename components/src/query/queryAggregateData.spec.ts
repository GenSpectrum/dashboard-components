import { describe, expect, test } from 'vitest';

import { queryAggregateData } from './queryAggregateData';
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

    test('should sort by initialSort field ascending', async () => {
        const fields = ['division', 'host'];
        const filter = { country: 'USA' };
        const initialSortField = 'host';
        const initialSortDirection = 'ascending';

        lapisRequestMocks.aggregated(
            { fields, ...filter },
            {
                data: [
                    { count: 4, region: 'region1', host: 'A_host' },
                    { count: 4, region: 'region1', host: 'B_host' },
                    { count: 8, region: 'region2', host: 'A_host1' },
                    { count: 16, region: 'region2', host: 'C_host' },
                ],
            },
        );

        const result = await queryAggregateData(filter, fields, DUMMY_LAPIS_URL, {
            field: initialSortField,
            direction: initialSortDirection,
        });

        expect(result).to.deep.equal([
            { proportion: 0.125, count: 4, region: 'region1', host: 'A_host' },
            { proportion: 0.25, count: 8, region: 'region2', host: 'A_host1' },
            { proportion: 0.125, count: 4, region: 'region1', host: 'B_host' },
            { proportion: 0.5, count: 16, region: 'region2', host: 'C_host' },
        ]);
    });

    test('should sort by initialSort field descending', async () => {
        const fields = ['division', 'host'];
        const filter = { country: 'USA' };
        const initialSortField = 'host';
        const initialSortDirection = 'descending';

        lapisRequestMocks.aggregated(
            { fields, ...filter },
            {
                data: [
                    { count: 4, region: 'region1', host: 'A_host' },
                    { count: 4, region: 'region1', host: 'B_host' },
                    { count: 8, region: 'region2', host: 'A_host1' },
                    { count: 16, region: 'region2', host: 'C_host' },
                ],
            },
        );

        const result = await queryAggregateData(filter, fields, DUMMY_LAPIS_URL, {
            field: initialSortField,
            direction: initialSortDirection,
        });

        expect(result).to.deep.equal([
            { proportion: 0.5, count: 16, region: 'region2', host: 'C_host' },
            { proportion: 0.125, count: 4, region: 'region1', host: 'B_host' },
            { proportion: 0.25, count: 8, region: 'region2', host: 'A_host1' },
            { proportion: 0.125, count: 4, region: 'region1', host: 'A_host' },
        ]);
    });

    test('should sort by initialSort number field', async () => {
        const fields = ['division', 'host'];
        const filter = { country: 'USA' };
        const initialSortField = 'proportion';
        const initialSortDirection = 'descending';

        lapisRequestMocks.aggregated(
            { fields, ...filter },
            {
                data: [
                    { count: 4, region: 'region1', host: 'A_host' },
                    { count: 4, region: 'region1', host: 'B_host' },
                    { count: 8, region: 'region2', host: 'A_host1' },
                    { count: 16, region: 'region2', host: 'C_host' },
                ],
            },
        );

        const result = await queryAggregateData(filter, fields, DUMMY_LAPIS_URL, {
            field: initialSortField,
            direction: initialSortDirection,
        });

        expect(result).to.deep.equal([
            { proportion: 0.125, count: 4, region: 'region1', host: 'A_host' },
            { proportion: 0.125, count: 4, region: 'region1', host: 'B_host' },
            { proportion: 0.25, count: 8, region: 'region2', host: 'A_host1' },
            { proportion: 0.5, count: 16, region: 'region2', host: 'C_host' },
        ]);
    });

    test('should throw if initialSortField is not in fields', async () => {
        const fields = ['division', 'host'];
        const filter = { country: 'USA' };
        const initialSortField = 'not_in_fields';
        const initialSortDirection = 'descending';

        lapisRequestMocks.aggregated(
            { fields, ...filter },
            {
                data: [{ count: 4, region: 'region1', host: 'A_host' }],
            },
        );

        await expect(
            queryAggregateData(filter, fields, DUMMY_LAPIS_URL, {
                field: initialSortField,
                direction: initialSortDirection,
            }),
        ).rejects.toThrowError('InitialSort field not in fields. Valid fields are: count, proportion, division, host');
    });
});
