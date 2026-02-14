// postcss.config.js

const config = {
  plugins: {
    // 💥 CRITICAL FIX: Explicitly load the minimal config file
    '@tailwindcss/postcss': {
        config: './tailwind.config.js',
    },
    'autoprefixer': {},
  },
};

export default config;