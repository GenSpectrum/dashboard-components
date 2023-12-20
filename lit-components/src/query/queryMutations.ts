import { LapisFilter, SequenceType } from '../types';
import { FetchMutationsOperator } from '../operator/FetchMutationsOperator';

export function queryMutations(variant: LapisFilter, sequenceType: SequenceType, lapis: string, signal?: AbortSignal) {
    return new FetchMutationsOperator(variant, sequenceType).evaluate(lapis, signal);
}
