import { type Dataset } from './Dataset';
import { type Operator } from './Operator';

export class MapOperator<S, T> implements Operator<T> {
    constructor(
        private child: Operator<S>,
        private func: (value: S) => T,
    ) {}

    async evaluate(lapis: string, signal?: AbortSignal): Promise<Dataset<T>> {
        const childEvaluated = await this.child.evaluate(lapis, signal);
        return {
            content: childEvaluated.content.map(this.func),
        };
    }
}
