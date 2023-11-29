import { GroupByOperator } from './GroupByOperator';
import { Operator } from './Operator';
import { NumberFields } from '../type-utils';

type Result<T, K extends keyof T, C extends keyof T> = {
    [P in K | C]: P extends K ? T[K] : number;
};

export class GroupByAndSumOperator<T, K extends keyof T, C extends NumberFields<T>> extends GroupByOperator<
    T,
    Result<T, K, C>,
    K
> {
    constructor(child: Operator<T>, groupByField: K, sumField: C) {
        super(child, groupByField, (values: T[]) => {
            let n = 0;
            for (let v of values) {
                n += v[sumField] as number;
            }
            return {
                [groupByField]: values[0][groupByField],
                [sumField]: n,
            } as Result<T, K, C>;
        });
    }
}
