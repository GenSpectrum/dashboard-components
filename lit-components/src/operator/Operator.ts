import { Dataset } from './Dataset';

export interface Operator<T> {
    evaluate(lapis: string, signal?: AbortSignal): Promise<Dataset<T>>;
}
