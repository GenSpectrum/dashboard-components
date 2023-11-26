import { getMinMaxString } from './utils';
import { expect } from '@open-wc/testing';

describe('getMinMaxString', () => {
    it('should return the min and max string', () => {
        expect(getMinMaxString(['a', 'b', 'c'])).deep.equal(['a', 'c']);
    });
});
