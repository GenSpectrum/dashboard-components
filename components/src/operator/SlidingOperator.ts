import { Operator } from './Operator';
import { Dataset } from './Dataset';

export class SlidingOperator<T, S> implements Operator<S> {
    constructor(private child: Operator<T>, private windowSize: number, private aggregate: (values: T[]) => S) {
        if (windowSize < 1) {
            throw new Error('Window size must be at least 1');
        }
    }

    async evaluate(lapis: string, signal?: AbortSignal): Promise<Dataset<S>> {
        const childEvaluated = await this.child.evaluate(lapis, signal);
        const content = new Array<S>();
        for (let i = 0; i < childEvaluated.content.length - this.windowSize + 1; i++) {
            content.push(this.aggregate(childEvaluated.content.slice(i, i + this.windowSize)));
        }
        return { content };
    }
}
