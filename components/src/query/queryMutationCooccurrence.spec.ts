import { describe, expect, it } from 'vitest';

import { queryMutationCooccurrence } from './queryMutationCooccurrence';
import { DUMMY_LAPIS_URL, lapisRequestMocks } from '../../vitest.setup';
import { yearMonthDay } from '../utils/temporalTestHelpers';

const dateField = 'date';
const positions = ['[1]', '[2]'];

const lapisFilter = {
    dateFrom: '2024-01-15',
    dateTo: '2024-01-15',
};

const singleDay = yearMonthDay('2024-01-15');

describe('queryMutationCooccurrence', () => {
    it('returns an empty map when no positions are given', async () => {
        const result = await queryMutationCooccurrence(lapisFilter, [], DUMMY_LAPIS_URL, dateField, 'day');

        expect(result.getFirstAxisKeys()).to.deep.equal([]);
    });

    it('drops fully uncovered patterns, treats N and missing values the same as null, and computes coverage', async () => {
        lapisRequestMocks.aggregated(
            { ...lapisFilter, fields: [dateField, ...positions] },
            {
                data: [
                    { count: 90, [dateField]: '2024-01-15', '[1]': 'A', '[2]': 'T' },
                    { count: 5, [dateField]: '2024-01-15', '[1]': 'A', '[2]': 'N' },
                    { count: 3, [dateField]: '2024-01-15', '[1]': 'A' },
                    { count: 5, [dateField]: '2024-01-15', '[1]': 'N', '[2]': 'N' },
                ],
            },
        );

        const result = await queryMutationCooccurrence(lapisFilter, positions, DUMMY_LAPIS_URL, dateField, 'day');

        const patterns = result.getFirstAxisKeys();
        expect(patterns).to.deep.equal([
            { symbols: { '[1]': 'A', '[2]': 'T' } },
            { symbols: { '[1]': 'A', '[2]': null } },
        ]);

        expect(result.get(patterns[0], singleDay)).to.deep.equal({
            type: 'valueWithCoverage',
            count: 90,
            coverage: 90,
            totalCount: 103,
        });
        expect(result.get(patterns[1], singleDay)).to.deep.equal({
            type: 'valueWithCoverage',
            count: 8,
            coverage: 98,
            totalCount: 103,
        });
    });

    it('treats X as uncovered for amino acid positions and N as a real allele (asparagine)', async () => {
        const aaPositions = ['S[1]', 'S[2]'];
        lapisRequestMocks.aggregated(
            { ...lapisFilter, fields: [dateField, ...aaPositions] },
            {
                data: [
                    { count: 90, [dateField]: '2024-01-15', 'S[1]': 'A', 'S[2]': 'T' },
                    { count: 5, [dateField]: '2024-01-15', 'S[1]': 'N', 'S[2]': 'T' },
                    { count: 3, [dateField]: '2024-01-15', 'S[1]': 'A', 'S[2]': 'X' },
                ],
            },
        );

        const result = await queryMutationCooccurrence(lapisFilter, aaPositions, DUMMY_LAPIS_URL, dateField, 'day');

        const patterns = result.getFirstAxisKeys();
        expect(patterns).to.deep.equal([
            { symbols: { 'S[1]': 'A', 'S[2]': 'T' } },
            { symbols: { 'S[1]': 'N', 'S[2]': 'T' } },
            { symbols: { 'S[1]': 'A', 'S[2]': null } },
        ]);
    });

    it('throws a UserFacingError when the date range would produce too many columns', async () => {
        await expect(
            queryMutationCooccurrence(
                { dateFrom: '2024-01-01', dateTo: '2025-01-01' },
                positions,
                DUMMY_LAPIS_URL,
                dateField,
                'day',
            ),
        ).rejects.toThrow('date intervals');
    });
});
