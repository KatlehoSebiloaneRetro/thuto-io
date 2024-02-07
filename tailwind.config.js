module.exports = {
    content: [
      "./src/**/*.{html,ts}",
    ],
    theme: {
      extend: {},
    },
    plugins: [],

    content: [
        './node_modules/@heathmont/moon-core-tw/**/*.{js,ts,jsx,tsx}',
      ],
      presets: [
        require('@heathmont/moon-core-tw/lib/private/presets/ds-moon-preset'),
      ],
  }