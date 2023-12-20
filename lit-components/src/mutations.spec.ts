import { expect } from '@open-wc/testing';
import { parseMutation } from './mutations';

describe('parseMutation', () => {
    it('should parse substitution', () => {
        expect(parseMutation('A1T')).deep.equal({
            segment: undefined,
            ref: 'A',
            alt: 'T',
            position: 1,
        });
        expect(parseMutation('seg1:A1T')).deep.equal({
            segment: 'seg1',
            ref: 'A',
            alt: 'T',
            position: 1,
        });
    });

    it('should parse deletion', () => {
        expect(parseMutation('A1-')).deep.equal({
            segment: undefined,
            ref: 'A',
            position: 1,
        });
        expect(parseMutation('seg1:A1-')).deep.equal({
            segment: 'seg1',
            ref: 'A',
            position: 1,
        });
    });

    it('should parse insertion', () => {
        expect(parseMutation('ins_1:A')).deep.equal({
            segment: undefined,
            ref: 'A',
            position: 1,
        });
        expect(parseMutation('ins_seg1:1:A')).deep.equal({
            segment: 'seg1',
            ref: 'A',
            position: 1,
        });
    });
});
