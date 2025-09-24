import { getCollection } from 'astro:content';

const posts = await getCollection('posts');

export const allPosts = posts;

export const sortedPosts = [...posts].toSorted(
  (a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime(),
);

export const allTags = [
  ...new Set(posts.flatMap((post) => post.data.tags ?? [])),
].toSorted();
