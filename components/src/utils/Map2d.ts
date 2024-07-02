import hash from 'object-hash';

export class Map2d<Key1 extends object | string, Key2 extends object | string, Value> {
    readonly data: Map<string, Map<string, Value>> = new Map<string, Map<string, Value>>();
    readonly keysFirstAxis = new Map<string, Key1>();
    readonly keysSecondAxis = new Map<string, Key2>();

    constructor(
        readonly serializeFirstAxis: (key: Key1) => string = (key) => (typeof key === 'string' ? key : hash(key)),
        readonly serializeSecondAxis: (key: Key2) => string = (key) => (typeof key === 'string' ? key : hash(key)),
    ) {}

    get(keyFirstAxis: Key1, keySecondAxis: Key2) {
        const serializedKeyFirstAxis = this.serializeFirstAxis(keyFirstAxis);
        const serializedKeySecondAxis = this.serializeSecondAxis(keySecondAxis);
        return this.data.get(serializedKeyFirstAxis)?.get(serializedKeySecondAxis);
    }

    getRow(key: Key1, fillEmptyWith: Value) {
        const serializedKeyFirstAxis = this.serializeFirstAxis(key);
        const row = this.data.get(serializedKeyFirstAxis);
        if (row === undefined) {
            return [];
        }
        return Array.from(this.keysSecondAxis.keys()).map((key) => row.get(key) ?? fillEmptyWith);
    }

    set(keyFirstAxis: Key1, keySecondAxis: Key2, value: Value) {
        const serializedKeyFirstAxis = this.serializeFirstAxis(keyFirstAxis);
        const serializedKeySecondAxis = this.serializeSecondAxis(keySecondAxis);

        if (!this.data.has(serializedKeyFirstAxis)) {
            this.data.set(serializedKeyFirstAxis, new Map<string, Value>());
        }

        this.data.get(serializedKeyFirstAxis)!.set(serializedKeySecondAxis, value);

        this.keysFirstAxis.set(serializedKeyFirstAxis, keyFirstAxis);
        this.keysSecondAxis.set(serializedKeySecondAxis, keySecondAxis);
    }

    deleteRow(key: Key1) {
        const serializedKeyFirstAxis = this.serializeFirstAxis(key);
        this.data.delete(serializedKeyFirstAxis);
        this.keysFirstAxis.delete(serializedKeyFirstAxis);
    }

    getFirstAxisKeys() {
        return Array.from(this.keysFirstAxis.values());
    }

    getSecondAxisKeys() {
        return Array.from(this.keysSecondAxis.values());
    }

    getAsArray(fillEmptyWith: Value) {
        return this.getFirstAxisKeys().map((firstAxisKey) => {
            return this.getSecondAxisKeys().map((secondAxisKey) => {
                return this.get(firstAxisKey, secondAxisKey) ?? fillEmptyWith;
            });
        });
    }

    copy() {
        const copy = new Map2d<Key1, Key2, Value>(this.serializeFirstAxis, this.serializeSecondAxis);
        this.data.forEach((value, key) => {
            const keyFirstAxis = this.keysFirstAxis.get(key);
            value.forEach((value, key) => {
                const keySecondAxis = this.keysSecondAxis.get(key);
                copy.set(keyFirstAxis!, keySecondAxis!, value);
            });
        });
        return copy;
    }
}
