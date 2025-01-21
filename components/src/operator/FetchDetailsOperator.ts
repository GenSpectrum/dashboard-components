import { type Dataset } from './Dataset';
import { type Operator } from './Operator';
import { fetchDetails } from '../lapisApi/lapisApi';
import { type LapisFilter } from '../types';

type Details<Fields extends string> = { [field in Fields]: string | number | boolean | null };

export class FetchDetailsOperator<Fields extends string> implements Operator<Details<Fields>> {
    constructor(
        private filter: LapisFilter,
        private fields: Fields[] = [],
    ) {}

    async evaluate(lapisUrl: string, signal?: AbortSignal): Promise<Dataset<Details<Fields>>> {
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

        return { content: detailsResponse as Details<Fields>[] };
    }
}
