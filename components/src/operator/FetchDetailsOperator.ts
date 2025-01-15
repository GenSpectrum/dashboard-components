import { type Dataset } from './Dataset';
import { type Operator } from './Operator';
import { fetchAggregated, fetchDetails } from '../lapisApi/lapisApi';
import { type AggregatedItem } from '../lapisApi/lapisTypes';
import { type LapisFilter } from '../types';

export class FetchDetailsOperator<Fields extends Record<string, unknown>> implements Operator<Fields> {
    constructor(
        private filter: LapisFilter,
        private fields: string[] = [],
    ) {}

    async evaluate(lapisUrl: string, signal?: AbortSignal): Promise<Dataset<Fields>> {
        const detailsResponse = (
            await fetchDetails(
                lapisUrl,
                {
                    ...this.filter,
                    fields: this.fields,
                },
                signal,
            )
        ).data;

        return { content: detailsResponse as Fields[] };
    }
}
