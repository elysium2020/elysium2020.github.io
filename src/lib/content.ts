import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'posts'> & {
  slug: string;
};

const posts: Post[] = (await getCollection('posts')).map((post) => ({
  ...post,
  slug: post.data.slug ?? post.id,
}));

export const allPosts = posts;

export const sortedPosts = [...posts].toSorted(
  (a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime(),
);

export const allTags = [
  ...new Set(posts.flatMap((post) => post.data.tags ?? [])),
].toSorted();
