import {beforeEach, describe, expect, it} from 'vitest';
import {NavigationRoot, StackController} from '../../src/navigation.svelte';
import type {StackOptions} from '../../src/types';

function stack(root: NavigationRoot, tab = 'Home', initialRouteName = 'Home'): StackController {
    const controller = new StackController({root, tab, initialRouteName, screenOptions: () => ({})});
    controller.mount();
    return controller;
}

/** Every test starts from a fresh tree; `history` is shared by the whole file. */
let root: NavigationRoot;

beforeEach(() => {
    root = new NavigationRoot();
});

describe('the stack of one tab', () => {
    it('refuses to go back past its root screen', () => {
        const controller = stack(root);
        const navigation = controller.navigation(controller.entries[0]);
        const length = history.length;

        expect(navigation.canGoBack()).toBe(false);
        navigation.goBack();

        expect(controller.entries.map((entry) => entry.name)).toEqual(['Home']);
        expect(history.length).toBe(length);
    });

    it('pushes one entry per screen, each with its own key', () => {
        const controller = stack(root);
        const length = history.length;

        controller.push('Detail', {id: '1'});
        controller.push('Detail', {id: '2'});

        expect(controller.entries.map((entry) => entry.name)).toEqual(['Home', 'Detail', 'Detail']);
        expect(controller.entries.map((entry) => entry.params.id)).toEqual([undefined, '1', '2']);
        expect(new Set(controller.entries.map((entry) => entry.key)).size).toBe(3);
        expect(history.length).toBe(length + 2);
    });

    it('pops to the root in one step', () => {
        const controller = stack(root);
        controller.push('Detail', {id: '1'});
        controller.push('Sheet');
        const length = history.length;

        controller.popToTop();

        expect(controller.entries.map((entry) => entry.name)).toEqual(['Home']);
        expect(controller.navigation(controller.entries[0]).canGoBack()).toBe(false);
        // The entries above the root are gone, so the history entry is replaced, not grown.
        expect(history.length).toBe(length);
    });

    it('resets to a single screen with the params given', () => {
        const controller = stack(root);
        controller.push('Sheet');
        const length = history.length;

        controller.reset('Detail', {id: '7'});

        expect(controller.entries).toHaveLength(1);
        expect(controller.entries[0].name).toBe('Detail');
        expect(controller.entries[0].params).toEqual({id: '7'});
        expect(controller.entries[0].historic).toBe(false);
        expect(history.length).toBe(length);
    });

    it('narrows the stack to the depth of a history entry it is restoring', () => {
        const controller = stack(root);
        controller.push('Detail', {id: '1'});
        controller.push('Sheet');

        controller.restoreTo({tab: 'Home', depth: 2, name: 'Detail', params: {id: '1'}});

        expect(controller.entries.map((entry) => entry.name)).toEqual(['Home', 'Detail']);
    });

    it('keeps the stack in place when a screen only changes its own options', () => {
        const controller = stack(root);
        controller.push('Detail', {id: '1'});
        const entry = controller.entries[1];
        const length = history.length;

        controller.navigation(entry).setOptions({title: 'changed'});

        expect(controller.entries).toHaveLength(2);
        expect(controller.entries[1]).toBe(entry);
        expect(history.length).toBe(length);
        expect(controller.optionsFor(entry).title as StackOptions['title']).toBe('changed');
    });
});

describe('the tab that is up', () => {
    it('focuses the top of the stack that is showing and blurs the rest', () => {
        const home = stack(root);
        const settings = stack(root, 'Settings', 'Settings');
        const homeTop = home.entries[0];
        const settingsTop = settings.entries[0];

        expect(homeTop.focused).toBe(true);
        expect(settingsTop.focused).toBe(false);

        root.activate('Settings');

        expect(homeTop.focused).toBe(false);
        expect(settingsTop.focused).toBe(true);

        root.activate('Home');

        expect(homeTop.focused).toBe(true);
        expect(settingsTop.focused).toBe(false);
    });

    it('reports a push to the screen underneath as a blur', () => {
        const controller = stack(root);
        const home = controller.entries[0];
        const events: string[] = [];
        controller.navigation(home).addListener('blur', () => events.push('blur'));
        controller.navigation(home).addListener('focus', () => events.push('focus'));

        controller.push('Detail', {id: '1'});
        expect(events).toEqual(['blur']);

        controller.pop();
        expect(events).toEqual(['blur', 'focus']);
    });
});
