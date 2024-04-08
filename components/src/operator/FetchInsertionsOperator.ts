import { type Dataset } from './Dataset';
import { type Operator } from './Operator';
import { fetchInsertions } from '../lapisApi/lapisApi';
import { type InsertionEntry, type LapisFilter, type SequenceType } from '../types';
import { MutationCache } from '../utils/mutations';

export class FetchInsertionsOperator implements Operator<InsertionEntry> {
    constructor(
        private filter: LapisFilter,
        private sequenceType: SequenceType,
    ) {}

    private async fetchInsertions(
        lapis: string,
        signal?: AbortSignal,
    ): Promise<{ insertion: string; count: number }[]> {
        return (await fetchInsertions(lapis, { ...this.filter }, this.sequenceType, signal)).data;
    }

    async evaluate(lapisUrl: string, signal?: AbortSignal): Promise<Dataset<InsertionEntry>> {
        const insertions = await this.fetchInsertions(lapisUrl, signal);

        const mutationCache = MutationCache.getInstance();
        const content: InsertionEntry[] = insertions.map(({ insertion, count }) => ({
            type: 'insertion',
            mutation: mutationCache.getInsertion(insertion),
            count,
        }));

        return { content };
    }
}
