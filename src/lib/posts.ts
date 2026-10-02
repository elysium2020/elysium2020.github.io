import { getCollection, type CollectionEntry } from 'astro:content';
import { sortPosts, getTagCounts, getPopularTags, getRelated } from './derive';
import { readingMinutes } from './reading-time';

/**
 * A blog entry with `tags` / `pubDate` flattened to the top level so it
 * structurally satisfies `derive`'s `PostLike` contract; `.data` is kept.
 */
export type Post = CollectionEntry<'blog'> & { tags: string[]; pubDate: Date };

export type PostSummary = {
  id: string;
  title: string;
  description: string;
  pubDate: Date;
  dateLabel: string;
  readingMinutes: number;
  tags: string[];
  heroImage?: { src: string; width: number; height: number };
  searchable: string;
};

const collection = await getCollection('blog');

export const allPosts: Post[] = collection.map((post) => ({
  ...post,
  tags: post.data.tags,
  pubDate: post.data.pubDate,
}));

export const sortedPosts = sortPosts(allPosts);
export const allTags = [...new Set(allPosts.flatMap((post) => post.data.tags))].toSorted();
export const popularTags = getPopularTags(sortedPosts, 8);

export { getRelated, getTagCounts };

export const dateLabel = (d: Date) =>
  d.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });

export function toSummary(post: Post): PostSummary {
  const { title, description, tags, pubDate, heroImage } = post.data;

  return {
    id: post.id,
    title,
    description,
    pubDate,
    dateLabel: dateLabel(pubDate),
    readingMinutes: readingMinutes(post.body ?? ''),
    tags,
    ...(heroImage
      ? {
          heroImage: {
            src: heroImage.src,
            width: heroImage.width,
            height: heroImage.height,
          },
        }
      : {}),
    searchable: `${title} ${description} ${tags.join(' ')}`.toLowerCase(),
  };
}
