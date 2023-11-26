import { Query } from './Query';
import { Dataset } from './Dataset';

export class MockQuery<T> implements Query<T> {
    constructor(private content: T[]) {}

    async evaluate(): Promise<Dataset<T>> {
        return {
            content: this.content,
        };
    }
}
