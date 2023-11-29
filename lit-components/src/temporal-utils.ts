import { TemporalGranularity } from './types';

export function generateAllDaysInRange(start: string, end: string): string[] {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const days = [];
    for (let date = startDate; date <= endDate; date.setDate(date.getDate() + 1)) {
        days.push(new Date(date).toISOString().split('T')[0]);
    }
    return days;
}

export function generateAllMonthsInRange(start: string, end: string): string[] {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const months = [];
    for (let date = startDate; date <= endDate; date.setMonth(date.getMonth() + 1)) {
        months.push(`${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`);
    }
    return months;
}

export function generateAllYearsInRange(start: string, end: string): string[] {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const years = [];
    for (let date = startDate; date <= endDate; date.setFullYear(date.getFullYear() + 1)) {
        years.push(date.getFullYear().toString());
    }
    return years;
}

export function generateAllInRange(
    start: string | null,
    end: string | null,
    granularity: TemporalGranularity,
): string[] {
    if (start === null || end === null) {
        return [];
    }
    switch (granularity) {
        case 'day':
            return generateAllDaysInRange(start, end);
        case 'month':
            return generateAllMonthsInRange(start, end);
        case 'year':
            return generateAllYearsInRange(start, end);
    }
}

export function getDaysInBetween(start: string, end: string): number {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
}
