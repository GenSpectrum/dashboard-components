import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        lib: {
            formats: ['es'],
            entry: {
                'dashboard-components': 'dist/dashboard-components.js',
            },
        },
        sourcemap: true,
        minify: true,
        outDir: 'standalone-bundle',
    },
});
