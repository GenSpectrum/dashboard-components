import { type Dataset } from './Dataset';
import { type Operator } from './Operator';
import { type InsertionEntry, type LapisFilter, type SequenceType } from '../types';
import { MutationCache } from '../utils/mutations';
import { mapLapisFilterToUrlParams } from '../utils/utils';

export class FetchInsertionsOperator implements Operator<InsertionEntry> {
    constructor(
        private filter: LapisFilter,
        private sequenceType: SequenceType,
    ) {}

    private async fetchInsertions(
        lapis: string,
        signal?: AbortSignal,
    ): Promise<{ insertion: string; count: number }[]> {
        const endpoint = `${this.sequenceType === 'nucleotide' ? 'nuc' : 'aa'}-insertions`;
        const params = mapLapisFilterToUrlParams(this.filter);
        return (await (await fetch(`${lapis}/${endpoint}?${params.toString()}`, { signal })).json()).data;
    }

    async evaluate(lapis: string, signal?: AbortSignal): Promise<Dataset<InsertionEntry>> {
        const [insertions] = await Promise.all([this.fetchInsertions(lapis, signal)]);

        const mutationCache = MutationCache.getInstance();
        const content: InsertionEntry[] = insertions.map(({ insertion, count }) => ({
            type: 'insertion',
            mutation: mutationCache.getInsertion(insertion),
            count,
        }));

        return { content };
    }
}
