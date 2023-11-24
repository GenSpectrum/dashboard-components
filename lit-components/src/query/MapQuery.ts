import { Query } from './Query';
import { Dataset } from './Dataset';

export class MapQuery<S, T> implements Query<T> {
    constructor(private child: Query<S>, private func: (value: S) => T) {}

    async evaluate(signal?: AbortSignal): Promise<Dataset<T>> {
        const childEvaluated = await this.child.evaluate(signal);
        return {
            content: childEvaluated.content.map(this.func),
        };
    }
}
