/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './packages/**/index.html',
    './packages/**/*.{vue,js,ts,js,jsx,tsx}'
  ],
  theme: {
    extend: {},
  },
  plugins: [],

  corePlugins: {
    preflight: false //禁用 Tailwind 的全局基本样式，会和 ant 样式冲突
  }
};
