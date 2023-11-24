import { Dataset } from './Dataset';

export interface Query<T> {
    evaluate(lapis: string, signal?: AbortSignal): Promise<Dataset<T>>;
}
