import { Dialog } from '@kobalte/core/dialog';
import { createSignal, For } from 'solid-js';
import { isServer } from 'solid-js/web';
import LinkWithUnderline from './LinkWithUnderline';
import ThemeToggle from './ThemeToggle';

const NAV_ITEMS = [
  { title: 'Posts', href: '/blog' },
  { title: 'Tags', href: '/tags' },
  { title: 'About', href: '/about' },
] as const;

const MobileHeader = () => {
  const [open, setOpen] = createSignal(false);

  const currentPath = isServer ? '' : globalThis.location.pathname;

  return (
    <Dialog open={open()} onOpenChange={setOpen}>
      <Dialog.Trigger
        class="i-mdi-menu hover:bg-surface rounded-full p-2 transition md:hidden"
        aria-label={open() ? '关闭菜单' : '打开菜单'}
      />
      <Dialog.Portal>
        <Dialog.Overlay class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm md:hidden" />
        <Dialog.Content class="border-border bg-background fixed inset-y-0 left-0 z-50 flex w-3/4 max-w-xs flex-col border-r md:hidden dark:bg-zinc-900">
          <Dialog.Title class="sr-only">导航菜单</Dialog.Title>
          <div class="border-border flex items-center justify-between border-b px-5 py-5">
            <LinkWithUnderline
              href="/"
              class="font-mono text-base font-bold"
              onClick={() => setOpen(false)}
            >
              Elysium's Blog
            </LinkWithUnderline>
            <div class="flex items-center gap-1">
              <ThemeToggle />
              <Dialog.CloseButton
                class="i-mdi-close hover:bg-surface rounded-full p-1.5 transition"
                aria-label="关闭菜单"
              />
            </div>
          </div>
          <nav class="flex flex-col py-3" aria-label="移动端导航">
            <For each={NAV_ITEMS}>
              {(item) => {
                const isActive = currentPath.startsWith(item.href);
                return (
                  <a
                    href={item.href}
                    onClick={() => setOpen(false)}
                    aria-current={isActive ? 'page' : undefined}
                    class="relative flex items-center gap-3 px-5 py-3 font-mono text-xs tracking-widest uppercase transition-colors"
                    classList={{
                      'text-foreground': isActive,
                      'text-muted-foreground': !isActive,
                      'hover:text-foreground': !isActive,
                    }}
                  >
                    <span
                      class="bg-accent absolute top-1/2 left-0 h-3.5 w-0.5 -translate-y-1/2 rounded-full transition-opacity duration-200"
                      classList={{ 'opacity-100': isActive, 'opacity-0': !isActive }}
                    />

                    {item.title}
                  </a>
                );
              }}
            </For>
          </nav>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
};

export default MobileHeader;
