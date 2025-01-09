import dayjs from 'dayjs/esm';
import advancedFormat from 'dayjs/esm/plugin/advancedFormat';
import isoWeek from 'dayjs/esm/plugin/isoWeek';

import type { TemporalGranularity } from '../types';

dayjs.extend(isoWeek);
dayjs.extend(advancedFormat);

/**
 * https://day.js.org/docs/en/plugin/advanced-format
 */
const FORMAT_ISO_WEEK_YEAR_WEEK = 'GGGG-[W]WW';

export class TemporalCache {
    private yearMonthDayCache = new Map<string, YearMonthDayClass>();
    private yearWeekCache = new Map<string, YearWeekClass>();
    private yearMonthCache = new Map<string, YearMonthClass>();
    private yearCache = new Map<string, YearClass>();

    private constructor() {}

    getYearMonthDay(s: string): YearMonthDayClass {
        if (!this.yearMonthDayCache.has(s)) {
            this.yearMonthDayCache.set(s, YearMonthDayClass.parse(s, this));
        }
        return this.yearMonthDayCache.get(s)!;
    }

    getYearMonth(s: string): YearMonthClass {
        if (!this.yearMonthCache.has(s)) {
            this.yearMonthCache.set(s, YearMonthClass.parse(s, this));
        }
        return this.yearMonthCache.get(s)!;
    }

    getYearWeek(s: string): YearWeekClass {
        if (!this.yearWeekCache.has(s)) {
            this.yearWeekCache.set(s, YearWeekClass.parse(s, this));
        }
        return this.yearWeekCache.get(s)!;
    }

    getYear(s: string): YearClass {
        if (!this.yearCache.has(s)) {
            this.yearCache.set(s, YearClass.parse(s, this));
        }
        return this.yearCache.get(s)!;
    }

    private static instance = new TemporalCache();

    static getInstance(): TemporalCache {
        return this.instance;
    }
}

interface YearMonthDay {
    type: 'YearMonthDay';
    yearNumber: number;
    monthNumber: number;
    dayNumber: number;
    dateString: string;
}

export class YearMonthDayClass implements YearMonthDay {
    readonly type = 'YearMonthDay';
    readonly date;
    readonly dayjs;
    readonly dateString;

    constructor(
        readonly yearNumber: number,
        readonly monthNumber: number,
        readonly dayNumber: number,
        readonly cache: TemporalCache,
    ) {
        this.date = new Date(this.yearNumber, this.monthNumber - 1, this.dayNumber);
        this.dayjs = dayjs(this.date);
        this.dateString = this.toString();
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

    get firstDay(): YearMonthDayClass {
        return this;
    }

    get lastDay(): YearMonthDayClass {
        return this;
    }

    get year(): YearClass {
        return this.cache.getYear(`${this.yearNumber}`);
    }

    get month(): YearMonthClass {
        return this.cache.getYearMonth(this.dayjs.format('YYYY-MM'));
    }

    get week(): YearWeekClass {
        return this.cache.getYearWeek(this.dayjs.format(FORMAT_ISO_WEEK_YEAR_WEEK));
    }

    addDays(days: number): YearMonthDayClass {
        const date = this.dayjs.add(days, 'day');
        const s = date.format('YYYY-MM-DD');
        return this.cache.getYearMonthDay(s);
    }

    minus(other: YearMonthDayClass): number {
        return this.dayjs.diff(other.dayjs, 'day');
    }

    static parse(s: string, cache: TemporalCache): YearMonthDayClass {
        const [year, month, day] = s.split('-').map((s) => parseInt(s, 10));
        return new YearMonthDayClass(year, month, day, cache);
    }
}

interface YearWeek {
    type: 'YearWeek';
    isoYearNumber: number;
    isoWeekNumber: number;
    dateString: string;
}

export class YearWeekClass implements YearWeek {
    readonly type = 'YearWeek';
    readonly dateString;

    constructor(
        readonly isoYearNumber: number,
        readonly isoWeekNumber: number,
        readonly cache: TemporalCache,
    ) {
        this.dateString = this.toString();
    }

    get text(): string {
        return this.firstDay.dayjs.format(FORMAT_ISO_WEEK_YEAR_WEEK);
    }

    toString(): string {
        return this.text;
    }

    englishName(): string {
        return `Week ${this.isoWeekNumber}, ${this.isoYearNumber}`;
    }

    get firstDay(): YearMonthDayClass {
        // "The first week of the year, hence, always contains 4 January." https://en.wikipedia.org/wiki/ISO_week_date
        const firstDay = dayjs()
            .year(this.isoYearNumber)
            .month(1)
            .date(4)
            .isoWeek(this.isoWeekNumber)
            .startOf('isoWeek');
        return this.cache.getYearMonthDay(firstDay.format('YYYY-MM-DD'));
    }

    get lastDay(): YearMonthDayClass {
        const lastDay = this.firstDay.dayjs.add(6, 'days');
        return this.cache.getYearMonthDay(lastDay.format('YYYY-MM-DD'));
    }

    get year(): YearClass {
        return this.cache.getYear(`${this.isoYearNumber}`);
    }

    addWeeks(weeks: number): YearWeekClass {
        const date = this.firstDay.dayjs.add(weeks, 'week');
        const s = date.format(FORMAT_ISO_WEEK_YEAR_WEEK);
        return this.cache.getYearWeek(s);
    }

    minus(other: YearWeekClass): number {
        return this.firstDay.dayjs.diff(other.firstDay.dayjs, 'week');
    }

    static parse(s: string, cache: TemporalCache): YearWeekClass {
        const [year, week] = s.split('-W').map((s) => parseInt(s, 10));
        return new YearWeekClass(year, week, cache);
    }
}

interface YearMonth {
    type: 'YearMonth';
    yearNumber: number;
    monthNumber: number;
    dateString: string;
}

export class YearMonthClass implements YearMonth {
    readonly type = 'YearMonth';
    readonly dateString;

    constructor(
        readonly yearNumber: number,
        readonly monthNumber: number,
        readonly cache: TemporalCache,
    ) {
        this.dateString = this.toString();
    }

    get text(): string {
        return this.firstDay.dayjs.format('YYYY-MM');
    }

    toString(): string {
        return this.text;
    }

    englishName(): string {
        return `${monthName(this.monthNumber)} ${this.yearNumber}`;
    }

    get firstDay(): YearMonthDayClass {
        return this.cache.getYearMonthDay(dayjs(`${this.yearNumber}-${this.monthNumber}-01`).format('YYYY-MM-DD'));
    }

    get lastDay(): YearMonthDayClass {
        return this.cache.getYearMonthDay(
            dayjs(`${this.yearNumber}-${this.monthNumber}-01`).endOf('month').format('YYYY-MM-DD'),
        );
    }

    get year(): YearClass {
        return this.cache.getYear(`${this.yearNumber}`);
    }

    addMonths(months: number): YearMonthClass {
        const date = this.firstDay.dayjs.add(months, 'month');
        const s = date.format('YYYY-MM');
        return this.cache.getYearMonth(s);
    }

    minus(other: YearMonthClass): number {
        return this.firstDay.dayjs.diff(other.firstDay.dayjs, 'month');
    }

    static parse(s: string, cache: TemporalCache): YearMonthClass {
        const [year, month] = s.split('-').map((s) => parseInt(s, 10));
        return new YearMonthClass(year, month, cache);
    }
}

interface Year {
    type: 'Year';
    year: number;
    dateString: string;
}

export class YearClass implements Year {
    readonly type = 'Year';
    readonly dateString;

    constructor(
        readonly year: number,
        readonly cache: TemporalCache,
    ) {
        this.dateString = this.toString();
    }

    get text(): string {
        return this.firstDay.dayjs.format('YYYY');
    }

    toString(): string {
        return this.text;
    }

    englishName(): string {
        return this.year.toString();
    }

    get firstMonth(): YearMonthClass {
        return this.cache.getYearMonth(`${this.year}-01`);
    }

    get lastMonth(): YearMonthClass {
        return this.cache.getYearMonth(`${this.year}-12`);
    }

    get firstDay(): YearMonthDayClass {
        return this.firstMonth.firstDay;
    }

    get lastDay(): YearMonthDayClass {
        return this.lastMonth.lastDay;
    }

    addYears(years: number): YearClass {
        const date = this.firstDay.dayjs.add(years, 'year');
        const s = date.format('YYYY');
        return this.cache.getYear(s);
    }

    minus(other: YearClass): number {
        return this.firstDay.dayjs.diff(other.firstDay.dayjs, 'year');
    }

    static parse(s: string, cache: TemporalCache): YearClass {
        const year = parseInt(s, 10);
        return new YearClass(year, cache);
    }
}

function monthName(month: number): string {
    return dayjs()
        .month(month - 1)
        .format('MMMM');
}

export type TemporalClass = YearMonthDayClass | YearWeekClass | YearMonthClass | YearClass;
export type Temporal = YearMonthDay | YearWeek | YearMonth | Year;

export function toTemporalClass(temporal: Temporal) {
    switch (temporal.type) {
        case 'YearMonthDay':
            return new YearMonthDayClass(
                temporal.yearNumber,
                temporal.monthNumber,
                temporal.dayNumber,
                TemporalCache.getInstance(),
            );
        case 'YearWeek':
            return new YearWeekClass(temporal.isoYearNumber, temporal.isoWeekNumber, TemporalCache.getInstance());
        case 'YearMonth':
            return new YearMonthClass(temporal.yearNumber, temporal.monthNumber, TemporalCache.getInstance());
        case 'Year':
            return new YearClass(temporal.year, TemporalCache.getInstance());
    }
}

export function toTemporal(temporalClass: TemporalClass): Temporal {
    switch (temporalClass.type) {
        case 'YearMonthDay':
            return {
                type: 'YearMonthDay',
                yearNumber: temporalClass.yearNumber,
                monthNumber: temporalClass.monthNumber,
                dayNumber: temporalClass.dayNumber,
                dateString: temporalClass.dateString,
            };
        case 'YearWeek':
            return {
                type: 'YearWeek',
                isoYearNumber: temporalClass.isoYearNumber,
                isoWeekNumber: temporalClass.isoWeekNumber,
                dateString: temporalClass.dateString,
            };
        case 'YearMonth':
            return {
                type: 'YearMonth',
                yearNumber: temporalClass.yearNumber,
                monthNumber: temporalClass.monthNumber,
                dateString: temporalClass.dateString,
            };
        case 'Year':
            return {
                type: 'Year',
                year: temporalClass.year,
                dateString: temporalClass.dateString,
            };
    }
}

export function generateAllDaysInRange(start: YearMonthDayClass, end: YearMonthDayClass): YearMonthDayClass[] {
    const days = [];
    const daysInBetween = end.minus(start);
    for (let i = 0; i <= daysInBetween; i++) {
        days.push(start.addDays(i));
    }
    return days;
}

export function generateAllWeeksInRange(start: YearWeekClass, end: YearWeekClass): YearWeekClass[] {
    const weeks = [];
    const weeksInBetween = end.minus(start);
    for (let i = 0; i <= weeksInBetween; i++) {
        weeks.push(start.addWeeks(i));
    }
    return weeks;
}

export function generateAllMonthsInRange(start: YearMonthClass, end: YearMonthClass): YearMonthClass[] {
    const months = [];
    const monthsInBetween = end.minus(start);
    for (let i = 0; i <= monthsInBetween; i++) {
        months.push(start.addMonths(i));
    }
    return months;
}

export function generateAllYearsInRange(start: YearClass, end: YearClass): YearClass[] {
    const years = [];
    const yearsInBetween = end.minus(start);
    for (let i = 0; i <= yearsInBetween; i++) {
        years.push(start.addYears(i));
    }
    return years;
}

export function generateAllInRange(start: TemporalClass | null, end: TemporalClass | null): TemporalClass[] {
    if (start === null || end === null) {
        return [];
    }
    if (start instanceof YearMonthDayClass && end instanceof YearMonthDayClass) {
        return generateAllDaysInRange(start, end);
    }
    if (start instanceof YearWeekClass && end instanceof YearWeekClass) {
        return generateAllWeeksInRange(start, end);
    }
    if (start instanceof YearMonthClass && end instanceof YearMonthClass) {
        return generateAllMonthsInRange(start, end);
    }
    if (start instanceof YearClass && end instanceof YearClass) {
        return generateAllYearsInRange(start, end);
    }
    throw new Error(`Invalid arguments: start and end must be of the same type: ${start}, ${end}`);
}

export function minusTemporal(a: TemporalClass, b: TemporalClass): number {
    if (a instanceof YearMonthDayClass && b instanceof YearMonthDayClass) {
        return a.minus(b);
    }
    if (a instanceof YearWeekClass && b instanceof YearWeekClass) {
        return a.minus(b);
    }
    if (a instanceof YearMonthClass && b instanceof YearMonthClass) {
        return a.minus(b);
    }
    if (a instanceof YearClass && b instanceof YearClass) {
        return a.minus(b);
    }
    throw new Error(`Cannot compare ${a} and ${b}`);
}

export function compareTemporal(a: TemporalClass | null, b: TemporalClass | null): number {
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

export function getMinMaxTemporal<T extends TemporalClass>(values: Iterable<T | null>) {
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

export function addUnit(temporal: TemporalClass, amount: number): TemporalClass {
    if (temporal instanceof YearMonthDayClass) {
        return temporal.addDays(amount);
    }
    if (temporal instanceof YearWeekClass) {
        return temporal.addWeeks(amount);
    }
    if (temporal instanceof YearMonthClass) {
        return temporal.addMonths(amount);
    }
    if (temporal instanceof YearClass) {
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

export function dateRangeCompare(a: { dateRange: TemporalClass | null }, b: { dateRange: TemporalClass | null }) {
    if (a.dateRange === null) {
        return 1;
    }
    if (b.dateRange === null) {
        return -1;
    }
    return compareTemporal(a.dateRange, b.dateRange);
}
