'use client';

import { useEffect } from 'react';
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
  useEffect(() => {
    const searchInput = document.querySelector(
      '#search-input',
    ) as HTMLInputElement;
    const grid = document.querySelector(gridSelector);

    if (!searchInput || !grid) return;

    const cards = grid.querySelectorAll(cardSelector);

    const performSearch = () => {
      const searchTerm = searchInput.value.toLowerCase().trim();

      for (const card of cards) {
        const cardElement = card as HTMLElement;
        const isVisible =
          searchTerm === '' ||
          dataAttributes.some((attr) =>
            (cardElement.dataset[attr] || '')
              .toLowerCase()
              .includes(searchTerm),
          );
        cardElement.classList.toggle('hidden', !isVisible);
      }
    };

    searchInput.addEventListener('input', performSearch);

    return () => {
      searchInput.removeEventListener('input', performSearch);
    };
  }, [gridSelector, cardSelector, dataAttributes]);

  return (
    <section className="mx-auto mb-12 max-w-lg">
      <div className="relative">
        <Search className="text-muted-foreground absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2" />
        <Input
          id="search-input"
          type="search"
          placeholder={placeholder}
          className="bg-muted/40 focus:bg-background focus:ring-primary/50 h-12 w-full rounded-full pr-5 pl-12 text-base shadow-inner transition-all duration-300 focus:shadow-lg focus:ring-2"
        />
      </div>
    </section>
  );
}
