import {describe, expect, it} from 'vitest';
import {buildPath, matchPath} from '../../src/navigation.svelte';

describe('matchPath', () => {
    it('reads the params of a pattern', () => {
        expect(matchPath('Detail/:id', '/Detail/42')).toEqual({id: '42'});
    });

    it('reads no params from a literal path', () => {
        expect(matchPath('/', '/')).toEqual({});
    });

    it('ignores an empty segment on either side', () => {
        expect(matchPath('Sheet', '/Sheet/')).toEqual({});
    });

    it('rejects a path with another depth', () => {
        expect(matchPath('Detail/:id', '/Detail/42/extra')).toBeNull();
        expect(matchPath('Detail/:id', '/Detail')).toBeNull();
    });

    it('rejects a path with another literal segment', () => {
        expect(matchPath('Detail/:id', '/Sheet/42')).toBeNull();
    });

    it('decodes a param taken from the URL', () => {
        expect(matchPath('Detail/:id', '/Detail/a%20b')).toEqual({id: 'a b'});
    });
});

describe('buildPath', () => {
    it('fills in the params of a pattern', () => {
        expect(buildPath('Detail/:id', {id: '42'})).toBe('Detail/42');
    });

    it('encodes a param going back into the URL', () => {
        expect(buildPath('Detail/:id', {id: 'a b'})).toBe('Detail/a%20b');
    });

    it('leaves a pattern without params alone', () => {
        expect(buildPath('Sheet', {})).toBe('Sheet');
    });

    it('round-trips through matchPath', () => {
        const params = {id: 'a b'};
        expect(matchPath('Detail/:id', buildPath('Detail/:id', params))).toEqual(params);
    });
});
