import {svelte} from '@sveltejs/vite-plugin-svelte';
import {defineConfig} from 'vitest/config';

/**
 * The core is runes in `.svelte.ts`, so it has to go through the Svelte compiler,
 * and it reads `location` and `history`, so the tests need a document.
 */
export default defineConfig({
    plugins: [svelte()],
    test: {
        environment: 'jsdom',
        include: ['test/unit/**/*.test.ts'],
    },
});
