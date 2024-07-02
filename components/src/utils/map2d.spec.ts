import { describe, expect, it } from 'vitest';

import { Map2d } from './Map2d';

describe('Map2d', () => {
    it('should add a value and return it', () => {
        const map2d = new Map2d<string, string, number>();
        map2d.set('a', 'b', 2);
        expect(map2d.get('a', 'b')).toBe(2);
    });

    it('should update a value', () => {
        const map2d = new Map2d<string, string, number>();
        map2d.set('a', 'b', 2);
        map2d.set('a', 'b', 3);
        expect(map2d.get('a', 'b')).toBe(3);
    });

    it('should return the data as an array', () => {
        const map2d = new Map2d<string, string, number>();
        map2d.set('a', 'b', 1);
        map2d.set('a', 'd', 2);
        map2d.set('c', 'b', 3);
        map2d.set('c', 'd', 4);

        expect(map2d.getAsArray(0)).toEqual([
            [1, 2],
            [3, 4],
        ]);
    });

    it('should fill empty values with the given value', () => {
        const map2d = new Map2d<string, string, number>();
        map2d.set('a', 'b', 2);
        map2d.set('c', 'd', 4);
        expect(map2d.getAsArray(0)).toEqual([
            [2, 0],
            [0, 4],
        ]);
    });

    it('should return the keys from the first axis', () => {
        const map2d = new Map2d<string, string, number>();
        map2d.set('a', 'b', 2);
        map2d.set('c', 'd', 4);

        expect(map2d.getFirstAxisKeys()).toEqual(['a', 'c']);
    });

    it('should return the keys from the second axis', () => {
        const map2d = new Map2d<string, string, number>();
        map2d.set('a', 'b', 2);
        map2d.set('c', 'd', 4);

        expect(map2d.getSecondAxisKeys()).toEqual(['b', 'd']);
    });

    it('should work with objects as keys', () => {
        const map2d = new Map2d<{ a: string }, { b: string }, number>();
        map2d.set({ a: 'a' }, { b: 'b' }, 2);
        map2d.set({ a: 'second' }, { b: 'second' }, 3);

        expect(map2d.get({ a: 'a' }, { b: 'b' })).toBe(2);
        expect(map2d.get({ a: 'second' }, { b: 'second' })).toBe(3);
    });

    it('should update a value with objects as keys', () => {
        const map2d = new Map2d<{ a: string }, { b: string }, number>();
        map2d.set({ a: 'a' }, { b: 'b' }, 2);
        map2d.set({ a: 'a' }, { b: 'b' }, 3);
        expect(map2d.get({ a: 'a' }, { b: 'b' })).toBe(3);
    });

    it('should create a deep copy of the map', () => {
        const map2d = new Map2d<string, string, number>();
        map2d.set('a', 'b', 2);
        expect(map2d.get('a', 'b')).toBe(2);

        const copy = map2d.copy();
        expect(copy.get('a', 'b')).toBe(2);

        map2d.deleteRow('a');
        expect(map2d.get('a', 'b')).toBe(undefined);
    });

    it('should return a row by key', () => {
        const map2d = new Map2d<string, string, number>();
        map2d.set('a', 'b', 2);
        map2d.set('c', 'd', 4);

        expect(map2d.getRow('a', 0)).toEqual([2, 0]);
        expect(map2d.getRow('c', 0)).toEqual([0, 4]);
    });
});
