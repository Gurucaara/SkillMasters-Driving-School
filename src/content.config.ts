// Content collections. Blog articles are Markdown files in src/content/blog/; the file name is
// the URL slug (/blog/<file-name>).
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      /** One-line summary for cards and the meta description. */
      description: z.string(),
      /** Small gold label on cards, e.g. GUIDE, CHECKLIST. */
      kicker: z.string(),
      pubDate: z.coerce.date(),
      /** Lower numbers show first on /blog. */
      order: z.number().default(100),
      /** Optional cover photo (src/assets/...). Without one, a designed cover is used. */
      cover: image().optional(),
      coverAlt: z.string().optional(),
      /** Not yet reviewed by Rahul: shows a DRAFT notice and is hidden from search engines. */
      sample: z.boolean().default(false),
    }),
});

// Legal policies shown as tabs on /legal. The file name is the tab's anchor (#privacy, …).
const legal = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/legal' }),
  schema: z.object({
    title: z.string(),
    /** Short label on the tab button. */
    tab: z.string(),
    order: z.number(),
    updated: z.coerce.date(),
  }),
});

export const collections = { blog, legal };
