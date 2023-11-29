import { Operator } from './Operator';
import { Dataset } from './Dataset';

export class GroupByOperator<T, S, K extends keyof T> implements Operator<S> {
    constructor(private child: Operator<T>, private field: K, private aggregate: (values: T[]) => S) {}

    async evaluate(lapis: string, signal?: AbortSignal): Promise<Dataset<S>> {
        const childEvaluated = await this.child.evaluate(lapis, signal);
        const grouped = new Map<T[K], T[]>();
        for (let row of childEvaluated.content) {
            const key = row[this.field];
            if (!grouped.has(key)) {
                grouped.set(key, []);
            }
            grouped.get(key)!.push(row);
        }
        const result = new Array<S>();
        for (let [, values] of grouped) {
            result.push(this.aggregate(values));
        }

        return {
            content: result,
        };
    }
}
