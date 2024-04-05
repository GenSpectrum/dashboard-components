import { type Dataset } from './Dataset';
import { type Operator } from './Operator';

export class MockOperator<T> implements Operator<T> {
    constructor(private content: T[]) {}

    async evaluate(): Promise<Dataset<T>> {
        return {
            content: this.content,
        };
    }
}
