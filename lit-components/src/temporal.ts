import * as dayjs from 'dayjs';

export class TemporalCache {
    private yearMonthDayCache = new Map<string, YearMonthDay>();
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
    readonly date = new Date(this.yearNumber, this.monthNumber - 1, this.dayNumber);
    readonly dayjs = dayjs(this.date);

    constructor(
        readonly yearNumber: number,
        readonly monthNumber: number,
        readonly dayNumber: number,
        readonly cache: TemporalCache,
    ) {}

    get text(): string {
        return this.dayjs.format('YYYY-MM-DD');
    }

    toString(): string {
        return this.text;
    }

    get year(): Year {
        return this.cache.getYear(`${this.yearNumber}`);
    }

    get month(): YearMonth {
        return this.cache.getYearMonth(`${this.yearNumber}-${this.monthNumber}`);
    }

    addDays(days: number): YearMonthDay {
        const date = this.dayjs.add(days, 'day');
        const s = date.format('YYYY-MM-DD');
        return this.cache.getYearMonthDay(s);
    }

    diff(other: YearMonthDay): number {
        return Math.abs(this.dayjs.diff(other.dayjs, 'day'));
    }

    static parse(s: string, cache: TemporalCache): YearMonthDay {
        const [year, month, day] = s.split('-').map((s) => parseInt(s));
        return new YearMonthDay(year, month, day, cache);
    }
}

export class YearMonth {
    constructor(readonly yearNumber: number, readonly monthNumber: number, readonly cache: TemporalCache) {}

    get text(): string {
        return this.firstDay.dayjs.format('YYYY-MM');
    }

    toString(): string {
        return this.text;
    }

    get firstDay(): YearMonthDay {
        return this.cache.getYearMonthDay(`${this.yearNumber}-${this.monthNumber}-01`);
    }

    get year(): Year {
        return this.cache.getYear(`${this.yearNumber}`);
    }

    addMonths(months: number): YearMonth {
        const date = this.firstDay.dayjs.add(months, 'month');
        const s = date.format('YYYY-MM');
        return this.cache.getYearMonth(s);
    }

    diff(other: YearMonth): number {
        return this.firstDay.dayjs.diff(other.firstDay.dayjs, 'month');
    }

    static parse(s: string, cache: TemporalCache): YearMonth {
        const [year, month] = s.split('-').map((s) => parseInt(s));
        return new YearMonth(year, month, cache);
    }
}

export class Year {
    constructor(readonly year: number, readonly cache: TemporalCache) {}

    get text(): string {
        return this.firstDay.dayjs.format('YYYY');
    }

    toString(): string {
        return this.text;
    }

    get firstMonth(): YearMonth {
        return this.cache.getYearMonth(`${this.year}-01`);
    }

    get firstDay(): YearMonthDay {
        return this.firstMonth.firstDay;
    }

    addYears(years: number): Year {
        const date = this.firstDay.dayjs.add(years, 'year');
        const s = date.format('YYYY');
        return this.cache.getYear(s);
    }

    diff(other: Year): number {
        return this.firstDay.dayjs.diff(other.firstDay.dayjs, 'year');
    }

    static parse(s: string, cache: TemporalCache): Year {
        const year = parseInt(s);
        return new Year(year, cache);
    }
}

export type Temporal = YearMonthDay | YearMonth | Year;

export function generateAllDaysInRange(start: YearMonthDay, end: YearMonthDay): YearMonthDay[] {
    const days = [];
    const daysInBetween = start.diff(end);
    for (let i = 0; i <= daysInBetween; i++) {
        days.push(start.addDays(i));
    }
    return days;
}

export function generateAllMonthsInRange(start: YearMonth, end: YearMonth): YearMonth[] {
    const months = [];
    const monthsInBetween = start.diff(end);
    for (let i = 0; i <= monthsInBetween; i++) {
        months.push(start.addMonths(i));
    }
    return months;
}

export function generateAllYearsInRange(start: Year, end: Year): Year[] {
    const years = [];
    const yearsInBetween = start.diff(end);
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
    if (start instanceof YearMonth && end instanceof YearMonth) {
        return generateAllMonthsInRange(start, end);
    }
    if (start instanceof Year && end instanceof Year) {
        return generateAllYearsInRange(start, end);
    }
    throw new Error(`Invalid arguments: start and end must be of the same type: ${start}, ${end}`);
}

export function compareTemporal(a: Temporal | null, b: Temporal | null): number {
    if (a === null) {
        return 1;
    }
    if (b === null) {
        return -1;
    }
    if (a instanceof YearMonthDay && b instanceof YearMonthDay) {
        return a.text.localeCompare(b.text);
    }
    if (a instanceof YearMonth && b instanceof YearMonth) {
        return a.text.localeCompare(b.text);
    }
    if (a instanceof Year && b instanceof Year) {
        return a.text.localeCompare(b.text);
    }
    throw new Error(`Cannot compare ${a} and ${b}`);
}

export function getMinMaxTemporal(values: Iterable<Temporal | null>): [Temporal, Temporal] | null {
    let min = null;
    let max = null;
    for (let value of values) {
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
        return null;
    }
    return [min, max];
}
