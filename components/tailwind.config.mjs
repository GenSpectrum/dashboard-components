import { addIconSelectors } from '@iconify/tailwind';
import containerQueries from '@tailwindcss/container-queries';
import daisyui from 'daisyui';

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['src/**/*.{ts,tsx,html}', 'index.html'],
    theme: {
        extend: {},
    },
    plugins: [daisyui, containerQueries, addIconSelectors(['mdi', 'mdi-light'])],
    daisyui: {
        themes: ['light'],
    },
};
