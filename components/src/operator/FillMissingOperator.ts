import { Operator } from './Operator';
import { Dataset } from './Dataset';

export class FillMissingOperator<S, K extends keyof S> implements Operator<S> {
    constructor(
        private child: Operator<S>,
        private keyField: K,
        private getMinMaxFn: (values: Iterable<S[K]>) => [S[K], S[K]] | null,
        private getAllRequiredKeysFn: (min: S[K], max: S[K]) => S[K][],
        private defaultValueFn: (key: S[K]) => S,
    ) {}

    async evaluate(lapis: string, signal?: AbortSignal): Promise<Dataset<S>> {
        const childEvaluated = await this.child.evaluate(lapis, signal);
        const existingKeys = new Set(childEvaluated.content.map((row) => row[this.keyField]));
        const minMax = this.getMinMaxFn(existingKeys);
        if (minMax === null) {
            return childEvaluated;
        }
        const [min, max] = minMax;
        const requiredKeys = this.getAllRequiredKeysFn(min, max);
        const content = childEvaluated.content;
        for (const key of requiredKeys) {
            if (!existingKeys.has(key)) {
                content.push(this.defaultValueFn(key));
            }
        }
        return { content };
    }
}
