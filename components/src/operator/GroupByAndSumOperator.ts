import { GroupByOperator } from './GroupByOperator';
import { type Operator } from './Operator';
import { type NumberFields } from '../utils/type-utils';

type Result<Data, KeyToGroupBy extends keyof Data, KeyToSumBy extends keyof Data> = {
    [P in KeyToGroupBy | KeyToSumBy]: P extends KeyToGroupBy ? Data[KeyToGroupBy] : number;
};

export class GroupByAndSumOperator<
    Data,
    KeyToGroupBy extends keyof Data,
    KeySoSumBy extends NumberFields<Data>,
> extends GroupByOperator<Data, Result<Data, KeyToGroupBy, KeySoSumBy>, KeyToGroupBy> {
    constructor(child: Operator<Data>, groupByField: KeyToGroupBy, sumField: KeySoSumBy) {
        super(child, groupByField, (values: Data[]) => {
            let n = 0;
            for (const value of values) {
                n += value[sumField] as number;
            }
            return {
                [groupByField]: values[0][groupByField],
                [sumField]: n,
            } as Result<Data, KeyToGroupBy, KeySoSumBy>;
        });
    }
}
