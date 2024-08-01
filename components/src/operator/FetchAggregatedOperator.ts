import { type Dataset } from './Dataset';
import { type Operator } from './Operator';
import { fetchAggregated } from '../lapisApi/lapisApi';
import { type AggregatedItem } from '../lapisApi/lapisTypes';
import { type LapisFilter } from '../types';

export class FetchAggregatedOperator<Fields extends Record<string, unknown>>
    implements Operator<Fields & { count: number }>
{
    constructor(
        private filter: LapisFilter,
        private fields: string[] = [],
    ) {}

    async evaluate(lapisUrl: string, signal?: AbortSignal): Promise<Dataset<Fields & { count: number }>> {
        const aggregatedResponse = (
            await fetchAggregated(
                lapisUrl,
                {
                    ...this.filter,
                    fields: this.fields,
                },
                signal,
            )
        ).data;

        if (isFieldsArrayWithCount<Fields & { count: number }>(aggregatedResponse)) {
            return {
                content: aggregatedResponse,
            };
        }

        throw new Error('Aggregated response does not have count');
    }
}

function isFieldsArrayWithCount<T>(data: AggregatedItem[]): data is (T & { count: number })[] {
    return data.every((item) => typeof item === 'object' && 'count' in item && typeof item.count === 'number');
}
