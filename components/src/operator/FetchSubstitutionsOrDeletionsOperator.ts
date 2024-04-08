import { type Dataset } from './Dataset';
import { type Operator } from './Operator';
import { fetchSubstitutionsOrDeletions } from '../lapisApi/lapisApi';
import { type LapisFilter, type SequenceType, type SubstitutionOrDeletionEntry } from '../types';
import { MutationCache, Substitution } from '../utils/mutations';

export class FetchSubstitutionsOrDeletionsOperator implements Operator<SubstitutionOrDeletionEntry> {
    constructor(
        private filter: LapisFilter,
        private sequenceType: SequenceType,
        private minProportion?: number,
    ) {}

    async evaluate(lapis: string, signal?: AbortSignal): Promise<Dataset<SubstitutionOrDeletionEntry>> {
        const mutations = await this.fetchMutations(lapis, signal);

        const instance = MutationCache.getInstance();
        const content: SubstitutionOrDeletionEntry[] = mutations.map(({ mutation, count, proportion }) => {
            const parsed = instance.getSubstitutionOrDeletion(mutation);
            return parsed instanceof Substitution
                ? { type: 'substitution', mutation: parsed, count, proportion }
                : { type: 'deletion', mutation: parsed, count, proportion };
        });

        return { content };
    }

    private async fetchMutations(lapis: string, signal?: AbortSignal) {
        const filter = {
            ...this.filter,
            minProportion: this.minProportion,
        };

        return fetchSubstitutionsOrDeletions(lapis, filter, this.sequenceType, signal).then(
            (response) => response.data,
        );
    }
}
