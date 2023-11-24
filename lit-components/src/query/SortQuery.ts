import { Query } from './Query';
import { Dataset } from './Dataset';

export class SortQuery<S> implements Query<S> {
    constructor(private child: Query<S>, private compareFn: (a: S, b: S) => number) {}

    async evaluate(lapis: string, signal?: AbortSignal): Promise<Dataset<S>> {
        const childEvaluated = await this.child.evaluate(lapis, signal);
        return {
            content: childEvaluated.content.sort(this.compareFn),
        };
    }
}
