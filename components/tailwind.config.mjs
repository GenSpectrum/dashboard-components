import { addIconSelectors } from '@iconify/tailwind';
import containerQueries from '@tailwindcss/container-queries';
import daisyui from 'daisyui';

/** @type {import('tailwindcss').Config} */
const tailwindConfig = {
    content: ['src/**/*.{ts,tsx,html}', 'index.html'],
    theme: {
        extend: {
            containers: {
                '2xs': '18rem',
                '3xs': '16rem',
                '4xs': '14rem',
            },
        },
    },
    plugins: [daisyui, containerQueries, addIconSelectors(['mdi', 'mdi-light'])],
    daisyui: {
        themes: ['light'],
    },
};
export default tailwindConfig;
