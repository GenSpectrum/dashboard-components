import { type Dataset } from './Dataset';
import { type Operator } from './Operator';

export class GroupByOperator<Data, AggregationResult, KeyToGroupBy extends keyof Data>
    implements Operator<AggregationResult>
{
    constructor(
        private child: Operator<Data>,
        private field: KeyToGroupBy,
        private aggregate: (values: Data[]) => AggregationResult,
    ) {}

    async evaluate(lapis: string, signal?: AbortSignal): Promise<Dataset<AggregationResult>> {
        const childEvaluated = await this.child.evaluate(lapis, signal);
        const grouped = new Map<Data[KeyToGroupBy], Data[]>();
        for (const row of childEvaluated.content) {
            const key = row[this.field];
            if (!grouped.has(key)) {
                grouped.set(key, []);
            }
            grouped.get(key)!.push(row);
        }
        const result = new Array<AggregationResult>();
        for (const [, values] of grouped) {
            result.push(this.aggregate(values));
        }

        return {
            content: result,
        };
    }
}
