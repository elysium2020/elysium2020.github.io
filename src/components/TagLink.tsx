type Properties = { tag: string; icon?: boolean };

const TagLink = (properties: Properties) => {
  return (
    <a
      href={`/tags/${properties.tag}`}
      class="text-muted-foreground border-border hover:text-foreground hover:border-foreground/40 focus-ring inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs transition-colors"
    >
      {properties.icon && <span class="i-mdi-tag h-3 w-3" />}
      {properties.tag}
    </a>
  );
};

export default TagLink;
