import { Operator } from './Operator';
import { Dataset } from './Dataset';
import { LapisFilter, SequenceType } from '../types';
import { Deletion, Insertion, MutationCache, MutationSet, Substitution } from '../mutations';

export class FetchMutationsOperator implements Operator<MutationSet> {
    constructor(private filter: LapisFilter, private sequenceType: SequenceType, private minProportion?: number) {}

    async evaluate(lapis: string, signal?: AbortSignal): Promise<Dataset<MutationSet>> {
        const [lapisMutations, lapisInsertions] = await Promise.all([
            this.fetchMutations(lapis, signal),
            this.fetchInsertions(lapis, signal),
        ]);

        const result: MutationSet = {
            substitutions: [],
            deletions: [],
            insertions: [],
        };

        for (const { mutation, count, proportion } of lapisMutations) {
            const parsed = MutationCache.getInstance().getMutation(mutation);
            if (parsed instanceof Substitution) {
                result.substitutions.push({ substitution: parsed, count, proportion });
            } else if (parsed instanceof Deletion) {
                result.deletions.push({ deletion: parsed, count, proportion });
            } else {
                throw new Error('Unexpected mutation type');
            }
        }

        for (const { insertion, count } of lapisInsertions) {
            const parsed = MutationCache.getInstance().getMutation(insertion);
            if (parsed instanceof Insertion) {
                result.insertions.push({ insertion: parsed, count });
            } else {
                throw new Error('Unexpected mutation type');
            }
        }

        return {
            content: [result],
        };
    }

    private async fetchMutations(
        lapis: string,
        signal?: AbortSignal,
    ): Promise<{ mutation: string; count: number; proportion: number }[]> {
        const endpoint = (this.sequenceType === 'nucleotide' ? 'nuc' : 'aa') + '-mutations';
        const params = new URLSearchParams(this.filter);
        if (this.minProportion !== undefined) {
            params.set('minProportion', this.minProportion.toString());
        }
        return (await (await fetch(`${lapis}/${endpoint}?${params.toString()}`, { signal })).json()).data;
    }

    private async fetchInsertions(
        lapis: string,
        signal?: AbortSignal,
    ): Promise<{ insertion: string; count: number }[]> {
        const endpoint = (this.sequenceType === 'nucleotide' ? 'nuc' : 'aa') + '-insertions';
        const params = new URLSearchParams(this.filter);
        return (await (await fetch(`${lapis}/${endpoint}?${params.toString()}`, { signal })).json()).data;
    }
}
