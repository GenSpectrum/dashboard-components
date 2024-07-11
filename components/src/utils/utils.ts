import { type LapisFilter } from '../types';

export function getMinMaxNumber(values: Iterable<number>): [number, number] | null {
    let min = null;
    let max = null;
    for (const value of values) {
        if (min === null || value < min) {
            min = value;
        }
        if (max === null || value > max) {
            max = value;
        }
    }
    if (min === null || max === null) {
        return null;
    }
    return [min, max];
}

export function mapLapisFilterToUrlParams(filter: LapisFilter): URLSearchParams {
    const params = Object.entries(filter).map(([key, value]) => [key, stringifyLapisFilterValue(value)]);

    return new URLSearchParams(params);
}

function stringifyLapisFilterValue(value: LapisFilter[string]) {
    if (value === null) {
        return 'null';
    }
    switch (typeof value) {
        case 'boolean':
            return value ? 'true' : 'false';
        case 'number':
            return value.toString();
        case 'string':
            return value;
    }
}

export function makeArray<T>(arrayOrSingleItem: T | T[]) {
    if (Array.isArray(arrayOrSingleItem)) {
        return arrayOrSingleItem;
    }
    return [arrayOrSingleItem];
}
