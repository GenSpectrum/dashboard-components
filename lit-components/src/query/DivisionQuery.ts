import { Query } from './Query';
import { Dataset } from './Dataset';
import { NumberFields } from '../type-utils';

export class DivisionQuery<S, K extends keyof S, V extends NumberFields<S>, R extends string>
    implements Query<{ K: S[K]; R: number }>
{
    constructor(
        private numerator: Query<S>,
        private denominator: Query<S>,
        private keyField: K,
        private valueField: V,
        private resultField: R,
    ) {}

    async evaluate(lapis: string, signal?: AbortSignal): Promise<Dataset<{ K: S[K]; R: number }>> {
        const numeratorEvaluated = await this.numerator.evaluate(lapis, signal);
        const denominatorEvaluated = await this.denominator.evaluate(lapis, signal);

        const numeratorMap = new Map<S[K], S[V]>();
        numeratorEvaluated.content.forEach((row) => {
            numeratorMap.set(row[this.keyField], row[this.valueField]);
        });

        const content = denominatorEvaluated.content.map((row) => {
            const numeratorValue = numeratorMap.get(row[this.keyField]) ?? 0;
            return {
                [this.keyField]: row[this.keyField],
                [this.resultField]: (numeratorValue as number) / (row[this.valueField] as number),
            } as { K: S[K]; R: number };
        });

        return { content };
    }
}
