import { describe, expect, it } from 'vitest';

import { queryWastewaterMutationsOverTime } from './queryWastewaterMutationsOverTime';
import { DUMMY_LAPIS_URL, lapisRequestMocks } from '../../vitest.setup';
import { SubstitutionClass } from '../utils/mutations';
import { TemporalCache } from '../utils/temporalClass';

const temporalCache = TemporalCache.getInstance();

describe('queryWastewaterMutationsOverTime', () => {
    it('should fetch data', async () => {
        const lapisFilter = { country: 'Germany' };

        lapisRequestMocks.details(
            {
                country: 'Germany',
                fields: ['date', 'location', 'nucleotideMutationFrequency', 'aminoAcidMutationFrequency'],
            },
            {
                data: [
                    {
                        date: '2021-01-01',
                        location: 'Germany',
                        reference: 'organismA',
                        nucleotideMutationFrequency: JSON.stringify({
                            A123T: 0.4,
                            '123G': null,
                        }),
                        aminoAcidMutationFrequency: null,
                    },
                    {
                        date: '2021-01-02',
                        location: 'Germany',
                        reference: 'organismA',
                        nucleotideMutationFrequency: null,
                        aminoAcidMutationFrequency: JSON.stringify({
                            'S:A123T': 0.4,
                            'S:123G': 0.1,
                        }),
                    },
                ],
            },
        );

        const result = await queryWastewaterMutationsOverTime(DUMMY_LAPIS_URL, lapisFilter);

        expect(result).to.deep.equal([
            {
                location: 'Germany',
                date: temporalCache.getYearMonthDay('2021-01-01'),
                nucleotideMutationFrequency: [
                    { mutation: SubstitutionClass.parse('A123T'), proportion: 0.4 },
                    { mutation: SubstitutionClass.parse('123G'), proportion: null },
                ],
                aminoAcidMutationFrequency: [],
            },
            {
                location: 'Germany',
                date: temporalCache.getYearMonthDay('2021-01-02'),
                nucleotideMutationFrequency: [],
                aminoAcidMutationFrequency: [
                    { mutation: SubstitutionClass.parse('S:A123T'), proportion: 0.4 },
                    { mutation: SubstitutionClass.parse('S:123G'), proportion: 0.1 },
                ],
            },
        ]);
    });

    it('should error when the mutation frequency object is invalid', async () => {
        const lapisFilter = { country: 'Germany' };

        lapisRequestMocks.details(
            {
                country: 'Germany',
                fields: ['date', 'location', 'nucleotideMutationFrequency', 'aminoAcidMutationFrequency'],
            },
            {
                data: [
                    {
                        date: '2021-01-01',
                        location: 'Germany',
                        reference: 'organismA',
                        nucleotideMutationFrequency: JSON.stringify({ key: 'not an object of the expected type' }),
                        aminoAcidMutationFrequency: null,
                    },
                ],
            },
        );

        await expect(queryWastewaterMutationsOverTime(DUMMY_LAPIS_URL, lapisFilter)).rejects.toThrowError(
            /^Failed to parse mutation frequency/,
        );
    });
});
