import { Query } from './Query';
import { Dataset } from './Dataset';

export class DataManager {
    private count: number = 0;

    getAndInc() {
        return ++this.count;
    }

    async evaluateQuery<T>(query: Query<T>, signal?: AbortSignal): Promise<Dataset<T>> {
        return query.evaluate(signal);
    }
}

export function getGlobalDataManager(): DataManager {
    // @ts-ignore
    if (!window.genspectrumDataManager) {
        // @ts-ignore
        window.genspectrumDataManager = new DataManager();
    }
    // @ts-ignore
    return window.genspectrumDataManager;
}
