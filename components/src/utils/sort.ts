import type { TemporalClass } from './temporalClass';

export function sortNullToBeginningThenByDate(
    a: { dateRange: TemporalClass | null },
    b: { dateRange: TemporalClass | null },
) {
    return a.dateRange === null
        ? -1
        : b.dateRange === null
          ? 1
          : a.dateRange.toString().localeCompare(b.dateRange.toString());
}
