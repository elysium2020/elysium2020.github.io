import { defineCollection, z } from 'astro:content';

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
