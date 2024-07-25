import { defineConfig } from 'vite';
import dtsPlugin from 'vite-plugin-dts';

export default defineConfig({
    build: {
        lib: {
            formats: ['es'],
            entry: {
                'dashboard-components': 'src/index.ts',
            },
        },
        sourcemap: true,
        minify: false,
    },
    plugins: [dtsPlugin({ rollupTypes: true })],
});
