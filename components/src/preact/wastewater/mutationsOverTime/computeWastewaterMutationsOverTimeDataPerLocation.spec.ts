import { describe, expect, test } from 'vitest';

import { groupMutationDataByLocation } from './computeWastewaterMutationsOverTimeDataPerLocation';
import type { WastewaterData } from '../../../query/queryWastewaterMutationsOverTime';
import { SubstitutionClass } from '../../../utils/mutations';
import { TemporalCache } from '../../../utils/temporalClass';

const temporalCache = TemporalCache.getInstance();

const mutation1 = SubstitutionClass.parse('1T')!;
const mutation2 = SubstitutionClass.parse('2G')!;
const mutation3 = SubstitutionClass.parse('3C')!;

const location1 = 'location1';
const location2 = 'location2';

describe('groupMutationDataByLocation', () => {
    test('should group nucleotide mutations by location', () => {
        const input: WastewaterData = [
            {
                location: location1,
                date: temporalCache.getYearMonthDay('2025-01-01'),
                nucleotideMutationFrequency: [
                    { mutation: mutation1, proportion: 0.1 },
                    { mutation: mutation2, proportion: 0.2 },
                ],
                aminoAcidMutationFrequency: [],
            },
            {
                location: location1,
                date: temporalCache.getYearMonthDay('2025-01-02'),
                nucleotideMutationFrequency: [
                    { mutation: mutation1, proportion: null },
                    { mutation: mutation2, proportion: 0.3 },
                ],
                aminoAcidMutationFrequency: [],
            },
            {
                location: location2,
                date: temporalCache.getYearMonthDay('2025-01-01'),
                nucleotideMutationFrequency: [
                    { mutation: mutation1, proportion: 0.1 },
                    { mutation: mutation3, proportion: 0.2 },
                ],
                aminoAcidMutationFrequency: [],
            },
        ];

        const result = groupMutationDataByLocation(input, 'nucleotide');

        expect(result).to.have.length(2);
        expect(result[0].location).to.equal(location1);
        expect(result[1].location).to.equal(location2);

        const location1Data = result[0].data;
        expect(location1Data.getFirstAxisKeys()).to.deep.equal([mutation1, mutation2]);
        expect(location1Data.getSecondAxisKeys()).to.deep.equal([
            temporalCache.getYearMonthDay('2025-01-01'),
            temporalCache.getYearMonthDay('2025-01-02'),
        ]);
        expect(location1Data.getAsArray()).to.deep.equal([
            [{ type: 'wastewaterValue', proportion: 0.1 }, null],
            [
                { type: 'wastewaterValue', proportion: 0.2 },
                { type: 'wastewaterValue', proportion: 0.3 },
            ],
        ]);
    });

    test('should group amino acid mutations by location', () => {
        const input: WastewaterData = [
            {
                location: location1,
                date: temporalCache.getYearMonthDay('2025-01-01'),
                nucleotideMutationFrequency: [{ mutation: mutation1, proportion: 0.1 }],
                aminoAcidMutationFrequency: [
                    { mutation: mutation2, proportion: 0.2 },
                    { mutation: mutation3, proportion: 0.3 },
                ],
            },
            {
                location: location2,
                date: temporalCache.getYearMonthDay('2025-01-01'),
                nucleotideMutationFrequency: [],
                aminoAcidMutationFrequency: [{ mutation: mutation3, proportion: 0.3 }],
            },
        ];

        const result = groupMutationDataByLocation(input, 'amino acid');

        expect(result).to.have.length(2);
        expect(result[0].location).to.equal(location1);
        expect(result[1].location).to.equal(location2);

        const location1Data = result[0].data;
        expect(location1Data.getFirstAxisKeys()).to.deep.equal([mutation2, mutation3]);
        expect(location1Data.getSecondAxisKeys()).to.deep.equal([temporalCache.getYearMonthDay('2025-01-01')]);
        expect(location1Data.getAsArray()).to.deep.equal([
            [{ type: 'wastewaterValue', proportion: 0.2 }],
            [{ type: 'wastewaterValue', proportion: 0.3 }],
        ]);
    });

    test('should sort date axis correctly', () => {
        const input: WastewaterData = [
            {
                location: location1,
                date: temporalCache.getYearMonthDay('2025-01-02'),
                nucleotideMutationFrequency: [{ mutation: mutation1, proportion: 0.2 }],
                aminoAcidMutationFrequency: [],
            },
            {
                location: location1,
                date: temporalCache.getYearMonthDay('2025-01-01'),
                nucleotideMutationFrequency: [{ mutation: mutation1, proportion: 0.1 }],
                aminoAcidMutationFrequency: [],
            },
            {
                location: location1,
                date: temporalCache.getYearMonthDay('2025-01-03'),
                nucleotideMutationFrequency: [{ mutation: mutation1, proportion: 0.3 }],
                aminoAcidMutationFrequency: [],
            },
        ];

        const result = groupMutationDataByLocation(input, 'nucleotide');

        expect(result).to.have.length(1);
        const location1Data = result[0].data;

        expect(location1Data.getSecondAxisKeys()).to.deep.equal([
            temporalCache.getYearMonthDay('2025-01-01'),
            temporalCache.getYearMonthDay('2025-01-02'),
            temporalCache.getYearMonthDay('2025-01-03'),
        ]);
    });

    test('should sort mutations correctly', () => {
        const input: WastewaterData = [
            {
                location: location1,
                date: temporalCache.getYearMonthDay('2025-01-01'),
                nucleotideMutationFrequency: [
                    { mutation: mutation3, proportion: 0.3 },
                    { mutation: mutation1, proportion: 0.1 },
                    { mutation: mutation2, proportion: 0.2 },
                ],
                aminoAcidMutationFrequency: [],
            },
        ];

        const result = groupMutationDataByLocation(input, 'nucleotide');

        expect(result).to.have.length(1);
        const location1Data = result[0].data;

        expect(location1Data.getFirstAxisKeys()).to.deep.equal([mutation1, mutation2, mutation3]);
    });
});
