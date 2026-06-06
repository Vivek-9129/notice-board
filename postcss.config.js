// postcss.config.js
// PostCSS runs Tailwind and Autoprefixer during the build.
// Autoprefixer adds vendor prefixes automatically (e.g. -webkit-).

module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
