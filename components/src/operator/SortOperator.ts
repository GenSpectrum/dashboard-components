import { type Dataset } from './Dataset';
import { type Operator } from './Operator';

export class SortOperator<S> implements Operator<S> {
    constructor(
        private child: Operator<S>,
        private compareFn: (a: S, b: S) => number,
    ) {}

    async evaluate(lapis: string, signal?: AbortSignal): Promise<Dataset<S>> {
        const childEvaluated = await this.child.evaluate(lapis, signal);
        return {
            content: childEvaluated.content.sort(this.compareFn),
        };
    }
}
