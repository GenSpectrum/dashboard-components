import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        lib: {
            formats: ['es'],
            entry: {
                'dashboard-components': 'src/standaloneEntrypoint.ts',
            },
            cssFileName: 'style',
        },
        sourcemap: true,
        minify: true,
        outDir: 'standalone-bundle',
    },
});
