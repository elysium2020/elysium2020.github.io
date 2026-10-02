export type PostLike = { id: string; tags: string[]; pubDate: Date };

/** Returns a new array sorted by `pubDate` descending (newest first). */
export function sortPosts<T extends PostLike>(posts: T[]): T[] {
  return posts.toSorted((a, b) => b.pubDate.getTime() - a.pubDate.getTime());
}

/** Counts how many posts reference each tag. */
export function getTagCounts(posts: PostLike[]): Map<string, number> {
  const counts = new Map<string, number>();

  for (const post of posts) {
    for (const tag of post.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }

  return counts;
}

/**
 * Most frequently used tags, descending by count; ties keep first-appearance
 * order. Defaults to the top 8.
 */
export function getPopularTags(posts: PostLike[], limit = 8): string[] {
  return [...getTagCounts(posts).entries()]
    .toSorted((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([tag]) => tag);
}

/**
 * Posts related to `post`, excluding itself.
 *
 * Ranked by the number of shared tags descending; when a post shares no tag
 * with any other, falls back to the most recent `limit` posts. Defaults to 3.
 */
export function getRelated<T extends PostLike>(post: T, posts: T[], limit = 3): T[] {
  const others = posts.filter((p) => p !== post);
  const scored = others.map((p) => ({
    post: p,
    shared: p.tags.filter((tag) => post.tags.includes(tag)).length,
  }));

  if (scored.every(({ shared }) => shared === 0)) {
    return sortPosts(others).slice(0, limit);
  }

  return scored
    .toSorted(
      (a, b) =>
        b.shared - a.shared || a.post.pubDate.getTime() - b.post.pubDate.getTime(),
    )
    .slice(0, limit)
    .map(({ post: p }) => p);
}

/**
 * Neighbours of `post` among the tag-matching subset when that subset has at
 * least two members, otherwise among all `posts`.
 *
 * `posts` is expected sorted by `pubDate` descending. `prev` is the
 * chronologically earlier (older) post and `next` is the later (newer) one.
 */
export function getPrevNext<T extends PostLike>(
  post: T,
  posts: T[],
): { prev?: T | undefined; next?: T | undefined } {
  const sameTags = post.tags.length
    ? posts.filter((p) => p.tags.some((tag) => post.tags.includes(tag)))
    : [];
  const sequence = sameTags.length >= 2 ? sameTags : posts;
  const index = sequence.indexOf(post);

  if (index === -1) return { prev: undefined, next: undefined };

  return { prev: sequence[index + 1], next: sequence[index - 1] };
}
