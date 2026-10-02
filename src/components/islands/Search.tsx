import { TextField } from '@kobalte/core/text-field';
import { createEffect, createMemo, createSignal, For, onCleanup, onMount, Show } from 'solid-js';
import EmptyState from '../EmptyState';
import PostList from '../PostList';
import TagChip from '../TagChip';
import type { PostSummary } from '@/lib/posts';

export type TagItem = { tag: string; count: number; searchable: string };

type Properties =
  | { mode: 'posts'; items: PostSummary[]; placeholder: string; noun: string }
  | { mode: 'tags'; items: TagItem[]; placeholder: string; noun: string };

type PagefindResult = { url: string; data: () => Promise<{ url: string }> };
type PagefindModule = {
  init?: () => Promise<void> | void;
  search: (term: string) => Promise<{ results: PagefindResult[] }>;
};

const MAX_RESULTS = 30;
const DEBOUNCE_MS = 150;

const tokenize = (value: string) =>
  value
    .toLowerCase()
    .split(/[\s,，、]+/)
    .filter(Boolean);

/** `/blog/<id>/` → `<id>`; anything else (or a malformed URL) is unmappable. */
const idFromUrl = (url: string): string | undefined => {
  const raw = /^\/blog\/(.+?)\/?$/.exec(url)?.[1];
  if (!raw) return undefined;
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
};

const Search = (properties: Properties) => {
  const [rawQuery, setRawQuery] = createSignal('');
  const [query, setQuery] = createSignal('');
  const [available, setAvailable] = createSignal(false);
  const [pagefind, setPagefind] = createSignal<PagefindModule | null>(null);
  const [remoteResults, setRemoteResults] = createSignal<PostSummary[] | null>(null);

  let timer: ReturnType<typeof setTimeout> | undefined;
  let searchSeq = 0;

  // 判别联合收窄需要 3+ 处调用：按 mode 取出各自的 items 子集。
  const posts = (): PostSummary[] => (properties.mode === 'posts' ? properties.items : []);
  const tags = (): TagItem[] => (properties.mode === 'tags' ? properties.items : []);

  const debouncedQuery = () => query().trim();

  const onInput = (value: string) => {
    setRawQuery(value);
    clearTimeout(timer);
    timer = setTimeout(() => setQuery(value), DEBOUNCE_MS);
  };

  onCleanup(() => clearTimeout(timer));

  // 浏览器 API 仅可在 onMount 内使用：Pagefind 模块在 dev（无索引）下不存在。
  onMount(() => {
    if (properties.mode !== 'posts') return;

    void (async () => {
      try {
        const mod = (await new Function('u', 'return import(u)')(
          '/pagefind/pagefind.js',
        )) as PagefindModule;
        if (!mod || typeof mod.search !== 'function') throw new Error('pagefind unavailable');
        await mod.init?.();
        setPagefind(mod);
        setAvailable(true);
      } catch {
        setAvailable(false);
        setPagefind(null);
      }
    })();
  });

  // 有索引时走 Pagefind；索引缺失或查询出错时回退到本地 `searchable` 过滤。
  createEffect(() => {
    if (properties.mode !== 'posts') return;

    const term = debouncedQuery();
    const mod = pagefind();

    if (term === '' || !mod) {
      setRemoteResults(null);
      return;
    }

    const seq = ++searchSeq;
    setRemoteResults(null);

    void (async () => {
      try {
        const response = await mod.search(term);
        const data = await Promise.all(
          response.results.slice(0, MAX_RESULTS).map((result) => result.data()),
        );
        if (seq !== searchSeq) return;

        const items = posts();
        const mapped: PostSummary[] = [];
        for (const entry of data) {
          const id = idFromUrl(entry.url);
          const found = id ? items.find((item) => item.id === id) : undefined;
          if (found) mapped.push(found);
        }
        setRemoteResults(mapped);
      } catch {
        if (seq !== searchSeq) return;
        setAvailable(false);
        setPagefind(null);
      }
    })();
  });

  const tagsFiltered = createMemo(() => {
    const term = debouncedQuery();
    if (term === '') return tags();

    const tokens = tokenize(term);
    return tags().filter((item) => tokens.every((token) => item.searchable.includes(token)));
  });

  // null 表示「有索引但结果尚在加载」；无索引时同步返回本地过滤结果。
  const postResults = (): PostSummary[] | null => {
    const term = debouncedQuery();
    if (term === '') return posts();
    if (available() && pagefind()) return remoteResults();

    const tokens = tokenize(term);
    return posts().filter((item) => tokens.every((token) => item.searchable.includes(token)));
  };

  const postsView = () => (
    <Show when={debouncedQuery() !== ''} fallback={<PostList posts={posts()} groupByYear/>}>
      <Show when={postResults() !== null}>
        <Show
          when={(postResults() ?? []).length > 0}
          fallback={<EmptyState icon="i-mdi-magnify-remove-outline" title="没有找到匹配的文章" hint="试试其他关键词"/>}
        >
          <PostList posts={postResults() ?? []}/>
        </Show>
      </Show>
    </Show>
  );

  const tagsView = () => (
    <Show
      when={!(debouncedQuery() !== '' && tagsFiltered().length === 0)}
      fallback={<EmptyState icon="i-mdi-magnify-remove-outline" title="没有找到匹配的标签" hint="试试其他关键词"/>}
    >
      <div class="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        <For each={tagsFiltered()}>
          {(item) => (
            <div class="flex flex-col gap-2 items-center">
              <TagChip tag={item.tag} icon/>
              <span class="text-muted-foreground bg-accent/50 px-2 py-0.5 rounded-full text-xs">
                {item.count} 篇
              </span>
            </div>
          )}
        </For>
      </div>
    </Show>
  );

  const resultCount = () =>
    properties.mode === 'tags' ? tagsFiltered().length : (postResults() ?? []).length;

  const pending = () =>
    properties.mode === 'posts' && debouncedQuery() !== '' && postResults() === null;

  return (
    <div class="mb-8">
      <div class="relative flex items-center">
        <span
          class="i-mdi-magnify text-muted-foreground pointer-events-none absolute left-3 h-4 w-4"
          aria-hidden="true"
        />
        <TextField value={rawQuery()} onChange={onInput} class="w-full">
          <TextField.Input
            type="search"
            placeholder={properties.placeholder}
            aria-label={properties.placeholder}
            class="focus-ring text-foreground border-border bg-background placeholder:text-muted-foreground w-full rounded-sm border py-2.5 pr-4 pl-9 text-sm"
          />
        </TextField>
      </div>

      <p class="text-muted-foreground mt-2 text-xs" aria-live="polite">
        {debouncedQuery() !== '' && !pending() ? `找到 ${resultCount()} ${properties.noun}` : ''}
      </p>

      {properties.mode === 'tags' ? tagsView() : postsView()}
    </div>
  );
};

export default Search;
