import {
    type ProportionValue,
    serializeSubstitutionOrDeletion,
    serializeTemporal,
} from '../../query/queryMutationsOverTime';
import { type Map2d, Map2dBase, type Map2DContents } from '../../utils/map2d';
import type { Deletion, Substitution } from '../../utils/mutations';
import type { Temporal, TemporalClass } from '../../utils/temporalClass';

export type TemporalDataMap<D, T extends Temporal | TemporalClass = Temporal> = Map2d<D, T, ProportionValue>;

export type MutationOverTimeDataMap<T extends Temporal | TemporalClass = Temporal> = Map2d<
    Substitution | Deletion,
    T,
    ProportionValue
>;

export class BaseMutationOverTimeDataMap<T extends Temporal | TemporalClass = Temporal> extends Map2dBase<
    Substitution | Deletion,
    T,
    ProportionValue
> {
    constructor(initialContent?: Map2DContents<Substitution | Deletion, T, ProportionValue>) {
        super(serializeSubstitutionOrDeletion, serializeTemporal, initialContent);
    }
}
