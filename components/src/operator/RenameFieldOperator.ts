import { MapOperator } from './MapOperator';
import type { Operator } from './Operator';

export class RenameFieldOperator<
    OldFieldName extends string,
    NewFieldName extends string,
    Data extends Record<OldFieldName, unknown>,
> extends MapOperator<Data, Data & Record<NewFieldName, Data[OldFieldName]>> {
    constructor(child: Operator<Data>, oldFieldName: OldFieldName, newFieldName: NewFieldName) {
        super(
            child,
            (value) =>
                ({
                    ...value,
                    [newFieldName]: value[oldFieldName],
                }) as Data & Record<NewFieldName, Data[OldFieldName]>,
        );
    }
}
