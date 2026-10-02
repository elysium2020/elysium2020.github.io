type Properties = { eyebrow: string; title: string; count?: string };

const PageHeader = (properties: Properties) => (
  <section class="mb-10 border-b border-border pb-10">
    <p class="section-label mb-3">{properties.eyebrow}</p>
    <h1 class="text-4xl lg:text-5xl">{properties.title}</h1>
    {properties.count && <p class="mt-2 text-sm text-muted-foreground">{properties.count}</p>}
  </section>
);

export default PageHeader;
