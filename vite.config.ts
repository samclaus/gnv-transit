import { svelte } from '@sveltejs/vite-plugin-svelte';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        svelte(),
        visualizer({
            template: 'treemap', // or sunburst
            open: true,
            gzipSize: true,
            brotliSize: true,
            filename: 'analyse.html', // will be saved in project's root
        }),
        // VitePWA({
        //     injectRegister: 'inline',
        //     registerType: 'autoUpdate',
        //     manifest: {
        //         background_color: '#fcf8f4',
        //         categories: ['transit', 'maps'],
        //         description: 'GNV Transit is an app for tracking RTS bus times in Gainesville, FL.',
        //         display: 'fullscreen',
        //         display_override: ['fullscreen', 'standalone', 'browser'],
        //         icons: [{
        //             src: '/logo.svg',
        //             sizes: 'any',
        //         }],
        //         name: 'GNV Transit',
        //         orientation: 'portrait-primary',
        //         short_name: 'Transit',
        //         theme_color: '#fff',
        //     },
        // }),
    ],
    optimizeDeps: {
        exclude: ['leaflet-lite'],
    },
});
