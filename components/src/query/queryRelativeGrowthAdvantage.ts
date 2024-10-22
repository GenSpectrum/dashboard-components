import { FetchAggregatedOperator } from '../operator/FetchAggregatedOperator';
import { MapOperator } from '../operator/MapOperator';
import { RenameFieldOperator } from '../operator/RenameFieldOperator';
import { type LapisFilter } from '../types';
import { getMinMaxTemporal, TemporalCache, type YearMonthDayClass } from '../utils/temporalClass';

export type RelativeGrowthAdvantageData = Awaited<ReturnType<typeof queryRelativeGrowthAdvantage>>;

export async function queryRelativeGrowthAdvantage<LapisDateField extends string>(
    numerator: LapisFilter,
    denominator: LapisFilter,
    generationTime: number,
    lapis: string,
    lapisDateField: LapisDateField,
    signal?: AbortSignal,
) {
    const fetchNumerator = new FetchAggregatedOperator<{
        [key in LapisDateField]: string | null;
    }>(numerator, [lapisDateField]);
    const fetchDenominator = new FetchAggregatedOperator<{
        [key in LapisDateField]: string | null;
    }>(denominator, [lapisDateField]);
    const mapToFixedDateKeyNumerator = new RenameFieldOperator(fetchNumerator, lapisDateField, 'date');
    const mapToFixedDateKeyDenominator = new RenameFieldOperator(fetchDenominator, lapisDateField, 'date');
    const mapNumerator = new MapOperator(mapToFixedDateKeyNumerator, toYearMonthDay);
    const mapDenominator = new MapOperator(mapToFixedDateKeyDenominator, toYearMonthDay);
    const [numeratorData, denominatorData] = await Promise.all([
        mapNumerator.evaluate(lapis, signal),
        mapDenominator.evaluate(lapis, signal),
    ]);
    const { min: minDate, max: maxDate } = getMinMaxTemporal(denominatorData.content.map((d) => d.date));
    if (!minDate && !maxDate) {
        return null;
    }

    const numeratorCounts = new Map<YearMonthDayClass, number>();
    numeratorData.content.forEach((d) => {
        if (d.date) {
            numeratorCounts.set(d.date, d.count);
        }
    });
    const denominatorCounts = new Map<YearMonthDayClass, number>();
    const requestData = {
        t: [] as number[],
        n: [] as number[],
        k: [] as number[],
    };
    denominatorData.content.forEach((d) => {
        if (d.date) {
            denominatorCounts.set(d.date, d.count);
            const t = d.date.minus(minDate);
            requestData.t.push(t);
            requestData.n.push(d.count);
            requestData.k.push(numeratorCounts.get(d.date) ?? 0);
        }
    });
    const requestPayload = {
        config: {
            alpha: 0.95,
            generationTime,
            initialCasesVariant: 1,
            initialCasesWildtype: 1,
            reproductionNumberWildtype: 1,
            tStart: 0,
            tEnd: maxDate.minus(minDate),
        },
        data: requestData,
    };
    const response = await fetch('https://cov-spectrum.org/api/v2/computed/model/chen2021Fitness', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestPayload),
        signal,
    });
    const responseData = (await response.json()) as {
        estimatedAbsoluteNumbers: {
            t: number[];
            variantCases: number[];
            wildtypeCases: number[];
        };
        estimatedProportions: {
            t: number[];
            proportion: number[];
            ciLower: number[];
            ciUpper: number[];
        };
        params: {
            a: {
                value: number;
                ciLower: number;
                ciUpper: number;
            };
            fc: {
                value: number;
                ciLower: number;
                ciUpper: number;
            };
            fd: {
                value: number;
                ciLower: number;
                ciUpper: number;
            };
            t0: {
                value: number;
                ciLower: number;
                ciUpper: number;
            };
        };
    };
    const transformed = {
        ...responseData,
        estimatedProportions: {
            ...responseData.estimatedProportions,
            t: responseData.estimatedProportions.t.map((t) => minDate.addDays(t)),
        },
    };
    const observedProportions = transformed.estimatedProportions.t.map(
        (t) => (numeratorCounts.get(t) ?? 0) / (denominatorCounts.get(t) ?? 0),
    );

    return {
        ...transformed,
        observedProportions,
    };
}

function toYearMonthDay(d: { date: string | null; count: number }) {
    const temporalCache = TemporalCache.getInstance();
    return {
        date: d.date ? temporalCache.getYearMonthDay(d.date) : null,
        count: d.count,
    };
}
