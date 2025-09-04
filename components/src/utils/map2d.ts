export interface Map2d<Key1, Key2, Value> {
    get(keyFirstAxis: Key1, keySecondAxis: Key2): Value | undefined;

    set(keyFirstAxis: Key1, keySecondAxis: Key2, value: Value): void;

    getRow(key: Key1): (Value | undefined)[];

    deleteRow(key: Key1): void;

    getFirstAxisKeys(): Key1[];

    getSecondAxisKeys(): Key2[];

    getAsArray(): (Value | undefined)[][];

    serializeFirstAxis(key: Key1): string;

    serializeSecondAxis(key: Key2): string;

    getContents(): Map2DContents<Key1, Key2, Value>;

    readonly keysFirstAxis: Map<string, Key1>;
    readonly keysSecondAxis: Map<string, Key2>;
}

export type Map2DContents<Key1, Key2, Value> = {
    keysFirstAxis: Map<string, Key1>;
    keysSecondAxis: Map<string, Key2>;
    data: Map<string, Map<string, Value>>;
};

export class Map2dBase<Key1 extends object | string, Key2 extends object | string, Value>
    implements Map2d<Key1, Key2, Value>
{
    readonly data: Map<string, Map<string, Value>> = new Map<string, Map<string, Value>>();
    readonly keysFirstAxis = new Map<string, Key1>();
    readonly keysSecondAxis = new Map<string, Key2>();

    constructor(
        readonly serializeFirstAxis: (key: Key1) => string,
        readonly serializeSecondAxis: (key: Key2) => string,
        initialContent?: Map2DContents<Key1, Key2, Value>,
    ) {
        if (initialContent) {
            this.keysFirstAxis = new Map(initialContent.keysFirstAxis);
            this.keysSecondAxis = new Map(initialContent.keysSecondAxis);
            this.data = new Map(initialContent.data);
        }
    }

    get(keyFirstAxis: Key1, keySecondAxis: Key2) {
        const serializedKeyFirstAxis = this.serializeFirstAxis(keyFirstAxis);
        const serializedKeySecondAxis = this.serializeSecondAxis(keySecondAxis);
        return this.data.get(serializedKeyFirstAxis)?.get(serializedKeySecondAxis);
    }

    getRow(key: Key1) {
        const serializedKeyFirstAxis = this.serializeFirstAxis(key);
        const row = this.data.get(serializedKeyFirstAxis);
        if (row === undefined) {
            return [];
        }
        return Array.from(this.keysSecondAxis.keys()).map((key) => row.get(key));
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

    getAsArray() {
        return this.getFirstAxisKeys().map((firstAxisKey) => {
            return this.getSecondAxisKeys().map((secondAxisKey) => {
                return this.get(firstAxisKey, secondAxisKey);
            });
        });
    }

    getContents(): Map2DContents<Key1, Key2, Value> {
        return {
            keysFirstAxis: this.keysFirstAxis,
            keysSecondAxis: this.keysSecondAxis,
            data: this.data,
        };
    }
}

export class SortedMap2d<Key1 extends object | string, Key2 extends object | string, Value> extends Map2dBase<
    Key1,
    Key2,
    Value
> {
    constructor(
        delegate: Map2d<Key1, Key2, Value>,
        sortFirstAxis: (a: Key1, b: Key1) => number,
        sortSecondAxis: (a: Key2, b: Key2) => number,
    ) {
        const contents = delegate.getContents();
        const sortedFirstAxisKeys = new Map(
            [...contents.keysFirstAxis.entries()].sort((a, b) => sortFirstAxis(a[1], b[1])),
        );
        const sortedSecondAxisKeys = new Map(
            [...contents.keysSecondAxis.entries()].sort((a, b) => sortSecondAxis(a[1], b[1])),
        );
        super(
            (key: Key1) => delegate.serializeFirstAxis(key),
            (key: Key2) => delegate.serializeSecondAxis(key),
            {
                keysFirstAxis: sortedFirstAxisKeys,
                keysSecondAxis: sortedSecondAxisKeys,
                data: contents.data,
            },
        );
    }
}

export class Map2dView<Key1 extends object | string, Key2 extends object | string, Value>
    implements Map2d<Key1, Key2, Value>
{
    readonly keysFirstAxis;
    readonly keysSecondAxis;

    readonly baseMap: Map2d<Key1, Key2, Value>;

    constructor(map: Map2d<Key1, Key2, Value>) {
        this.keysFirstAxis = new Map(map.keysFirstAxis);
        this.keysSecondAxis = new Map(map.keysSecondAxis);

        if (map instanceof Map2dView) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- the generics match, we know that.
            this.baseMap = map.baseMap;
        }
        this.baseMap = map;
    }

    serializeFirstAxis(key: Key1) {
        return this.baseMap.serializeFirstAxis(key);
    }

    serializeSecondAxis(key: Key2) {
        return this.baseMap.serializeSecondAxis(key);
    }

    deleteRow(key: Key1) {
        this.keysFirstAxis.delete(this.serializeFirstAxis(key));
    }

    deleteColumn(key: Key2) {
        this.keysSecondAxis.delete(this.serializeSecondAxis(key));
    }

    get(keyFirstAxis: Key1, keySecondAxis: Key2) {
        const firstAxisKey = this.serializeFirstAxis(keyFirstAxis);
        const secondAxisKey = this.serializeSecondAxis(keySecondAxis);

        if (!this.keysFirstAxis.has(firstAxisKey) || !this.keysSecondAxis.has(secondAxisKey)) {
            return undefined;
        }

        return this.baseMap.get(keyFirstAxis, keySecondAxis);
    }

    set() {
        throw new Error('Cannot set value on a Map2dView');
    }

    getFirstAxisKeys() {
        return Array.from(this.keysFirstAxis.values());
    }

    getSecondAxisKeys() {
        return Array.from(this.keysSecondAxis.values());
    }

    getAsArray() {
        return this.getFirstAxisKeys().map((firstAxisKey) => {
            return this.getSecondAxisKeys().map((secondAxisKey) => {
                return this.baseMap.get(firstAxisKey, secondAxisKey);
            });
        });
    }

    getRow(key: Key1) {
        const serializedKeyFirstAxis = this.serializeFirstAxis(key);
        if (!this.keysFirstAxis.has(serializedKeyFirstAxis)) {
            return [];
        }

        return this.getSecondAxisKeys().map((k2) => this.baseMap.get(key, k2));
    }

    getColumn(key: Key2) {
        const serializedKeySecondAxis = this.serializeSecondAxis(key);
        if (!this.keysSecondAxis.has(serializedKeySecondAxis)) {
            return [];
        }

        return this.getFirstAxisKeys().map((k1) => this.baseMap.get(k1, key));
    }

    getContents() {
        return {
            keysFirstAxis: this.keysFirstAxis,
            keysSecondAxis: this.keysSecondAxis,
            data: this.baseMap.getContents().data,
        };
    }
}
