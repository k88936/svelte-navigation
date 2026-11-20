import {fileURLToPath} from 'node:url';
import {svelte} from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';
import {defineConfig} from 'vite';

/**
 * The package's own playground: `pnpm dev` then open it in a browser, `pnpm build`
 * for the site GitHub Pages publishes.
 */
export default defineConfig({
    root: fileURLToPath(new URL('.', import.meta.url)),
    plugins: [tailwindcss(), svelte()],
    clearScreen: false,
    build: {target: 'es2022'},
    server: {
        port: 5176,
        strictPort: true,
    },
});
