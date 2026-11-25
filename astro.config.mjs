// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import cloudflare from '@astrojs/cloudflare';
import { readdirSync, readFileSync } from 'node:fs';

// Blog articles still marked `sample: true` are noindex, so keep them out of the sitemap too.
const sampleBlogPaths = readdirSync('./src/content/blog')
  .filter((f) => f.endsWith('.md'))
  .filter((f) => /^sample:\s*true\s*$/m.test(readFileSync(`./src/content/blog/${f}`, 'utf8')))
  .map((f) => `/blog/${f.replace(/\.md$/, '')}/`);

// https://astro.build/config
export default defineConfig({
  site: 'https://skillmastersdrivingschool.ca',
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [
    sitemap({
      filter: (page) => !sampleBlogPaths.some((path) => new URL(page).pathname === path),
    }),
  ],
  adapter: cloudflare(),
});
