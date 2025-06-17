// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: false },
  ssr: true, // https://nuxt.com/docs/getting-started/deployment#static-hosting
  css: ['~/assets/css/main.css'],

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  colorMode: {
    preference: 'light',
  },

  modules: [
    '@nuxtjs/color-mode',
    '@vite-pwa/nuxt',
  ],

  routeRules: {
    '/': { prerender: true },
  },

  pwa: {
    includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
    manifest: {
      name: 'Lot Calculator',
      short_name: 'Lot',
      theme_color: '#ffffff',
      description: 'Calculate lot, pip and entry value based on account risk ratio and risk reward ratio.',
      icons: [
        {
          src: 'pwa-64x64.png',
          sizes: '64x64',
          type: 'image/png'
        },
        {
          src: 'pwa-192x192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: 'pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any'
        },
        {
          src: 'maskable-icon-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable'
        }
      ]
    },
    workbox: {
      // navigateFallback: '/',
      // Only precache these files - html should be excluded
      globPatterns: ['**/*.{js,css,json,ico,png,jpg,jpeg,svg}'],

      // Don't fallback on document based (e.g. `/some-page`) requests
      // Even though this says `null` by default, I had to set this specifically to `null` to make it work
      navigateFallback: null,
    },
    devOptions: {
      enabled: true,
      type: 'module'
    }
  }
})