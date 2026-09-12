import { For } from 'solid-js';
import Searcher from './Searcher';

type PostItem = {
  id: string;
  title: string;
  description: string;
  pubDate: string;
  tags: string[];
  searchable: string;
};

type Properties = { items: PostItem[] };

export default function PostsList(properties: Properties) {
  return (
    <Searcher<PostItem> items={properties.items} placeholder="搜索文章..." noun="篇文章">
      {(item) => {
        const tags = () => item.tags.slice(0, 3);

        return (
          <a
            href={`/blog/${item.id}`}
            class="group border-border hover:bg-accent/20 focus-ring -mx-3 flex items-baseline gap-5 rounded-sm border-b px-3 py-3.5 transition-colors first:border-t"
            aria-label={`阅读 ${item.title}`}
          >
            <time class="date-text min-w-16 shrink-0">{item.pubDate}</time>

            <div class="min-w-0 flex-1">
              <div class="mb-1 truncate text-sm font-medium">{item.title}</div>

              <div class="text-muted-foreground mb-2 truncate text-xs leading-relaxed">
                {item.description}
              </div>

              <div class="flex flex-wrap gap-1.5">
                <For each={tags()}>
                  {(tag) => (
                    <span class="text-muted-foreground bg-accent/50 rounded-full px-2 py-0.5 text-xs">
                      {tag}
                    </span>
                  )}
                </For>
              </div>
            </div>

            <span class="i-mdi-arrow-top-right text-muted-foreground shrink-0 text-xs opacity-0 transition-opacity group-hover:opacity-100" />
          </a>
        );
      }}
    </Searcher>
  );
}
