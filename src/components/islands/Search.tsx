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
  // 索引运行时状态：loading = 尚未判定（onMount 进行中）；ready = Pagefind 可用；fallback = 索引缺失。
  const [indexStatus, setIndexStatus] = createSignal<'loading' | 'ready' | 'fallback'>('loading');
  const [pagefind, setPagefind] = createSignal<PagefindModule | null>(null);
  const [remoteResults, setRemoteResults] = createSignal<PostSummary[] | null>(null);
  const [inFlight, setInFlight] = createSignal(false);

  let timer: ReturnType<typeof setTimeout> | undefined;
  let searchSeq = 0;
  // 连续远端失败计数：单次失败只让本次查询回退本地，连续 3 次才判定索引真的不可用。
  let consecutiveFailures = 0;

  const fetchRemote = async (mod: PagefindModule, term: string) => {
    const response = await mod.search(term);
    return Promise.all(response.results.slice(0, MAX_RESULTS).map((result) => result.data()));
  };

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
        setIndexStatus('ready');
      } catch {
        setIndexStatus('fallback');
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
      setInFlight(false);
      return;
    }

    const seq = ++searchSeq;
    // 关键：这里不清空 remoteResults。清空会卸载整份结果列表（外层 Show 无 fallback 的
    // 内层分支渲染空白），造成每次按键都闪烁 + 页面跳动。改为保留上一轮结果，成功后再替换。
    setInFlight(true);

    void (async () => {
      try {
        let data: { url: string }[];
        try {
          data = await fetchRemote(mod, term);
        } catch {
          // 首次失败先立即重试一次；Pagefind 的 worker 偶发失败可自愈。
          if (seq !== searchSeq) return;
          data = await fetchRemote(mod, term);
        }
        if (seq !== searchSeq) return;

        consecutiveFailures = 0;
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
        consecutiveFailures += 1;
        if (consecutiveFailures >= 3) {
          // 连续 3 次失败才认定索引真的不可用；否则本次查询仅回退本地过滤，
          // 索引保持 ready、模块保留，下一次查询继续尝试远端。
          setIndexStatus('fallback');
          setPagefind(null);
          return;
        }
        setRemoteResults(localPostResults(term));
      } finally {
        if (seq === searchSeq) setInFlight(false);
      }
    })();
  });

  const tagsFiltered = createMemo(() => {
    const term = debouncedQuery();
    if (term === '') return tags();

    const tokens = tokenize(term);
    return tags().filter((item) => tokens.every((token) => item.searchable.includes(token)));
  });

  const localPostResults = (term: string): PostSummary[] => {
    const tokens = tokenize(term);
    return posts().filter((item) => tokens.every((token) => item.searchable.includes(token)));
  };

  // 始终返回一份可渲染的列表，绝不返回 null：有索引且已有结果时用 Pagefind 结果，
  // 新查询尚未返回时沿用上一轮结果（首次查询则退回本地过滤），避免列表被卸载成空白。
  const postResults = (): PostSummary[] => {
    const term = debouncedQuery();
    if (term === '') return posts();
    if (indexStatus() === 'ready' && pagefind()) return remoteResults() ?? localPostResults(term);
    return localPostResults(term);
  };

  const postsView = () => (
    <Show when={debouncedQuery() !== ''} fallback={<PostList posts={posts()} groupByYear/>}>
      <Show
        when={postResults().length > 0}
        fallback={<EmptyState icon="i-mdi-magnify-remove-outline" title="没有找到匹配的文章" hint="试试其他关键词"/>}
      >
        <PostList posts={postResults()}/>
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
    properties.mode === 'tags' ? tagsFiltered().length : postResults().length;

  const pending = () =>
    properties.mode === 'posts' && debouncedQuery() !== '' && inFlight();

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
        {debouncedQuery() !== ''
          ? pending()
            ? '搜索中…'
            : `找到 ${resultCount()} ${properties.noun}`
          : ''}
      </p>

      <Show when={properties.mode === 'posts' && indexStatus() === 'fallback'}>
        <p class="text-muted-foreground mt-1 text-xs">
          全文索引不可用，仅搜索标题、描述与标签。
        </p>
      </Show>

      {properties.mode === 'tags' ? tagsView() : postsView()}
    </div>
  );
};

export default Search;
