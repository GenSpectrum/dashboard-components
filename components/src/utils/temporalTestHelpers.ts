import { TemporalCache, YearMonth, YearMonthDay } from './temporal';

export function yearMonthDay(date: string) {
    return YearMonthDay.parse(date, TemporalCache.getInstance());
}

export function yearMonth(date: string) {
    return YearMonth.parse(date, TemporalCache.getInstance());
}
