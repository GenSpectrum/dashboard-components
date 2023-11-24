import { Query } from './Query';
import { Dataset } from './Dataset';

export class FillMissingQuery<S, K extends keyof S> implements Query<S> {
    constructor(
        private child: Query<S>,
        private keyField: K,
        private getMinMaxFn: (values: Iterable<S[K]>) => [S[K], S[K]],
        private getAllRequiredKeysFn: (min: S[K], max: S[K]) => S[K][],
        private defaultValueFn: (key: S[K]) => S,
    ) {}

    async evaluate(lapis: string, signal?: AbortSignal): Promise<Dataset<S>> {
        const childEvaluated = await this.child.evaluate(lapis, signal);
        const existingKeys = new Set(childEvaluated.content.map((row) => row[this.keyField]));
        const [min, max] = this.getMinMaxFn(existingKeys);
        const requiredKeys = this.getAllRequiredKeysFn(min, max);
        const content = childEvaluated.content;
        for (let key of requiredKeys) {
            if (!existingKeys.has(key)) {
                content.push(this.defaultValueFn(key));
            }
        }
        return { content };
    }
}
