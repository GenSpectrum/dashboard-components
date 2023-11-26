import { GroupByQuery } from './GroupByQuery';
import { Query } from './Query';
import { NumberFields } from '../type-utils';

type Result<T, K extends keyof T, C extends keyof T> = {
    [P in K | C]: P extends K ? T[K] : number;
};

export class GroupByAndSumQuery<T, K extends keyof T, C extends NumberFields<T>> extends GroupByQuery<
    T,
    Result<T, K, C>,
    K
> {
    constructor(child: Query<T>, groupByField: K, sumField: C) {
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
