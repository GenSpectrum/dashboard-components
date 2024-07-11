import { describe, expect, test } from 'vitest';

import { queryNumberOfSequencesOverTime } from './queryNumberOfSequencesOverTime';
import { DUMMY_LAPIS_URL, lapisRequestMocks } from '../../vitest.setup';
import { TemporalCache, YearMonth, YearMonthDay } from '../utils/temporal';

const lapisDateField = 'dateField';
const lapisFilter = { field1: 'value1', field2: 'value2' };

describe('queryNumberOfSequencesOverTime', () => {
    test('should fetch data for a single filter', async () => {
        lapisRequestMocks.aggregated(
            { ...lapisFilter, fields: [lapisDateField] },
            {
                data: [
                    { count: 1, [lapisDateField]: '2023-01-01' },
                    { count: 2, [lapisDateField]: '2023-01-02' },
                ],
            },
        );

        const result = await queryNumberOfSequencesOverTime(
            DUMMY_LAPIS_URL,
            { displayName: 'displayName', lapisFilter },
            lapisDateField,
            'day',
            0,
        );

        expect(result).to.deep.equal([
            {
                displayName: 'displayName',
                content: [
                    { count: 1, dateRange: yearMonthDay('2023-01-01') },
                    { count: 2, dateRange: yearMonthDay('2023-01-02') },
                ],
            },
        ]);
    });

    test('should fill missing dates with count 0', async () => {
        lapisRequestMocks.aggregated(
            { ...lapisFilter, fields: [lapisDateField] },
            {
                data: [
                    { count: 1, [lapisDateField]: '2023-01-01' },
                    { count: 2, [lapisDateField]: '2023-01-04' },
                ],
            },
        );

        const result = await queryNumberOfSequencesOverTime(
            DUMMY_LAPIS_URL,
            { displayName: 'displayName', lapisFilter },
            lapisDateField,
            'day',
            0,
        );

        expect(result).to.deep.equal([
            {
                displayName: 'displayName',
                content: [
                    { count: 1, dateRange: yearMonthDay('2023-01-01') },
                    { count: 0, dateRange: yearMonthDay('2023-01-02') },
                    { count: 0, dateRange: yearMonthDay('2023-01-03') },
                    { count: 2, dateRange: yearMonthDay('2023-01-04') },
                ],
            },
        ]);
    });

    test('should smooth the data', async () => {
        lapisRequestMocks.aggregated(
            { ...lapisFilter, fields: [lapisDateField] },
            {
                data: [
                    { count: 3, [lapisDateField]: '2023-01-01' },
                    { count: 0, [lapisDateField]: '2023-01-02' },
                    { count: 3, [lapisDateField]: '2023-01-03' },
                    { count: 0, [lapisDateField]: '2023-01-04' },
                    { count: 6, [lapisDateField]: '2023-01-05' },
                    { count: 0, [lapisDateField]: '2023-01-06' },
                ],
            },
        );

        const result = await queryNumberOfSequencesOverTime(
            DUMMY_LAPIS_URL,
            { displayName: 'displayName', lapisFilter },
            lapisDateField,
            'day',
            3,
        );

        expect(result).to.deep.equal([
            {
                displayName: 'displayName',
                content: [
                    { count: 2, dateRange: yearMonthDay('2023-01-02') },
                    { count: 1, dateRange: yearMonthDay('2023-01-03') },
                    { count: 3, dateRange: yearMonthDay('2023-01-04') },
                    { count: 2, dateRange: yearMonthDay('2023-01-05') },
                ],
            },
        ]);
    });

    test('should aggregate by month', async () => {
        lapisRequestMocks.aggregated(
            { ...lapisFilter, fields: [lapisDateField] },
            {
                data: [
                    { count: 1, [lapisDateField]: '2023-01-01' },
                    { count: 2, [lapisDateField]: '2023-01-02' },
                    { count: 3, [lapisDateField]: '2023-02-05' },
                    { count: 4, [lapisDateField]: '2023-02-06' },
                    { count: 5, [lapisDateField]: '2023-03-06' },
                ],
            },
        );

        const result = await queryNumberOfSequencesOverTime(
            DUMMY_LAPIS_URL,
            { displayName: 'displayName', lapisFilter },
            lapisDateField,
            'month',
            0,
        );

        expect(result).to.deep.equal([
            {
                displayName: 'displayName',
                content: [
                    { count: 3, dateRange: yearMonth('2023-01') },
                    { count: 7, dateRange: yearMonth('2023-02') },
                    { count: 5, dateRange: yearMonth('2023-03') },
                ],
            },
        ]);
    });

    test('should fetch data for multiple filters', async () => {
        const lapisFilter1 = { field1: 'value1', field2: 'value2' };
        const lapisFilter2 = { field3: 'value3', field4: 'value4' };
        lapisRequestMocks.multipleAggregated([
            {
                body: { ...lapisFilter1, fields: [lapisDateField] },
                response: {
                    data: [
                        { count: 1, [lapisDateField]: '2023-01-01' },
                        { count: 2, [lapisDateField]: '2023-01-02' },
                    ],
                },
            },
            {
                body: { ...lapisFilter2, fields: [lapisDateField] },
                response: {
                    data: [
                        { count: 3, [lapisDateField]: '2023-01-02' },
                        { count: 4, [lapisDateField]: '2023-01-03' },
                    ],
                },
            },
        ]);

        const result = await queryNumberOfSequencesOverTime(
            DUMMY_LAPIS_URL,
            [
                { displayName: 'displayName1', lapisFilter: lapisFilter1 },
                { displayName: 'displayName2', lapisFilter: lapisFilter2 },
            ],
            lapisDateField,
            'day',
            0,
        );

        expect(result).to.deep.equal([
            {
                displayName: 'displayName1',
                content: [
                    { count: 1, dateRange: yearMonthDay('2023-01-01') },
                    { count: 2, dateRange: yearMonthDay('2023-01-02') },
                ],
            },
            {
                displayName: 'displayName2',
                content: [
                    { count: 3, dateRange: yearMonthDay('2023-01-02') },
                    { count: 4, dateRange: yearMonthDay('2023-01-03') },
                ],
            },
        ]);
    });
});

function yearMonthDay(date: string) {
    return YearMonthDay.parse(date, TemporalCache.getInstance());
}

function yearMonth(date: string) {
    return YearMonth.parse(date, TemporalCache.getInstance());
}
