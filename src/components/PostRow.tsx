import { For, Show } from 'solid-js';
import TagChip from './TagChip';
import type { PostSummary } from '@/lib/posts';

type Properties = { post: PostSummary };

const PostRow = (properties: Properties) => (
  <a
    href={`/blog/${properties.post.id}/`}
    class="group border-border hover:bg-accent/20 focus-ring -mx-3 flex items-baseline gap-5 rounded-sm border-t px-3 py-4 transition-colors last:border-b"
    aria-label={`阅读 ${properties.post.title}`}
  >
    <time class="date-text min-w-16 shrink-0">{properties.post.dateLabel}</time>

    <div class="flex-1 min-w-0">
      <div class="mb-1 truncate text-sm font-medium">{properties.post.title}</div>

      <div class="text-muted-foreground mb-2 line-clamp-1 text-xs leading-relaxed">
        {properties.post.description}
      </div>

      <Show when={properties.post.tags.length > 0}>
        <div class="flex flex-wrap gap-1.5">
          <For each={properties.post.tags.slice(0, 3)}>{(tag) => <TagChip tag={tag} />}</For>
        </div>
      </Show>
    </div>

    <span class="i-mdi-arrow-top-right text-muted-foreground shrink-0 text-xs opacity-0 transition-opacity group-hover:opacity-100" />
  </a>
);

export default PostRow;
