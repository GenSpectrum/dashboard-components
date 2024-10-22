import { type Dataset } from './Dataset';
import { type Operator } from './Operator';
import { fetchSubstitutionsOrDeletions } from '../lapisApi/lapisApi';
import { type LapisFilter, type SequenceType, type SubstitutionOrDeletionEntry } from '../types';
import { DeletionClass, SubstitutionClass } from '../utils/mutations';

export class FetchSubstitutionsOrDeletionsOperator implements Operator<SubstitutionOrDeletionEntry> {
    constructor(
        private filter: LapisFilter,
        private sequenceType: SequenceType,
        private minProportion?: number,
    ) {}

    async evaluate(lapis: string, signal?: AbortSignal): Promise<Dataset<SubstitutionOrDeletionEntry>> {
        const mutations = await this.fetchMutations(lapis, signal);

        const content: SubstitutionOrDeletionEntry[] = mutations.map(
            ({ count, proportion, mutationFrom, mutationTo, position, sequenceName }) => {
                if (mutationTo === '-') {
                    return {
                        type: 'deletion',
                        mutation: new DeletionClass(sequenceName ?? undefined, mutationFrom, position),
                        count,
                        proportion,
                    };
                }
                return {
                    type: 'substitution',
                    mutation: new SubstitutionClass(sequenceName ?? undefined, mutationFrom, mutationTo, position),
                    count,
                    proportion,
                };
            },
        );

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
