import dayjs from 'dayjs/esm';
import advancedFormat from 'dayjs/esm/plugin/advancedFormat';
import isoWeek from 'dayjs/esm/plugin/isoWeek';

import type { TemporalGranularity } from '../types';

dayjs.extend(isoWeek);
dayjs.extend(advancedFormat);

export class TemporalCache {
    private yearMonthDayCache = new Map<string, YearMonthDay>();
    private yearWeekCache = new Map<string, YearWeek>();
    private yearMonthCache = new Map<string, YearMonth>();
    private yearCache = new Map<string, Year>();

    private constructor() {}

    getYearMonthDay(s: string): YearMonthDay {
        if (!this.yearMonthDayCache.has(s)) {
            this.yearMonthDayCache.set(s, YearMonthDay.parse(s, this));
        }
        return this.yearMonthDayCache.get(s)!;
    }

    getYearMonth(s: string): YearMonth {
        if (!this.yearMonthCache.has(s)) {
            this.yearMonthCache.set(s, YearMonth.parse(s, this));
        }
        return this.yearMonthCache.get(s)!;
    }

    getYearWeek(s: string): YearWeek {
        if (!this.yearWeekCache.has(s)) {
            this.yearWeekCache.set(s, YearWeek.parse(s, this));
        }
        return this.yearWeekCache.get(s)!;
    }

    getYear(s: string): Year {
        if (!this.yearCache.has(s)) {
            this.yearCache.set(s, Year.parse(s, this));
        }
        return this.yearCache.get(s)!;
    }

    private static instance = new TemporalCache();

    static getInstance(): TemporalCache {
        return this.instance;
    }
}

export class YearMonthDay {
    readonly date;
    readonly dayjs;

    constructor(
        readonly yearNumber: number,
        readonly monthNumber: number,
        readonly dayNumber: number,
        readonly cache: TemporalCache,
    ) {
        this.date = new Date(this.yearNumber, this.monthNumber - 1, this.dayNumber);
        this.dayjs = dayjs(this.date);
    }

    get text(): string {
        return this.dayjs.format('YYYY-MM-DD');
    }

    toString(): string {
        return this.text;
    }

    englishName(): string {
        return this.dayjs.format('dddd, MMMM D, YYYY');
    }

    get firstDay(): YearMonthDay {
        return this;
    }

    get lastDay(): YearMonthDay {
        return this;
    }

    get year(): Year {
        return this.cache.getYear(`${this.yearNumber}`);
    }

    get month(): YearMonth {
        return this.cache.getYearMonth(this.dayjs.format('YYYY-MM'));
    }

    get week(): YearWeek {
        return this.cache.getYearWeek(this.dayjs.format('GGGG-WW'));
    }

    addDays(days: number): YearMonthDay {
        const date = this.dayjs.add(days, 'day');
        const s = date.format('YYYY-MM-DD');
        return this.cache.getYearMonthDay(s);
    }

    minus(other: YearMonthDay): number {
        return this.dayjs.diff(other.dayjs, 'day');
    }

    static parse(s: string, cache: TemporalCache): YearMonthDay {
        const [year, month, day] = s.split('-').map((s) => parseInt(s, 10));
        return new YearMonthDay(year, month, day, cache);
    }
}

export class YearWeek {
    constructor(
        readonly isoYearNumber: number,
        readonly isoWeekNumber: number,
        readonly cache: TemporalCache,
    ) {}

    get text(): string {
        return this.firstDay.dayjs.format('YYYY-WW');
    }

    toString(): string {
        return this.text;
    }

    englishName(): string {
        return `Week ${this.isoWeekNumber}, ${this.isoYearNumber}`
    }

    get firstDay(): YearMonthDay {
        // "The first week of the year, hence, always contains 4 January." https://en.wikipedia.org/wiki/ISO_week_date
        const firstDay = dayjs()
            .year(this.isoYearNumber)
            .month(1)
            .date(4)
            .isoWeek(this.isoWeekNumber)
            .startOf('isoWeek');
        return this.cache.getYearMonthDay(firstDay.format('YYYY-MM-DD'));
    }

    get lastDay(): YearMonthDay {
        const lastDay = dayjs()
            .year(this.isoYearNumber)
            .month(12)
            .date(31)
            .isoWeek(this.isoWeekNumber)
            .endOf('isoWeek');
        return this.cache.getYearMonthDay(lastDay.format('YYYY-MM-DD'));
    }

    get year(): Year {
        return this.cache.getYear(`${this.isoYearNumber}`);
    }

    addWeeks(weeks: number): YearWeek {
        const date = this.firstDay.dayjs.add(weeks, 'week');
        const s = date.format('YYYY-WW');
        return this.cache.getYearWeek(s);
    }

    minus(other: YearWeek): number {
        return this.firstDay.dayjs.diff(other.firstDay.dayjs, 'week');
    }

    static parse(s: string, cache: TemporalCache): YearWeek {
        const [year, week] = s.split('-').map((s) => parseInt(s, 10));
        return new YearWeek(year, week, cache);
    }
}

export class YearMonth {
    constructor(
        readonly yearNumber: number,
        readonly monthNumber: number,
        readonly cache: TemporalCache,
    ) {}

    get text(): string {
        return this.firstDay.dayjs.format('YYYY-MM');
    }

    toString(): string {
        return this.text;
    }

    englishName(): string {
        return `${monthName(this.monthNumber)} ${this.yearNumber}`;
    }

    get firstDay(): YearMonthDay {
        return this.cache.getYearMonthDay(dayjs(`${this.yearNumber}-${this.monthNumber}-01`).format('YYYY-MM-DD'));
    }

    get lastDay(): YearMonthDay {
        return this.cache.getYearMonthDay(
            dayjs(`${this.yearNumber}-${this.monthNumber}-01`).endOf('month').format('YYYY-MM-DD'),
        );
    }

    get year(): Year {
        return this.cache.getYear(`${this.yearNumber}`);
    }

    addMonths(months: number): YearMonth {
        const date = this.firstDay.dayjs.add(months, 'month');
        const s = date.format('YYYY-MM');
        return this.cache.getYearMonth(s);
    }

    minus(other: YearMonth): number {
        return this.firstDay.dayjs.diff(other.firstDay.dayjs, 'month');
    }

    static parse(s: string, cache: TemporalCache): YearMonth {
        const [year, month] = s.split('-').map((s) => parseInt(s, 10));
        return new YearMonth(year, month, cache);
    }
}

export class Year {
    constructor(
        readonly year: number,
        readonly cache: TemporalCache,
    ) {}

    get text(): string {
        return this.firstDay.dayjs.format('YYYY');
    }

    toString(): string {
        return this.text;
    }

    englishName(): string {
        return this.year.toString();
    }

    get firstMonth(): YearMonth {
        return this.cache.getYearMonth(`${this.year}-01`);
    }

    get lastMonth(): YearMonth {
        return this.cache.getYearMonth(`${this.year}-12`);
    }

    get firstDay(): YearMonthDay {
        return this.firstMonth.firstDay;
    }

    get lastDay(): YearMonthDay {
        return this.lastMonth.lastDay;
    }

    addYears(years: number): Year {
        const date = this.firstDay.dayjs.add(years, 'year');
        const s = date.format('YYYY');
        return this.cache.getYear(s);
    }

    minus(other: Year): number {
        return this.firstDay.dayjs.diff(other.firstDay.dayjs, 'year');
    }

    static parse(s: string, cache: TemporalCache): Year {
        const year = parseInt(s, 10);
        return new Year(year, cache);
    }
}

function monthName(month: number): string {
    return dayjs().month(month - 1).format('MMMM');
}

export type Temporal = YearMonthDay | YearWeek | YearMonth | Year;

export function generateAllDaysInRange(start: YearMonthDay, end: YearMonthDay): YearMonthDay[] {
    const days = [];
    const daysInBetween = end.minus(start);
    for (let i = 0; i <= daysInBetween; i++) {
        days.push(start.addDays(i));
    }
    return days;
}

export function generateAllWeeksInRange(start: YearWeek, end: YearWeek): YearWeek[] {
    const weeks = [];
    const weeksInBetween = end.minus(start);
    for (let i = 0; i <= weeksInBetween; i++) {
        weeks.push(start.addWeeks(i));
    }
    return weeks;
}

export function generateAllMonthsInRange(start: YearMonth, end: YearMonth): YearMonth[] {
    const months = [];
    const monthsInBetween = end.minus(start);
    for (let i = 0; i <= monthsInBetween; i++) {
        months.push(start.addMonths(i));
    }
    return months;
}

export function generateAllYearsInRange(start: Year, end: Year): Year[] {
    const years = [];
    const yearsInBetween = end.minus(start);
    for (let i = 0; i <= yearsInBetween; i++) {
        years.push(start.addYears(i));
    }
    return years;
}

export function generateAllInRange(start: Temporal | null, end: Temporal | null): Temporal[] {
    if (start === null || end === null) {
        return [];
    }
    if (start instanceof YearMonthDay && end instanceof YearMonthDay) {
        return generateAllDaysInRange(start, end);
    }
    if (start instanceof YearWeek && end instanceof YearWeek) {
        return generateAllWeeksInRange(start, end);
    }
    if (start instanceof YearMonth && end instanceof YearMonth) {
        return generateAllMonthsInRange(start, end);
    }
    if (start instanceof Year && end instanceof Year) {
        return generateAllYearsInRange(start, end);
    }
    throw new Error(`Invalid arguments: start and end must be of the same type: ${start}, ${end}`);
}

export function minusTemporal(a: Temporal, b: Temporal): number {
    if (a instanceof YearMonthDay && b instanceof YearMonthDay) {
        return a.minus(b);
    }
    if (a instanceof YearWeek && b instanceof YearWeek) {
        return a.minus(b);
    }
    if (a instanceof YearMonth && b instanceof YearMonth) {
        return a.minus(b);
    }
    if (a instanceof Year && b instanceof Year) {
        return a.minus(b);
    }
    throw new Error(`Cannot compare ${a} and ${b}`);
}

export function compareTemporal(a: Temporal | null, b: Temporal | null): number {
    if (a === null) {
        return 1;
    }
    if (b === null) {
        return -1;
    }
    const diff = minusTemporal(a, b);
    if (diff < 0) {
        return -1;
    }
    if (diff > 0) {
        return 1;
    }
    return 0;
}

export function getMinMaxTemporal<T extends Temporal>(values: Iterable<T | null>) {
    let min: T | null = null;
    let max: T | null = null;
    for (const value of values) {
        if (value === null) {
            continue;
        }
        if (min === null || compareTemporal(value, min) < 0) {
            min = value;
        }
        if (max === null || compareTemporal(value, max) > 0) {
            max = value;
        }
    }
    if (min === null || max === null) {
        return { min: null, max: null };
    }
    return { min, max };
}

export function addUnit(temporal: Temporal, amount: number): Temporal {
    if (temporal instanceof YearMonthDay) {
        return temporal.addDays(amount);
    }
    if (temporal instanceof YearWeek) {
        return temporal.addWeeks(amount);
    }
    if (temporal instanceof YearMonth) {
        return temporal.addMonths(amount);
    }
    if (temporal instanceof Year) {
        return temporal.addYears(amount);
    }
    throw new Error(`Invalid argument: ${temporal}`);
}

export function parseDateStringToTemporal(date: string, granularity: TemporalGranularity) {
    const cache = TemporalCache.getInstance();
    const day = cache.getYearMonthDay(date);
    switch (granularity) {
        case 'day':
            return day;
        case 'week':
            return day.week;
        case 'month':
            return day.month;
        case 'year':
            return day.year;
    }
}

export function dateRangeCompare(a: { dateRange: Temporal | null }, b: { dateRange: Temporal | null }) {
    if (a.dateRange === null) {
        return 1;
    }
    if (b.dateRange === null) {
        return -1;
    }
    return compareTemporal(a.dateRange, b.dateRange);
}
