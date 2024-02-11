import { Operator } from './Operator';
import { Dataset } from './Dataset';
import { MappedNumber, NumberFields } from '../type-utils';

export class DivisionOperator<
    S,
    K extends keyof S,
    V extends NumberFields<S>,
    R extends string,
    N extends string,
    D extends string,
> implements Operator<{ [P in K]: S[K] } & MappedNumber<R | N | D>>
{
    constructor(
        private numerator: Operator<S>,
        private denominator: Operator<S>,
        private keyField: K,
        private valueField: V,
        private resultField: R,
        private numeratorField: N,
        private denominatorField: D,
    ) {}

    async evaluate(
        lapis: string,
        signal?: AbortSignal,
    ): Promise<Dataset<{ [P in K]: S[K] } & MappedNumber<R | N | D>>> {
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
                [this.numeratorField]: numeratorValue as number,
                [this.denominatorField]: row[this.valueField] as number,
                [this.resultField]: (numeratorValue as number) / (row[this.valueField] as number),
            } as { [P in K]: S[K] } & MappedNumber<R | N | D>;
        });

        return { content };
    }
}
