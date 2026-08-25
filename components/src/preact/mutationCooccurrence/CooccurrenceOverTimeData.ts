import type { ProportionValue } from '../../query/queryMutationsOverTime';
import { serializeTemporal } from '../../query/queryMutationsOverTime';
import { Map2dBase, type Map2DContents } from '../../utils/map2d';
import type { Temporal } from '../../utils/temporalClass';

/**
 * A specific combination of values (nucleotides or amino acids) observed across the queried positions.
 * Keys are LAPIS position field names (e.g. `[501]`, `S[501]`, `ORF1a[501]`).
 * String values are the symbol at that position. `null` means the position is not covered
 * (LAPIS returned `'N'` or no value for it).
 */
export type CooccurrencePattern = {
    symbols: Record<string, string | null>;
};

export class CooccurrenceOverTimeDataMap extends Map2dBase<CooccurrencePattern, Temporal, ProportionValue> {
    constructor(initialContent?: Map2DContents<CooccurrencePattern, Temporal, ProportionValue>) {
        super(serializeCooccurrencePattern, serializeTemporal, initialContent);
    }
}

export function formatSymbol(symbol: string | null | undefined): string {
    if (symbol === null || symbol === undefined) {
        return '?';
    }
    return symbol;
}

export function serializeCooccurrencePattern(pattern: CooccurrencePattern): string {
    return Object.entries(pattern.symbols)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([pos, symbol]) => `${pos}:${symbol ?? ''}`)
        .join('|');
}
