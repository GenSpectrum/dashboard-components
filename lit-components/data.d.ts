export declare class DataManager {
    private count;
    private api;
    getAndInc(): number;
    getSequencesPerYear(country: string, signal: AbortSignal): Promise<{
        year: number;
        count: number;
    }[]>;
}
export declare function getGlobalDataManager(): DataManager;
//# sourceMappingURL=data.d.ts.map