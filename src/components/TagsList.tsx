import Searcher from './Searcher';

type TagItem = {
  tag: string;
  count: number;
  searchable: string;
};

type Properties = {
  items: TagItem[];
};

export default function TagsList(properties: Properties) {
  return (
    <Searcher<TagItem>
      items={properties.items}
      placeholder="搜索标签..."
      noun="个标签"
      class="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
    >
      {(item) => (
        <a
          href={`/tags/${item.tag}`}
          class="group border-border hover:border-foreground/30 hover:bg-accent/20 focus-ring flex flex-col items-center gap-2 rounded-lg border px-3 py-5 text-center transition-all duration-200"
          aria-label={`查看 ${item.tag} 标签文章`}
        >
          <span
            class="i-mdi-tag text-muted-foreground group-hover:text-foreground h-4.5 w-4.5 transition-all duration-200 group-hover:-translate-y-0.5"
            aria-hidden="true"
          />

          <span class="text-sm font-medium tracking-tight">{item.tag}</span>

          <span class="text-muted-foreground bg-accent/50 rounded-full px-2 py-0.5 text-xs">
            {item.count} 篇
          </span>
        </a>
      )}
    </Searcher>
  );
}
