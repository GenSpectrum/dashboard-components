import { FetchInsertionsOperator } from '../operator/FetchInsertionsOperator';
import { SortOperator } from '../operator/SortOperator';
import { type LapisFilter, type SequenceType } from '../types';

export function queryInsertions(variant: LapisFilter, sequenceType: SequenceType, lapis: string, signal?: AbortSignal) {
    const fetchData = new FetchInsertionsOperator(variant, sequenceType);
    const sortData = new SortOperator(fetchData, (a, b) => {
        if (a.mutation.segment !== b.mutation.segment) {
            return (a.mutation.segment ?? '').localeCompare(b.mutation.segment ?? '');
        }
        return a.mutation.position - b.mutation.position;
    });
    return sortData.evaluate(lapis, signal);
}
