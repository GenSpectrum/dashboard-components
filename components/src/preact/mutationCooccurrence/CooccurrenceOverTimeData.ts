import type { ProportionValue } from '../../query/queryMutationsOverTime';
import { serializeTemporal } from '../../query/queryMutationsOverTime';
import { Map2dBase, type Map2DContents } from '../../utils/map2d';
import type { Temporal } from '../../utils/temporalClass';

/**
 * A specific combination of alleles observed across the queried positions.
 * Keys are LAPIS position field names (e.g. `[501]`, `S[501]`, `ORF1a[501]`).
 * A `null` value means the position was not covered / the allele was absent in the sequence.
 */
export type CooccurrencePattern = {
    alleles: Record<string, string | null>;
};

export class CooccurrenceOverTimeDataMap extends Map2dBase<CooccurrencePattern, Temporal, ProportionValue> {
    constructor(initialContent?: Map2DContents<CooccurrencePattern, Temporal, ProportionValue>) {
        super(serializeCooccurrencePattern, serializeTemporal, initialContent);
    }
}

export function serializeCooccurrencePattern(pattern: CooccurrencePattern): string {
    return Object.entries(pattern.alleles)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([pos, allele]) => `${pos}:${allele ?? ''}`)
        .join('|');
}
