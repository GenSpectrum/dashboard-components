import { FetchAggregatedOperator } from '../operator/FetchAggregatedOperator';
import { MapOperator } from '../operator/MapOperator';
import { RenameFieldOperator } from '../operator/RenameFieldOperator';
import { UserFacingError } from '../preact/components/error-display';
import { type LapisFilter } from '../types';
import { getMinMaxTemporal, TemporalCache, type YearMonthDayClass } from '../utils/temporalClass';

export type RelativeGrowthAdvantageData = Awaited<ReturnType<typeof queryRelativeGrowthAdvantage>>;

export class NotEnoughDataToComputeFitError extends Error {
    constructor() {
        super('Not enough data to compute computeFit');
    }
}

export async function queryRelativeGrowthAdvantage(
    numerator: LapisFilter,
    denominator: LapisFilter,
    generationTime: number,
    lapis: string,
    lapisDateField: string,
    signal?: AbortSignal,
) {
    const fetchNumerator = new FetchAggregatedOperator<Record<string, string | null>>(numerator, [lapisDateField]);
    const fetchDenominator = new FetchAggregatedOperator<Record<string, string | null>>(denominator, [lapisDateField]);
    const mapToFixedDateKeyNumerator = new RenameFieldOperator(fetchNumerator, lapisDateField, 'date');
    const mapToFixedDateKeyDenominator = new RenameFieldOperator(fetchDenominator, lapisDateField, 'date');
    const mapNumerator = new MapOperator(mapToFixedDateKeyNumerator, toYearMonthDay);
    const mapDenominator = new MapOperator(mapToFixedDateKeyDenominator, toYearMonthDay);
    const [numeratorData, denominatorData] = await Promise.all([
        mapNumerator.evaluate(lapis, signal),
        mapDenominator.evaluate(lapis, signal),
    ]);
    const { min: minDate, max: maxDate } = getMinMaxTemporal(denominatorData.content.map((d) => d.date));
    if (!minDate) {
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

    const responseData = await computeFit(generationTime, maxDate, minDate, requestData, signal);

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

async function computeFit(
    generationTime: number,
    maxDate: YearMonthDayClass,
    minDate: YearMonthDayClass,
    requestData: {
        t: number[];
        k: number[];
        n: number[];
    },
    signal: AbortSignal | undefined,
) {
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

    let response;
    try {
        response = await fetch('https://cov-spectrum.org/api/v2/computed/model/chen2021Fitness', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestPayload),
            signal,
        });
    } catch {
        throw new UserFacingError(
            'Failed to compute relative growth advantage',
            'Could not connect to the server that computes the relative growth advantage. Please try again later.',
        );
    }

    if (!response.ok) {
        throw new NotEnoughDataToComputeFitError();
    }

    return (await response.json()) as {
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
}

function toYearMonthDay(d: { date: string | null; count: number }) {
    const temporalCache = TemporalCache.getInstance();
    return {
        date: d.date ? temporalCache.getYearMonthDay(d.date) : null,
        count: d.count,
    };
}
