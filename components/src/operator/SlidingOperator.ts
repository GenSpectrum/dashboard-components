import { type Operator } from './Operator';

export class SlidingOperator<Data, AggregationResult> implements Operator<AggregationResult> {
    constructor(
        private child: Operator<Data>,
        private windowSize: number,
        private aggregate: (values: Data[]) => AggregationResult,
    ) {
        if (windowSize < 1) {
            throw new Error('Window size must be at least 1');
        }
    }

    async evaluate(lapis: string, signal?: AbortSignal) {
        const childEvaluated = await this.child.evaluate(lapis, signal);
        const content = new Array<AggregationResult>();
        const numberOfWindows = Math.max(childEvaluated.content.length - this.windowSize, 0) + 1;
        for (let i = 0; i < numberOfWindows; i++) {
            content.push(this.aggregate(childEvaluated.content.slice(i, i + this.windowSize)));
        }
        return { content };
    }
}
