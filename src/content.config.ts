import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';

const postCollections = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    pubDate: z.coerce.date(),
    description: z.string(),
    tags: z.array(z.string()),
    slug: z.string().optional(),
  }),
});

export const collections = { posts: postCollections };
