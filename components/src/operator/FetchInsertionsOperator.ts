import { type Dataset } from './Dataset';
import { type Operator } from './Operator';
import { fetchInsertions } from '../lapisApi/lapisApi';
import { type InsertionEntry, type LapisFilter, type SequenceType } from '../types';
import { InsertionClass } from '../utils/mutations';

export class FetchInsertionsOperator implements Operator<InsertionEntry> {
    constructor(
        private filter: LapisFilter,
        private sequenceType: SequenceType,
    ) {}

    async evaluate(lapisUrl: string, signal?: AbortSignal): Promise<Dataset<InsertionEntry>> {
        const insertions = (await fetchInsertions(lapisUrl, this.filter, this.sequenceType, signal)).data;

        const content: InsertionEntry[] = insertions.map(({ count, insertedSymbols, sequenceName, position }) => ({
            type: 'insertion',
            mutation: new InsertionClass(sequenceName ?? undefined, position, insertedSymbols),
            count,
        }));

        return { content };
    }
}
