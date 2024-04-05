import { type Dataset } from './Dataset';
import { type Operator } from './Operator';
import { type LapisFilter, type SequenceType, type SubstitutionOrDeletionEntry } from '../types';
import { MutationCache, Substitution } from '../utils/mutations';
import { mapLapisFilterToUrlParams } from '../utils/utils';

export class FetchSubstitutionsOrDeletionsOperator implements Operator<SubstitutionOrDeletionEntry> {
    constructor(
        private filter: LapisFilter,
        private sequenceType: SequenceType,
        private minProportion?: number,
    ) {}

    async evaluate(lapis: string, signal?: AbortSignal): Promise<Dataset<SubstitutionOrDeletionEntry>> {
        const [mutations] = await Promise.all([this.fetchMutations(lapis, signal)]);

        const instance = MutationCache.getInstance();
        const content: SubstitutionOrDeletionEntry[] = mutations.map(({ mutation, count, proportion }) => {
            const parsed = instance.getSubstitutionOrDeletion(mutation);
            return parsed instanceof Substitution
                ? { type: 'substitution', mutation: parsed, count, proportion }
                : { type: 'deletion', mutation: parsed, count, proportion };
        });

        return { content };
    }

    private async fetchMutations(
        lapis: string,
        signal?: AbortSignal,
    ): Promise<{ mutation: string; count: number; proportion: number }[]> {
        const endpoint = `${this.sequenceType === 'nucleotide' ? 'nuc' : 'aa'}-mutations`;
        const params = mapLapisFilterToUrlParams(this.filter);
        if (this.minProportion !== undefined) {
            params.set('minProportion', this.minProportion.toString());
        }
        return (await (await fetch(`${lapis}/${endpoint}?${params.toString()}`, { signal })).json()).data;
    }
}
