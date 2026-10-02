import { For, Show } from 'solid-js';
import PostRow from './PostRow';
import EmptyState from './EmptyState';
import type { PostSummary } from '@/lib/posts';

type Properties = { posts: PostSummary[]; groupByYear?: boolean; empty?: string };

const PostList = (properties: Properties) => {
  const grouped = () => {
    const byYear = new Map<number, PostSummary[]>();

    for (const post of properties.posts) {
      const year = post.pubDate.getFullYear();
      const bucket = byYear.get(year);

      if (bucket) bucket.push(post);
      else byYear.set(year, [post]);
    }

    return [...byYear.entries()];
  };

  return (
    <Show
      when={properties.posts.length > 0}
      fallback={<EmptyState icon="i-mdi-file-document-outline" title={properties.empty ?? '暂无文章'} />}
    >
      <Show
        when={properties.groupByYear}
        fallback={
          <div class="flex flex-col">
            <For each={properties.posts}>{(post) => <PostRow post={post} />}</For>
          </div>
        }
      >
        <div class="flex flex-col gap-10">
          <For each={grouped()}>
            {([year, posts]) => (
              <section aria-label={`${year} 年`}>
                <h2 class="section-label mb-3">{year}</h2>
                <div class="flex flex-col">
                  <For each={posts}>{(post) => <PostRow post={post} />}</For>
                </div>
              </section>
            )}
          </For>
        </div>
      </Show>
    </Show>
  );
};

export default PostList;
