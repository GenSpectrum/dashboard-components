import { TemporalCache, YearMonthClass, YearMonthDayClass } from './temporalClass';

export function yearMonthDay(date: string) {
    return YearMonthDayClass.parse(date, TemporalCache.getInstance());
}

export function yearMonth(date: string) {
    return YearMonthClass.parse(date, TemporalCache.getInstance());
}
