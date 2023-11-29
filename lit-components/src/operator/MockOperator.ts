import { Operator } from './Operator';
import { Dataset } from './Dataset';

export class MockOperator<T> implements Operator<T> {
    constructor(private content: T[]) {}

    async evaluate(): Promise<Dataset<T>> {
        return {
            content: this.content,
        };
    }
}
