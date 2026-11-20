import {expect, test} from '@playwright/test';
import {back, openSheet} from './helpers';

test.beforeEach(async ({page}) => {
    await page.goto('/');
    await expect(page.getByRole('button', {name: 'increment'})).toBeVisible();
});

test('paints the sheet with its own background', async ({page}) => {
    await openSheet(page);

    // The nearest ancestor that paints anything: a transparent one would let the
    // screen under the sheet show through it.
    const painted = await page.evaluate(() => {
        let node = [...document.querySelectorAll('p')].find((element) =>
            element.textContent?.startsWith('A modal presentation'),
        ) as HTMLElement | null;
        while (node && getComputedStyle(node).backgroundColor === 'rgba(0, 0, 0, 0)') {
            node = node.parentElement;
        }
        return node ? getComputedStyle(node).backgroundColor : null;
    });

    expect(painted).toBe('rgb(255, 255, 255)');
});

test('keeps what the screen under the sheet holds', async ({page}) => {
    await page.getByRole('button', {name: 'increment'}).click();
    await page.getByRole('button', {name: 'increment'}).click();
    await expect(page.locator('#count')).toHaveText('2');

    await openSheet(page);
    await page.getByRole('button', {name: 'take a step'}).click();
    await back(page);
    await expect(page.locator('#sheet-steps')).toHaveText('step 0');
    await back(page);
    await expect(page.locator('#sheet-steps')).toBeHidden();

    await expect(page.locator('#count')).toHaveText('2');
});
