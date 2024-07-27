const { addIconSelectors } = require('@iconify/tailwind');

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['src/**/*.{ts,tsx,html}', 'index.html'],
    theme: {
        extend: {},
    },
    plugins: [require('daisyui'), addIconSelectors(['mdi', 'mdi-light'])],
    daisyui: {
        themes: ['light'],
    },
};
