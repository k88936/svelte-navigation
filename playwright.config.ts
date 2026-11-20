import {defineConfig} from '@playwright/test';

/**
 * The playground is the only app these screens can be driven in, so the tests start
 * it themselves on a port of its own: the dev server a developer runs stays alone.
 */
export default defineConfig({
    testDir: 'test/e2e',
    fullyParallel: false,
    workers: 1,
    forbidOnly: Boolean(process.env.TEAMCITY_VERSION),
    retries: process.env.TEAMCITY_VERSION ? 1 : 0,
    reporter: 'list',
    use: {
        baseURL: 'http://localhost:5177',
    },
    webServer: {
        command: 'pnpm exec vite --config playground/vite.config.ts --port 5177 --strictPort',
        url: 'http://localhost:5177',
        reuseExistingServer: false,
    },
});
