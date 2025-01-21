import z from 'zod';

import { FetchDetailsOperator } from '../operator/FetchDetailsOperator';
import { type LapisFilter } from '../types';
import { type Substitution, SubstitutionClass } from '../utils/mutations';
import { parseDateStringToTemporal, type TemporalClass, toTemporalClass } from '../utils/temporalClass';

export type WastewaterData = {
    location: string;
    date: TemporalClass;
    nucleotideMutationFrequency: { mutation: Substitution; proportion: number | null }[];
    aminoAcidMutationFrequency: { mutation: Substitution; proportion: number | null }[];
}[];

export async function queryWastewaterMutationsOverTime(
    lapis: string,
    lapisFilter: LapisFilter,
    signal?: AbortSignal,
): Promise<WastewaterData> {
    const fetchData = new FetchDetailsOperator(lapisFilter, [
        'date',
        'location',
        'nucleotideMutationFrequency',
        'aminoAcidMutationFrequency',
    ]);
    const data = (await fetchData.evaluate(lapis, signal)).content;

    return data.map((row) => ({
        location: row.location as string,
        date: toTemporalClass(parseDateStringToTemporal(row.date as string, 'day')),
        nucleotideMutationFrequency:
            row.nucleotideMutationFrequency !== null
                ? transformMutations(JSON.parse(row.nucleotideMutationFrequency as string))
                : [],
        aminoAcidMutationFrequency:
            row.aminoAcidMutationFrequency !== null
                ? transformMutations(JSON.parse(row.aminoAcidMutationFrequency as string))
                : [],
    }));
}

const mutationFrequencySchema = z.record(z.number().nullable());

function transformMutations(input: unknown): { mutation: Substitution; proportion: number | null }[] {
    const mutationFrequency = mutationFrequencySchema.safeParse(input);

    if (!mutationFrequency.success) {
        throw new Error(`Failed to parse mutation frequency: ${mutationFrequency.error.message}`);
    }

    return Object.entries(mutationFrequency.data).map(([key, value]) => ({
        mutation: SubstitutionClass.parse(key)!,
        proportion: value,
    }));
}
