import {expect, test} from '@playwright/test';
import {back, entries, openSheet, readState, settle, takeSteps} from './helpers';

test.beforeEach(async ({page}) => {
    await page.goto('/');
    await expect(page.getByRole('button', {name: 'increment'})).toBeVisible();
});

test('pushes one entry per screen and keeps it on the way back', async ({page}) => {
    const start = await entries(page);

    await page.getByRole('button', {name: 'open detail'}).click();
    await expect(page).toHaveURL('/Detail/42');
    const pushed = await entries(page);
    expect(pushed.length).toBe(start.length + 1);
    expect(pushed.index).toBe(start.index + 1);

    await back(page);
    await expect(page.locator('#count')).toBeVisible();
    const popped = await entries(page);
    expect(popped.length).toBe(pushed.length);
    expect(popped.index).toBe(start.index);
});

test('opens the sheet as one more entry of the screen under it', async ({page}) => {
    const start = await entries(page);

    await openSheet(page);

    const opened = await entries(page);
    expect(opened.length).toBe(start.length + 1);
    expect(opened.index).toBe(start.index + 1);
    expect((await readState(page)).path).toBe('/Sheet');
    // Nothing is holding the key yet, so no second entry is claimed for it.
    expect((await readState(page)).mode).toBeNull();

    await takeSteps(page, 1);
    const holding = await entries(page);
    expect(holding.length).toBe(opened.length + 1);
    expect((await readState(page)).mode).not.toBeNull();
});

test('takes one press per step before it closes the sheet', async ({page}) => {
    await openSheet(page);
    await takeSteps(page, 3);
    const opened = await entries(page);
    expect((await readState(page)).steps).toBe('step 3');

    // A press the mode takes is not a navigation: the browser stays on the same entry.
    for (const remaining of ['step 2', 'step 1']) {
        await back(page);
        await expect(page.locator('#sheet-steps')).toHaveText(remaining);
        await expect.poll(async () => (await entries(page)).index).toBe(opened.index);
        expect((await entries(page)).length).toBe(opened.length);
        expect((await readState(page)).path).toBe('/Sheet');
    }

    // The press that takes the last step is the one that leaves the entry, so the
    // mode is released there and the sheet is still open underneath.
    await back(page);
    await expect(page.locator('#sheet-steps')).toHaveText('step 0');
    await expect.poll(async () => (await entries(page)).index).toBe(opened.index - 1);
    expect((await entries(page)).length).toBe(opened.length);
    expect((await readState(page)).path).toBe('/Sheet');

    await back(page);
    await expect(page.locator('#sheet-steps')).toBeHidden();
    await expect(page).toHaveURL('/');
    expect((await readState(page)).depth).toBe(1);
});

test('takes one press per step for a back the page makes itself', async ({page}) => {
    await openSheet(page);
    await takeSteps(page, 2);

    await back(page, 'page');
    await expect(page.locator('#sheet-steps')).toHaveText('step 1');
    await back(page, 'page');
    await expect(page.locator('#sheet-steps')).toHaveText('step 0');

    await back(page, 'page');
    await expect(page.locator('#sheet-steps')).toBeHidden();
    await expect(page).toHaveURL('/');
});

test('keeps the sheet open when presses arrive before the screen redraws', async ({page}) => {
    await openSheet(page);
    await takeSteps(page, 3);
    const opened = await entries(page);

    // A held key repeats faster than the screen follows it, so the presses are the
    // only thing telling the app how far the user wanted to go.
    for (let press = 0; press < 3; press++) {
        await page.evaluate(() => history.back());
        await page.waitForTimeout(30);
    }
    await settle(page);

    const settled = await readState(page);
    expect(settled.path).toBe('/Sheet');
    expect(settled.sheet).toBe(true);
    expect(settled.steps).toBe('step 0');
    expect((await entries(page)).length).toBe(opened.length);
});

test('closes a dialog without leaving the screen it covers', async ({page}) => {
    const start = await entries(page);

    await page.getByRole('button', {name: 'open dialog'}).click();
    await expect(page.locator('dialog[open]')).toBeVisible();
    expect((await entries(page)).length).toBe(start.length + 1);

    await back(page);
    await expect(page.locator('dialog[open]')).toHaveCount(0);
    await expect(page).toHaveURL('/');
    await expect(page.getByRole('button', {name: 'increment'})).toBeVisible();
});

test('restores the screen a deep link names', async ({page}) => {
    await page.goto('/Detail/42');

    await expect(page.locator('#detail-id')).toHaveText('Item 42');
    const state = await readState(page);
    expect(state.depth).toBe(2);
    expect(state.path).toBe('/Detail/42');
    // The stack is rebuilt from the URL, so the screen it names is the entry the tab
    // opened with, not one pushed on top of it.
    const restored = await entries(page);
    expect(restored.index).toBe(restored.length - 1);
});

test('switches tabs without growing the history', async ({page}) => {
    const start = await entries(page);

    await page.getByRole('button', {name: 'Settings', exact: true}).click();
    await expect(page).toHaveURL('/Settings');
    await page.getByRole('button', {name: 'Home', exact: true}).click();
    await expect(page).toHaveURL('/');

    const after = await entries(page);
    expect(after.length).toBe(start.length);
    expect(after.index).toBe(start.index);
});
