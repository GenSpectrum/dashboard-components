import { LapisFilter, SequenceType } from '../types';
import { FetchMutationsOperator } from '../operator/FetchMutationsOperator';
import { SortOperator } from '../operator/SortOperator';

export function queryMutations(variant: LapisFilter, sequenceType: SequenceType, lapis: string, signal?: AbortSignal) {
    const fetchData = new FetchMutationsOperator(variant, sequenceType);
    const sortData = new SortOperator(fetchData, (a, b) => {
        if (a.type === 'insertion' && b.type !== 'insertion') {
            return 1;
        }
        if (b.type === 'insertion' && a.type !== 'insertion') {
            return -1;
        }
        if (a.mutation.segment !== b.mutation.segment) {
            return (a.mutation.segment ?? '').localeCompare(b.mutation.segment ?? '');
        }
        return a.mutation.position - b.mutation.position;
    });
    return sortData.evaluate(lapis, signal);
}
