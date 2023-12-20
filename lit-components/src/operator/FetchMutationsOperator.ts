import { Operator } from './Operator';
import { Dataset } from './Dataset';
import { LapisFilter, SequenceType } from '../types';
import { MutationSet, parseMutation, Segmented } from '../mutations';

export class FetchMutationsOperator implements Operator<Segmented<MutationSet>> {
    constructor(private filter: LapisFilter, private sequenceType: SequenceType, private minProportion?: number) {}

    async evaluate(lapis: string, signal?: AbortSignal): Promise<Dataset<Segmented<MutationSet>>> {
        const [lapisMutations, lapisInsertions] = await Promise.all([
            this.fetchMutations(lapis, signal),
            this.fetchInsertions(lapis, signal),
        ]);

        const result: Map<string, MutationSet> = new Map();

        for (const { mutation, count, proportion } of lapisMutations) {
            const parsed = parseMutation(mutation);
            if (!result.has(parsed.value.segment ?? '')) {
                result.set(parsed.value.segment ?? '', {
                    substitutions: [],
                    deletions: [],
                    insertions: [],
                });
            }
            const mutationSet = result.get(parsed.value.segment ?? '')!;
            if (parsed.type === 'substitution') {
                mutationSet.substitutions.push({ substitution: parsed.value, count, proportion });
            } else if (parsed.type === 'deletion') {
                mutationSet.deletions.push({ deletion: parsed.value, count, proportion });
            } else {
                throw new Error('Unexpected mutation type');
            }
        }

        for (const { insertion, count } of lapisInsertions) {
            const parsed = parseMutation(insertion);
            if (!result.has(parsed.value.segment ?? '')) {
                result.set(parsed.value.segment ?? '', {
                    substitutions: [],
                    deletions: [],
                    insertions: [],
                });
            }
            const mutationSet = result.get(parsed.value.segment ?? '')!;
            if (parsed.type === 'insertion') {
                mutationSet.insertions.push({ insertion: parsed.value, count });
            } else {
                throw new Error('Unexpected mutation type');
            }
        }

        return {
            content: [...result.entries()].map(([segment, mutationSet]) => ({ segment, ...mutationSet })),
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
