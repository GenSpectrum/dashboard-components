export class DataManager {
    constructor() {
        this.count = 0;
        this.api = "https://lapis.cov-spectrum.org/open/v1/sample";
    }
    getAndInc() {
        return ++this.count;
    }
    async getSequencesPerYear(country, signal) {
        const data = (await (await fetch(`${this.api}/aggregated?fields=date&country=${country}`, { signal })).json()).data;
        const years = new Map();
        for (let d of data) {
            if (d.date !== null) {
                const year = new Date(d.date).getFullYear();
                years.set(year, (years.get(year) ?? 0) + d.count);
            }
        }
        return [...years].map(d => ({ year: d[0], count: d[1] }));
    }
}
export function getGlobalDataManager() {
    // @ts-ignore
    if (!window.genspectrumDataManager) {
        // @ts-ignore
        window.genspectrumDataManager = new DataManager();
    }
    // @ts-ignore
    return window.genspectrumDataManager;
}
//# sourceMappingURL=data.js.map