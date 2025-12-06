'use client';

import { useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface SearcherProps {
  placeholder: string;
  gridSelector: string;
  cardSelector: string;
  dataAttributes: string[];
}

export default function Searcher({
  placeholder,
  gridSelector,
  cardSelector,
  dataAttributes,
}: SearcherProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const cacheRef = useRef<Array<{ el: HTMLElement; text: string }>>([]);
  const observerRef = useRef<MutationObserver | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rebuildDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const DEBOUNCE_MS = 180;

  const rebuildCache = (grid: HTMLElement | null) => {
    if (!grid) {
      cacheRef.current = [];
      return;
    }
    const cards = [...grid.querySelectorAll(cardSelector)] as HTMLElement[];
    cacheRef.current = cards.map((el) => {
      const text = dataAttributes
        .map((attr) => (el.dataset[attr] || '').toString())
        .join(' ')
        .toLowerCase();
      return { el, text };
    });
  };

  useEffect(() => {
    const inputEl =
      inputRef.current ??
      (document.querySelector('#search-input') as HTMLInputElement | null);
    const grid = document.querySelector(gridSelector) as HTMLElement | null;

    if (!inputEl || !grid) return;

    rebuildCache(grid);

    const performSearch = () => {
      const raw = (inputEl.value || '').toLowerCase().trim();
      if (raw === '') {
        for (const { el } of cacheRef.current) el.classList.remove('hidden');
        return;
      }

      for (const { el, text } of cacheRef.current) {
        const isVisible = text.includes(raw);
        el.classList.toggle('hidden', !isVisible);
      }
    };

    const onInput = () => {
      if (debounceRef.current) globalThis.clearTimeout(debounceRef.current);
      debounceRef.current = globalThis.setTimeout(performSearch, DEBOUNCE_MS);
    };

    inputEl.addEventListener('input', onInput);

    if ('MutationObserver' in globalThis) {
      observerRef.current = new MutationObserver(() => {
        if (rebuildDebounceRef.current)
          globalThis.clearTimeout(rebuildDebounceRef.current);
        rebuildDebounceRef.current = globalThis.setTimeout(
          () => rebuildCache(grid),
          150,
        );
      });

      observerRef.current.observe(grid, { childList: true, subtree: true });
    }

    return () => {
      inputEl.removeEventListener('input', onInput);
      if (debounceRef.current) globalThis.clearTimeout(debounceRef.current);
      if (rebuildDebounceRef.current)
        globalThis.clearTimeout(rebuildDebounceRef.current);
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [gridSelector, cardSelector, dataAttributes.join('|')]);

  return (
    <section className="mx-auto mb-12 max-w-lg">
      <div className="relative">
        <Search
          className="text-muted-foreground pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2"
          aria-hidden
        />
        <Input
          id="search-input"
          ref={inputRef}
          type="search"
          placeholder={placeholder}
          aria-label={placeholder}
          className="bg-muted/40 focus:bg-background focus:ring-primary/50 h-12 w-full rounded-full pr-5 pl-12 text-base shadow-inner transition-shadow duration-200 focus:shadow-lg focus:ring-2"
        />
      </div>
    </section>
  );
}
