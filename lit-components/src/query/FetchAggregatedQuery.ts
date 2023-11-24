import { Query } from './Query';
import { Dataset } from './Dataset';
import { LapisFilter } from '../types';

export class FetchAggregatedQuery<Fields> implements Query<Fields & { count: number }> {
    constructor(private filter: LapisFilter, private fields: string[]) {}

    async evaluate(lapis: string, signal?: AbortSignal): Promise<Dataset<Fields & { count: number }>> {
        const params = new URLSearchParams(this.filter);
        params.set('fields', this.fields.join(','));
        const data = (await (await fetch(`${lapis}/aggregated?${params.toString()}`, { signal })).json()).data;
        return {
            content: data,
        };
    }
}
