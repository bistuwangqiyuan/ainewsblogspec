import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
    vite: {
        plugins: [tailwindcss()],
        build: {
            cssMinify: 'lightningcss',
            minify: 'esbuild',
            rollupOptions: {
                output: {
                    manualChunks: undefined,
                }
            }
        }
    },
    integrations: [react()],
    adapter: netlify(),
    site: process.env.SITE || 'https://ainewsblogspec.netlify.app',
    output: 'server',
    compressHTML: true,
    build: {
        inlineStylesheets: 'auto',
        assets: '_astro'
    },
    // SEO optimizations
    trailingSlash: 'never',
    scopedStyleStrategy: 'attribute'
});
