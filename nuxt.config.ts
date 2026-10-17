import tailwindcss from '@tailwindcss/vite'

// §1.2 fonts. Thai-capable fonts load in every language, since data can be Thai in EN mode.
const fonts =
  'https://fonts.googleapis.com/css2?family=Mitr:wght@400;500;600;700&family=Anuphan:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap'

const pollForFileChanges = process.env.WATCH_POLLING === 'true'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  // §12.1: Back Office is a client-only SPA.
  ssr: false,
  devtools: { enabled: false },
  modules: ['@nuxtjs/i18n', '@pinia/nuxt'],
  css: ['~/assets/css/main.css'],
  vite: {
    plugins: [tailwindcss()],
    server: { watch: { usePolling: pollForFileChanges } },
  },
  watchers: { chokidar: { usePolling: pollForFileChanges } },
  typescript: { strict: true },
  runtimeConfig: {
    public: {
      // mock | http — see app/lib/api (http is a stub: this demo has no real api)
      dataSource: 'mock',
      apiBase: 'http://localhost:8787',
      mockError: false,
      appVersion: 'v0.1.0',
    },
  },
  app: {
    head: {
      title: 'ดอยดาว คาเฟ่ · Back Office',
      meta: [{ name: 'robots', content: 'noindex, nofollow' }],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: fonts },
      ],
    },
  },
  // The operator's language comes from their preferences, so no URL prefix and no browser detection.
  i18n: {
    strategy: 'no_prefix',
    defaultLocale: 'th',
    detectBrowserLanguage: false,
    locales: [
      { code: 'th', language: 'th-TH', name: 'ไทย', file: 'th.json' },
      { code: 'en', language: 'en-US', name: 'English', file: 'en.json' },
    ],
  },
})
