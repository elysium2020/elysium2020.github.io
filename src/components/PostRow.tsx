import { For, Show } from 'solid-js';
import TagChip from './TagChip';
import type { PostSummary } from '@/lib/posts';

type Properties = { post: PostSummary };

const PostRow = (properties: Properties) => (
  <div class="group border-border hover:bg-accent/20 relative -mx-3 flex items-baseline gap-5 rounded-sm border-b px-3 py-3.5 transition-colors">
    <a
      href={`/blog/${properties.post.id}/`}
      class="absolute inset-0 rounded-sm"
      aria-hidden="true"
      tabIndex={-1}
    />

    <time class="date-text min-w-16 shrink-0">{properties.post.dateLabel}</time>

    <div class="flex-1 min-w-0">
      <a
        href={`/blog/${properties.post.id}/`}
        class="focus-ring relative block truncate text-sm font-medium"
      >
        {properties.post.title}
      </a>

      <div class="text-muted-foreground mt-1 line-clamp-1 text-xs leading-relaxed">
        {properties.post.description}
      </div>

      <Show when={properties.post.tags.length > 0}>
        <div class="relative z-1 mt-1 flex flex-wrap gap-1.5">
          <For each={properties.post.tags.slice(0, 3)}>{(tag) => <TagChip tag={tag} />}</For>
        </div>
      </Show>
    </div>

    <span class="i-mdi-arrow-top-right text-muted-foreground shrink-0 text-xs opacity-0 transition-opacity group-hover:opacity-100" />
  </div>
);

export default PostRow;
