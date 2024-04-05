import { type Dataset } from './Dataset';
import { type Operator } from './Operator';
import { type MappedNumber, type NumberFields } from '../utils/type-utils';

export type DivisionOperatorResult<
    KeyField extends keyof ValueObject,
    ValueObject,
    ResultField extends string,
    NumeratorField extends string,
    DenominatorField extends string,
> = { [P in KeyField]: ValueObject[KeyField] } & MappedNumber<ResultField> &
    MappedNumber<NumeratorField> &
    MappedNumber<DenominatorField>;

export class DivisionOperator<
    ValueObject,
    KeyField extends keyof ValueObject,
    ValueField extends NumberFields<ValueObject>,
    ResultField extends string,
    NumeratorField extends string,
    DenominatorField extends string,
> implements Operator<DivisionOperatorResult<KeyField, ValueObject, ResultField, NumeratorField, DenominatorField>>
{
    constructor(
        private numerator: Operator<ValueObject>,
        private denominator: Operator<ValueObject>,
        private keyField: KeyField,
        private valueField: ValueField,
        private resultField: ResultField,
        private numeratorField: NumeratorField,
        private denominatorField: DenominatorField,
    ) {}

    async evaluate(
        lapis: string,
        signal?: AbortSignal,
    ): Promise<Dataset<DivisionOperatorResult<KeyField, ValueObject, ResultField, NumeratorField, DenominatorField>>> {
        const numeratorEvaluated = await this.numerator.evaluate(lapis, signal);
        const denominatorEvaluated = await this.denominator.evaluate(lapis, signal);

        const numeratorMap = new Map<ValueObject[KeyField], ValueObject[ValueField]>();
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
            } as { [P in KeyField]: ValueObject[KeyField] } & MappedNumber<ResultField> &
                MappedNumber<NumeratorField> &
                MappedNumber<DenominatorField>;
        });

        return { content };
    }
}
