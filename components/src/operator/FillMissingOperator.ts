import { Operator } from './Operator';
import { Dataset } from './Dataset';

export class FillMissingOperator<Data, KeyToFill extends keyof Data> implements Operator<Data> {
    constructor(
        private child: Operator<Data>,
        private keyField: KeyToFill,
        private getMinMaxFn: (values: Iterable<Data[KeyToFill]>) => [Data[KeyToFill], Data[KeyToFill]] | null,
        private getAllRequiredKeysFn: (min: Data[KeyToFill], max: Data[KeyToFill]) => Data[KeyToFill][],
        private defaultValueFn: (key: Data[KeyToFill]) => Data,
    ) {}

    async evaluate(lapis: string, signal?: AbortSignal): Promise<Dataset<Data>> {
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
