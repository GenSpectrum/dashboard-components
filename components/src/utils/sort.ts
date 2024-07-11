import type { Temporal } from './temporal';

export function sortNullToBeginningThenByDate(a: { dateRange: Temporal | null }, b: { dateRange: Temporal | null }) {
    return a.dateRange === null
        ? -1
        : b.dateRange === null
          ? 1
          : a.dateRange.toString().localeCompare(b.dateRange.toString());
}
