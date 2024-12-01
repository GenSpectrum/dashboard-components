import { parseDateStringToTemporal, type TemporalClass, toTemporalClass } from '../utils/temporalClass';
import { FetchDetailsOperator } from '../operator/FetchDetailsOperator';
import { type Substitution, SubstitutionClass } from '../utils/mutations';
import { LapisFilter } from '../types';

export type WastewaterData = {
    location: string;
    date: TemporalClass;
    nucleotideMutationFrequency: { mutation: Substitution; proportion: number }[];
    aminoAcidMutationFrequency: { mutation: Substitution; proportion: number }[];
}[];

export async function queryWastewaterData(
    lapis: string,
    lapisFilter: LapisFilter,
    signal?: AbortSignal,
): Promise<WastewaterData> {
    const fetchData = new FetchDetailsOperator<Record<string, string | null | number>>(lapisFilter, [
        'date',
        'location',
        'reference',
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

function transformMutations(input: Record<string, number>): { mutation: Substitution; proportion: number }[] {
    return Object.entries(input).map(([key, value]) => ({
        mutation: SubstitutionClass.parse(key)!,
        proportion: value,
    }));
}
