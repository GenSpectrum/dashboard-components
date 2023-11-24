import { Query } from './Query';
import { Dataset } from './Dataset';

export class SortQuery<S> implements Query<S> {
    constructor(private child: Query<S>, private compareFn: (a: S, b: S) => number) {}

    async evaluate(signal?: AbortSignal): Promise<Dataset<S>> {
        const childEvaluated = await this.child.evaluate(signal);
        return {
            content: childEvaluated.content.sort(this.compareFn),
        };
    }
}
