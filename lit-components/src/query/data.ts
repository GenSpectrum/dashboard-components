import { Query } from './Query';
import { Dataset } from './Dataset';

export class DataManager {
    private count: number = 0;

    constructor(private lapis: string) {}

    getAndInc() {
        return ++this.count;
    }

    async evaluateQuery<T>(query: Query<T>, signal?: AbortSignal): Promise<Dataset<T>> {
        return query.evaluate(this.lapis, signal);
    }
}

export function getGlobalDataManager(lapis: string): DataManager {
    // @ts-ignore
    if (!window.genspectrumDataManagers) {
        // @ts-ignore
        window.genspectrumDataManagers = new Map<string, DataManager>();
    }
    // @ts-ignore
    if (!window.genspectrumDataManagers.has(lapis)) {
        // @ts-ignore
        window.genspectrumDataManagers.set(lapis, new DataManager(lapis));
    }
    // @ts-ignore
    return window.genspectrumDataManagers.get(lapis);
}
