/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['src/**/*.{ts,tsx,html}', 'index.html'],
    theme: {
        extend: {},
    },
    plugins: [require('daisyui')],
    daisyui: {
        themes: ['light'],
    },
};
