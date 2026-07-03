import LinkWithUnderline from './LinkWithUnderline';

const CC_ICONS = [
  { label: 'CC', icon: 'i-tabler-creative-commons' },
  { label: 'BY', icon: 'i-tabler-creative-commons-by' },
  { label: 'SA', icon: 'i-tabler-creative-commons-sa' },
] as const;

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer class="border-border mt-auto w-full border-t py-8">
      <div class="container mx-auto max-w-5xl px-4">
        <div class="text-muted-foreground flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm">
          <span>
            {currentYear}{' '}
            <span class="text-foreground font-serif font-normal tracking-wide">Elysium</span>
          </span>
          <span aria-hidden="true">·</span>
          <div class="inline-flex items-center">
            <LinkWithUnderline
              href="https://creativecommons.org/licenses/by-sa/4.0/"
              class="text-inherit"
            >
              CC-BY-SA 4.0
            </LinkWithUnderline>
            <span class="ml-2 flex gap-1.5">
              {CC_ICONS.map((icon) => (
                <span
                  class={`${icon.icon} h-5 w-5 opacity-80 transition duration-300 hover:scale-110 hover:opacity-100`}
                  role="img"
                  aria-label={icon.label}
                />
              ))}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
