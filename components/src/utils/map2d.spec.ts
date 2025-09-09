import { describe, expect, it } from 'vitest';

import { Map2dBase, Map2dView } from './map2d';

describe('Map2dBase', () => {
    it('should add a value and return it', () => {
        const map2d = new Map2dBase<string, string, number>(
            (value) => value,
            (value) => value,
        );
        map2d.set('a', 'b', 2);
        expect(map2d.get('a', 'b')).toBe(2);
    });

    it('should update a value', () => {
        const map2d = new Map2dBase<string, string, number>(
            (value) => value,
            (value) => value,
        );
        map2d.set('a', 'b', 2);
        map2d.set('a', 'b', 3);
        expect(map2d.get('a', 'b')).toBe(3);
    });

    it('should return the data as an array', () => {
        const map2d = new Map2dBase<string, string, number>(
            (value) => value,
            (value) => value,
        );
        map2d.set('a', 'b', 1);
        map2d.set('a', 'd', 2);
        map2d.set('c', 'b', 3);
        map2d.set('c', 'd', 4);

        expect(map2d.getAsArray()).toEqual([
            [1, 2],
            [3, 4],
        ]);
    });

    it('should fill empty values with the given value', () => {
        const map2d = new Map2dBase<string, string, number>(
            (value) => value,
            (value) => value,
        );
        map2d.set('a', 'b', 2);
        map2d.set('c', 'd', 4);
        expect(map2d.getAsArray()).toEqual([
            [2, undefined],
            [undefined, 4],
        ]);
    });

    it('should return the keys from the first axis', () => {
        const map2d = new Map2dBase<string, string, number>(
            (value) => value,
            (value) => value,
        );
        map2d.set('a', 'b', 2);
        map2d.set('c', 'd', 4);

        expect(map2d.getFirstAxisKeys()).toEqual(['a', 'c']);
    });

    it('should return the keys from the second axis', () => {
        const map2d = new Map2dBase<string, string, number>(
            (value) => value,
            (value) => value,
        );
        map2d.set('a', 'b', 2);
        map2d.set('c', 'd', 4);

        expect(map2d.getSecondAxisKeys()).toEqual(['b', 'd']);
    });

    it('should work with objects as keys', () => {
        const map2d = new Map2dBase<{ a: string }, { b: string }, number>(
            ({ a }) => a,
            ({ b }) => b,
        );
        map2d.set({ a: 'a' }, { b: 'b' }, 2);
        map2d.set({ a: 'second' }, { b: 'second' }, 3);

        expect(map2d.get({ a: 'a' }, { b: 'b' })).toBe(2);
        expect(map2d.get({ a: 'second' }, { b: 'second' })).toBe(3);
    });

    it('should update a value with objects as keys', () => {
        const map2d = new Map2dBase<{ a: string }, { b: string }, number>(
            ({ a }) => a,
            ({ b }) => b,
        );
        map2d.set({ a: 'a' }, { b: 'b' }, 2);
        map2d.set({ a: 'a' }, { b: 'b' }, 3);
        expect(map2d.get({ a: 'a' }, { b: 'b' })).toBe(3);
    });

    it('should return a row by key', () => {
        const map2d = new Map2dBase<string, string, number>(
            (value) => value,
            (value) => value,
        );
        map2d.set('a', 'b', 2);
        map2d.set('c', 'd', 4);

        expect(map2d.getRow('a')).toEqual([2, undefined]);
        expect(map2d.getRow('c')).toEqual([undefined, 4]);
    });

    it('should return an empty array when the row does not exist', () => {
        const map2d = new Map2dBase<string, string, number>(
            (value) => value,
            (value) => value,
        );
        map2d.set('a', 'b', 2);

        expect(map2d.getRow('c')).toEqual([]);
    });

    it('should return content as object', () => {
        const map2d = new Map2dBase<string, string, number>(
            (value) => value,
            (value) => value,
        );
        map2d.set('a', 'b', 2);
        map2d.set('c', 'd', 4);

        const content = map2d.getContents();
        expect(Array.from(content.keysFirstAxis.values())).to.deep.equal(['a', 'c']);
        expect(Array.from(content.keysSecondAxis.values())).to.deep.equal(['b', 'd']);
        expect(content.data.get('a')?.get('b')).toBe(2);
    });

    it('should use initial data', () => {
        const map2d = new Map2dBase<string, string, number>(
            (value) => value,
            (value) => value,
        );
        map2d.set('a', 'b', 2);
        map2d.set('c', 'd', 4);

        const content = map2d.getContents();

        const mapWithInitialData = new Map2dBase<string, string, number>(
            (value) => value,
            (value) => value,
            content,
        );

        expect(mapWithInitialData.get('a', 'b')).toBe(2);
        expect(mapWithInitialData.get('c', 'd')).toBe(4);
    });
});

describe('Map2dView', () => {
    it('should show the same data as the container', () => {
        const container = createBaseContainer();

        const view = new Map2dView<string, string, number>(container);

        expect(view.get('a', 'b')).toBe(container.get('a', 'b'));
        expect(view.get('a', 'd')).toBe(container.get('a', 'd'));
        expect(view.get('c', 'b')).toBe(container.get('c', 'b'));
        expect(view.get('c', 'd')).toBe(container.get('c', 'd'));
    });

    it('should remove a row', () => {
        const container = createBaseContainer();

        const view = new Map2dView<string, string, number>(container);

        view.deleteRow('a');

        expect(view.get('a', 'b')).toBeUndefined();
        expect(view.get('a', 'd')).toBeUndefined();
        expect(view.get('c', 'b')).toBe(container.get('c', 'b'));
        expect(view.get('c', 'd')).toBe(container.get('c', 'd'));
        expect(view.getFirstAxisKeys().length).toBe(1);
        expect(view.getFirstAxisKeys()[0]).toBe('c');
        expect(view.getSecondAxisKeys().length).toBe(2);
    });

    it('should return the view of the data as an array', () => {
        const container = createBaseContainer();
        const view = new Map2dView<string, string, number>(container);
        view.deleteRow('c');

        expect(view.getAsArray()).toEqual([[1, undefined]]);

        const view2 = new Map2dView<string, string, number>(container);
        view2.deleteColumn('b');

        expect(view2.getAsArray()).toEqual([[undefined], [4]]);
    });

    it('should throw an error when trying to set a value', () => {
        const container = createBaseContainer();
        const view = new Map2dView<string, string, number>(container);
        expect(() => view.set()).toThrowError();
    });

    it('should return a row by key', () => {
        const container = createBaseContainer();
        const view = new Map2dView<string, string, number>(container);

        expect(view.getRow('a')).toEqual([1, undefined]);
    });

    it('should return a column by key', () => {
        const container = createBaseContainer();
        const view = new Map2dView<string, string, number>(container);

        expect(view.getColumn('b')).toEqual([1, 3]);
        expect(view.getColumn('d')).toEqual([undefined, 4]);
    });

    it('should return an empty array when the row does not exist', () => {
        const container = createBaseContainer();
        const view = new Map2dView<string, string, number>(container);
        view.deleteRow('c');

        expect(view.getRow('c')).toEqual([]);
        expect(view.getColumn('b')).toEqual([1]);
    });

    it('should return an empty array when the column does not exist', () => {
        const container = createBaseContainer();
        const view = new Map2dView<string, string, number>(container);
        view.deleteColumn('b');

        expect(view.getColumn('b')).toEqual([]);
        expect(view.getRow('a')).toEqual([undefined]);
        expect(view.getRow('c')).toEqual([4]);
    });

    function createBaseContainer() {
        const container = new Map2dBase<string, string, number>(
            (value) => value,
            (value) => value,
        );
        container.set('a', 'b', 1);
        container.set('c', 'b', 3);
        container.set('c', 'd', 4);

        // |   | b | d |
        // |---|---|---|
        // | a | 1 |   |
        // | c | 3 | 4 |

        return container;
    }
});
