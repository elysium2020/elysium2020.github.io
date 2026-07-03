import { TextField } from '@kobalte/core/text-field';
import { createMemo, createSignal, For, type JSX, Show } from 'solid-js';

type Properties<T extends { searchable: string }> = {
  items: T[];
  placeholder?: string;
  noun?: string;
  class?: string;
  children: (item: T) => JSX.Element;
};

const tokenize = (s: string) =>
  s
    .toLowerCase()
    .split(/[\s,，、]+/)
    .filter(Boolean);

const Searcher = <T extends { searchable: string }>(properties: Properties<T>) => {
  const [query, setQuery] = createSignal('');

  const tokens = createMemo(() => tokenize(query()));

  const filtered = createMemo(() => {
    if (tokens().length === 0) return properties.items;

    return properties.items.filter((item) => tokens().every((t) => item.searchable.includes(t)));
  });

  const noun = () => properties.noun ?? '项';
  const placeholder = () => properties.placeholder ?? '搜索...';

  return (
    <div class="mb-6">
      <div class="relative flex items-center">
        <span class="i-mdi-magnify text-muted-foreground pointer-events-none absolute left-3 h-4 w-4" />

        <TextField value={query()} onChange={setQuery} class="w-full">
          <TextField.Input
            type="search"
            placeholder={placeholder()}
            aria-label={placeholder()}
            class="text-foreground border-border bg-background placeholder:text-muted-foreground focus:ring-foreground/30 w-full rounded-md border py-2 pr-9 pl-9 text-sm focus:ring-2 focus:outline-none"
          />
        </TextField>
      </div>
      <Show when={tokens().length > 0 && filtered().length > 0}>
        <p class="text-muted-foreground mt-2 text-xs">
          找到 {filtered().length} {noun()}
        </p>
      </Show>
      <Show when={tokens().length > 0 && filtered().length === 0}>
        <div class="mt-12 flex flex-col items-center gap-3 text-center">
          <span class="i-mdi-magnify-remove-outline text-muted-foreground/40 h-10 w-10" />
          <p class="text-muted-foreground text-sm font-medium">没有找到相关{noun()}</p>
        </div>
      </Show>
      <div class={properties.class ?? 'flex flex-col'}>
        <For each={filtered()}>{(item) => properties.children(item)}</For>
      </div>
    </div>
  );
};

export default Searcher;
