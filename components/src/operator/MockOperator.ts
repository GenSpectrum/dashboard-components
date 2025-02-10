import { type Dataset } from './Dataset';
import { type Operator } from './Operator';

export class MockOperator<T> implements Operator<T> {
    constructor(private content: T[]) {}

    evaluate(): Promise<Dataset<T>> {
        return new Promise((resolve) =>
            resolve({
                content: this.content,
            }),
        );
    }
}
