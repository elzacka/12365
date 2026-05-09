import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// Repoet ligger på elzacka.github.io/12365/, så bygget må prefikse alle assets.
const base = '/12365/'

// Innholdspolicy for produksjonsbygget. Dev-serveren slipper denne fordi Vite
// trenger inline-skript for HMR. CSP-en gir defense-in-depth og hjelper
// nettlesere (særlig Samsung Internet og andre Android-lesere) å gjenkjenne
// appen som «trygg å installere» fremfor å vise generiske advarsler.
const productionCsp = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://img.youtube.com https://i.ytimg.com",
  "media-src 'self' blob:",
  "connect-src 'self'",
  "frame-src https://www.youtube-nocookie.com https://player.vimeo.com",
  "font-src 'self'",
  "manifest-src 'self'",
  "worker-src 'self' blob:",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  "object-src 'none'",
  'upgrade-insecure-requests',
].join('; ')

const securityHeadersPlugin = {
  name: 'inject-prod-security-headers',
  apply: 'build' as const,
  transformIndexHtml(html: string) {
    const tags = [
      `<meta http-equiv="Content-Security-Policy" content="${productionCsp}" />`,
      '<meta http-equiv="X-Content-Type-Options" content="nosniff" />',
      '<meta http-equiv="Permissions-Policy" content="camera=(), microphone=(), geolocation=(), interest-cohort=()" />',
    ].join('\n    ')
    return html.replace('<meta charset="UTF-8" />', `<meta charset="UTF-8" />\n    ${tags}`)
  },
}

export default defineConfig({
  base,
  plugins: [
    react(),
    tailwindcss(),
    securityHeadersPlugin,
    VitePWA({
      registerType: 'prompt',
      injectRegister: false,
      includeAssets: [
        'favicon.svg',
        'favicon-32.png',
        'favicon-48.png',
        'logo-header.svg',
        'icons/*.png',
      ],
      manifest: {
        id: base,
        name: '12365 — M365 på 1-2-3',
        short_name: '12365',
        description: 'Steg-for-steg-veiledninger for hverdagsoppgaver i Microsoft 365.',
        lang: 'nb',
        dir: 'ltr',
        start_url: base,
        scope: base,
        display: 'standalone',
        display_override: ['standalone', 'minimal-ui'],
        orientation: 'portrait',
        theme_color: '#00263e',
        background_color: '#f8fafc',
        categories: ['education', 'productivity'],
        prefer_related_applications: false,
        icons: [
          {
            src: `${base}icons/icon-192.png`,
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: `${base}icons/icon-384.png`,
            sizes: '384x384',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: `${base}icons/icon-512.png`,
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: `${base}icons/icon-maskable-512.png`,
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2,json}'],
        // Videoer og videominiatyrer skal ikke precaches — de er for store og hentes ved behov.
        globIgnores: ['videos/**/*'],
        runtimeCaching: [
          {
            urlPattern: /\/videos\/thumbnails\/[^/]+\.(?:png|jpg|jpeg|webp)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'video-thumbnails',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
          {
            urlPattern: /\/videos\/[^/]+\.mp4$/i,
            handler: 'NetworkOnly',
          },
          {
            urlPattern: /^https:\/\/fonts\./,
            handler: 'CacheFirst',
            options: { cacheName: 'fonts-cache' },
          },
        ],
      },
    }),
  ],
})
