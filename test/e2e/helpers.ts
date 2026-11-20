import type {Page} from '@playwright/test';

/** What the screen shows and what the browser remembers about how it got there. */
export type State = {
    path: string;
    /** The mode the current history entry belongs to, if any. */
    mode: number | null;
    /** How many stack screens the current entry stands for. */
    depth: number | null;
    length: number;
    steps: string | null;
    sheet: boolean;
    dialog: boolean;
};

export async function readState(page: Page): Promise<State> {
    return page.evaluate(() => {
        const state = history.state as {mode?: number; depth?: number} | null;
        return {
            path: location.pathname,
            mode: state?.mode ?? null,
            depth: state?.depth ?? null,
            length: history.length,
            steps: document.querySelector('#sheet-steps')?.textContent ?? null,
            sheet: document.querySelector('#sheet-steps') !== null,
            dialog: document.querySelector('dialog[open]') !== null,
        };
    });
}

/**
 * The browser's own view of the session history: the entry the user is on and how
 * many there are. `history.length` alone cannot tell whether an entry was replaced
 * or added, so both numbers are read the way a back button sees them.
 */
export async function entries(page: Page): Promise<{index: number; length: number}> {
    const cdp = await page.context().newCDPSession(page);
    const history = await cdp.send('Page.getNavigationHistory');
    await cdp.detach();
    return {index: history.currentIndex, length: history.entries.length};
}

/** The two ways a press reaches the page: the browser navigating, or the page itself. */
export type Press = 'browser' | 'page';

/**
 * A press may be answered by a traversal the handler starts itself, so the entry the
 * browser ends on is only known once two samples agree.
 */
export async function settle(page: Page): Promise<void> {
    let last = await entries(page);
    for (let sample = 0; sample < 10; sample++) {
        await page.waitForTimeout(20);
        const current = await entries(page);
        if (current.index === last.index && current.length === last.length) return;
        last = current;
    }
}

export async function back(page: Page, press: Press = 'browser'): Promise<void> {
    if (press === 'browser') {
        await page.goBack();
    } else {
        await page.evaluate(() => history.back());
    }
    // The popstate handler moves the screen straight away; the DOM follows on the
    // next frame, so the assertions after this see what the press left.
    await page.evaluate(() => new Promise((done) => requestAnimationFrame(() => done(null))));
    await settle(page);
}

export async function openSheet(page: Page): Promise<void> {
    await page.getByRole('button', {name: 'open sheet'}).click();
    await page.locator('#sheet-steps').waitFor({state: 'visible'});
}

export async function takeSteps(page: Page, count: number): Promise<void> {
    for (let taken = 0; taken < count; taken++) {
        await page.getByRole('button', {name: 'take a step'}).click();
    }
    await page.locator('#sheet-steps').filter({hasText: `step ${count}`}).waitFor({state: 'visible'});
}
