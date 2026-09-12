import { type CollectionEntry, getCollection } from 'astro:content';

export type Post = CollectionEntry<'blog'>;

export const allPosts = await getCollection('blog');

export const sortedPosts = allPosts.toSorted(
  (a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime(),
);

export const allTags = [...new Set(allPosts.flatMap((post) => post.data.tags))].toSorted();

export const formatDate = (date: Date) =>
  date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });

export function getTagCounts(posts: typeof sortedPosts): Map<string, number> {
  const map = new Map<string, number>();

  for (const post of posts) {
    for (const tag of post.data.tags) {
      map.set(tag, (map.get(tag) ?? 0) + 1);
    }
  }

  return map;
}

export function getPopularTags(posts: typeof sortedPosts, limit = 8) {
  const map = getTagCounts(posts);

  return [...map.entries()]
    .toSorted((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([tag]) => tag);
}
