import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
    vite: {
        plugins: [tailwindcss()],
        build: {
            cssMinify: 'lightningcss'
        }
    },
    integrations: [react()],
    adapter: netlify(),
    site: process.env.SITE || undefined,
    output: 'server',
    compressHTML: true,
    build: {
        inlineStylesheets: 'auto'
    }
});
