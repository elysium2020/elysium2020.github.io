import { For, Show, createSignal, onMount } from 'solid-js';

type Heading = { depth: number; slug: string; text: string };
type Properties = { headings: Heading[] };

const Toc = (properties: Properties) => {
  const [active, setActive] = createSignal('');

  onMount(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: '0px 0px -70% 0px' },
    );

    for (const { slug } of properties.headings) {
      const element = document.getElementById(slug);
      if (element) observer.observe(element);
    }

    return () => observer.disconnect();
  });

  const jump = (event: MouseEvent, slug: string) => {
    const target = document.getElementById(slug);
    if (!target) return;

    event.preventDefault();
    target.scrollIntoView({
      behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      block: 'start',
    });
    setActive(slug);
    history.replaceState(null, '', `#${slug}`);
  };

  return (
    <Show when={properties.headings.length > 0}>
      <nav aria-label="本页目录" class="text-sm">
        <ul class="flex flex-col">
          <For each={properties.headings}>
            {(heading) => (
              <li>
                <a
                  href={`#${heading.slug}`}
                  onClick={(event) => jump(event, heading.slug)}
                  aria-current={active() === heading.slug ? 'location' : undefined}
                  class="border-border text-muted-foreground hover:text-foreground block border-l-2 py-1.5 leading-snug transition-colors"
                  classList={{
                    'pl-3': heading.depth === 2,
                    'pl-6': heading.depth === 3,
                    'border-accent text-foreground': active() === heading.slug,
                  }}
                >
                  {heading.text}
                </a>
              </li>
            )}
          </For>
        </ul>
      </nav>
    </Show>
  );
};

export default Toc;
