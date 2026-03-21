import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'posts'>;

export const allPosts = await getCollection('posts');

export const sortedPosts = [...allPosts].toSorted(
  (a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime(),
);

export const allTags = [
  ...new Set(allPosts.flatMap((post) => post.data.tags)),
].toSorted();
