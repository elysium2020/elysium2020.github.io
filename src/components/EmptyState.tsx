type Properties = { icon: string; title: string; hint?: string };

const EmptyState = (properties: Properties) => (
  <div class="flex flex-col items-center gap-3 py-16 text-center">
    <span class={`${properties.icon} text-muted-foreground/40 h-10 w-10`} aria-hidden="true" />
    <p class="text-sm font-medium">{properties.title}</p>
    {properties.hint && <p class="text-muted-foreground text-xs">{properties.hint}</p>}
  </div>
);

export default EmptyState;
