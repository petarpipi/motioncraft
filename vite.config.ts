import { defineConfig } from 'vitest/config'
import { loadEnv } from 'vite'
import type { Plugin } from 'vite'
import react from '@vitejs/plugin-react'

const routes = ['/', '/experiences', '/studio']

/**
 * Social and crawler metadata. Set SITE_URL (e.g. https://motioncraft.example)
 * at build time to get absolute Open Graph URLs, a canonical link and a
 * sitemap; without it the tags stay root-relative and no sitemap is emitted.
 */
function siteMetadata(siteUrl: string): Plugin {
  const base = siteUrl.replace(/\/$/, '')
  return {
    name: 'motioncraft-site-metadata',
    transformIndexHtml: (html) => html.replaceAll('%SITE_URL%', base),
    generateBundle() {
      const robots = ['User-agent: *', 'Allow: /']
      if (base) {
        robots.push(`Sitemap: ${base}/sitemap.xml`)
        this.emitFile({
          type: 'asset',
          fileName: 'sitemap.xml',
          source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${routes
            .map((route) => `  <url><loc>${base}${route}</loc></url>`)
            .join('\n')}\n</urlset>\n`,
        })
      }
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: `${robots.join('\n')}\n` })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), siteMetadata(env.SITE_URL ?? '')],
    build: {
      // Three.js is a single ~540 kB module loaded lazily by the sculpture; the
      // advisory is expected for it, so the limit is set just above that chunk.
      chunkSizeWarningLimit: 560,
      rolldownOptions: {
        output: {
          codeSplitting: {
            groups: [
              { name: 'react', test: /node_modules[\\/](react|react-dom|scheduler|react-router)/ },
              { name: 'gsap', test: /node_modules[\\/]gsap/ },
            ],
          },
        },
      },
    },
    server: {
      watch: {
        ignored: ['**/docs/**', '**/test-results/**', '**/playwright-report/**', '**/dist/**'],
      },
    },
    test: {
      environment: 'jsdom',
      setupFiles: './src/test-setup.ts',
      include: ['src/**/*.test.{ts,tsx}'],
      restoreMocks: true,
      maxWorkers: 1,
      pool: 'vmThreads',
    },
  }
})
