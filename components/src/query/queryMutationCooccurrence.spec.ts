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
        const result = await queryMutationCooccurrence(lapisFilter, [], DUMMY_LAPIS_URL, dateField, 'day', []);

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

        const result = await queryMutationCooccurrence(lapisFilter, positions, DUMMY_LAPIS_URL, dateField, 'day', []);

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

        const result = await queryMutationCooccurrence(lapisFilter, aaPositions, DUMMY_LAPIS_URL, dateField, 'day', [
            'S',
        ]);

        const patterns = result.getFirstAxisKeys();
        expect(patterns).to.deep.equal([
            { symbols: { 'S[1]': 'A', 'S[2]': 'T' } },
            { symbols: { 'S[1]': 'N', 'S[2]': 'T' } },
            { symbols: { 'S[1]': 'A', 'S[2]': null } },
        ]);
    });

    it('aggregates counts per date, keeping them separate across dates', async () => {
        const multiDateFilter = { dateFrom: '2024-01-15', dateTo: '2024-01-16' };
        const day1 = yearMonthDay('2024-01-15');
        const day2 = yearMonthDay('2024-01-16');

        lapisRequestMocks.aggregated(
            { ...multiDateFilter, fields: [dateField, ...positions] },
            {
                data: [
                    { count: 90, [dateField]: '2024-01-15', '[1]': 'A', '[2]': 'T' },
                    { count: 50, [dateField]: '2024-01-16', '[1]': 'A', '[2]': 'T' },
                ],
            },
        );

        const result = await queryMutationCooccurrence(
            multiDateFilter,
            positions,
            DUMMY_LAPIS_URL,
            dateField,
            'day',
            [],
        );
        const patterns = result.getFirstAxisKeys();

        expect(result.get(patterns[0], day1)).to.deep.equal({
            type: 'valueWithCoverage',
            count: 90,
            coverage: 90,
            totalCount: 90,
        });
        expect(result.get(patterns[0], day2)).to.deep.equal({
            type: 'valueWithCoverage',
            count: 50,
            coverage: 50,
            totalCount: 50,
        });
    });

    it('sorts fully-covered patterns first, then alphabetically by pattern key as tiebreaker', async () => {
        lapisRequestMocks.aggregated(
            { ...lapisFilter, fields: [dateField, ...positions] },
            {
                data: [
                    { count: 100, [dateField]: '2024-01-15', '[1]': 'A', '[2]': 'T' },
                    { count: 200, [dateField]: '2024-01-15', '[1]': 'A', '[2]': 'C' },
                    { count: 50, [dateField]: '2024-01-15', '[1]': 'A', '[2]': 'N' },
                ],
            },
        );

        const result = await queryMutationCooccurrence(lapisFilter, positions, DUMMY_LAPIS_URL, dateField, 'day', []);
        const patterns = result.getFirstAxisKeys();

        expect(patterns).to.deep.equal([
            { symbols: { '[1]': 'A', '[2]': 'C' } },
            { symbols: { '[1]': 'A', '[2]': 'T' } },
            { symbols: { '[1]': 'A', '[2]': null } },
        ]);
    });

    it('sets a cell to null when total sequences for that date is zero', async () => {
        const multiDateFilter = { dateFrom: '2024-01-15', dateTo: '2024-01-16' };
        const day2 = yearMonthDay('2024-01-16');

        lapisRequestMocks.aggregated(
            { ...multiDateFilter, fields: [dateField, ...positions] },
            {
                data: [{ count: 90, [dateField]: '2024-01-15', '[1]': 'A', '[2]': 'T' }],
            },
        );

        const result = await queryMutationCooccurrence(
            multiDateFilter,
            positions,
            DUMMY_LAPIS_URL,
            dateField,
            'day',
            [],
        );
        const patterns = result.getFirstAxisKeys();

        expect(result.get(patterns[0], day2)).toBeNull();
    });

    it('sets a cell to null when coverage is zero for that date', async () => {
        const multiDateFilter = { dateFrom: '2024-01-15', dateTo: '2024-01-16' };
        const day2 = yearMonthDay('2024-01-16');

        lapisRequestMocks.aggregated(
            { ...multiDateFilter, fields: [dateField, ...positions] },
            {
                data: [
                    { count: 90, [dateField]: '2024-01-15', '[1]': 'A', '[2]': 'T' },
                    // on day 2, [1] is always N so the A-T pattern has zero coverage
                    { count: 10, [dateField]: '2024-01-16', '[1]': 'N', '[2]': 'T' },
                ],
            },
        );

        const result = await queryMutationCooccurrence(
            multiDateFilter,
            positions,
            DUMMY_LAPIS_URL,
            dateField,
            'day',
            [],
        );
        const patterns = result.getFirstAxisKeys();
        const atPattern = patterns.find((p) => p.symbols['[1]'] === 'A' && p.symbols['[2]'] === 'T')!;

        expect(result.get(atPattern, day2)).toBeNull();
    });

    it('treats N as uncovered for named nucleotide segment positions', async () => {
        const segPositions = ['main[1]', 'main[2]'];
        lapisRequestMocks.aggregated(
            { ...lapisFilter, fields: [dateField, ...segPositions] },
            {
                data: [
                    { count: 10, [dateField]: '2024-01-15', 'main[1]': 'A', 'main[2]': 'T' },
                    { count: 5, [dateField]: '2024-01-15', 'main[1]': 'N', 'main[2]': 'T' },
                ],
            },
        );

        // 'main' is a nucleotide segment name, not a gene — must NOT be in geneNames
        const result = await queryMutationCooccurrence(lapisFilter, segPositions, DUMMY_LAPIS_URL, dateField, 'day', [
            'S',
            'ORF1a',
        ]);

        const patterns = result.getFirstAxisKeys();
        expect(patterns).to.deep.equal([
            { symbols: { 'main[1]': 'A', 'main[2]': 'T' } },
            { symbols: { 'main[1]': null, 'main[2]': 'T' } },
        ]);
    });

    it('throws a UserFacingError when too many positions are given', async () => {
        const tooManyPositions = Array.from({ length: 11 }, (_, i) => `[${i + 1}]`);
        await expect(
            queryMutationCooccurrence(lapisFilter, tooManyPositions, DUMMY_LAPIS_URL, dateField, 'day', []),
        ).rejects.toThrow('positions');
    });

    it('throws a UserFacingError when the date range would produce too many columns', async () => {
        await expect(
            queryMutationCooccurrence(
                { dateFrom: '2024-01-01', dateTo: '2025-01-01' },
                positions,
                DUMMY_LAPIS_URL,
                dateField,
                'day',
                [],
            ),
        ).rejects.toThrow('date intervals');
    });
});
