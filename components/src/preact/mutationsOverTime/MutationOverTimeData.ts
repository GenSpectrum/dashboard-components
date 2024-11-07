import {
    type MutationOverTimeMutationValue,
    serializeSubstitutionOrDeletion,
    serializeTemporal,
} from '../../query/queryMutationsOverTime';
import { type Map2d, Map2dBase, type Map2DContents } from '../../utils/map2d';
import type { Deletion, Substitution } from '../../utils/mutations';
import type { Temporal } from '../../utils/temporalClass';

export type MutationOverTimeDataMap = Map2d<Substitution | Deletion, Temporal, MutationOverTimeMutationValue>;

export class BaseMutationOverTimeDataMap extends Map2dBase<
    Substitution | Deletion,
    Temporal,
    MutationOverTimeMutationValue
> {
    constructor(initialContent?: Map2DContents<Substitution | Deletion, Temporal, MutationOverTimeMutationValue>) {
        super(serializeSubstitutionOrDeletion, serializeTemporal, initialContent);
    }
}
