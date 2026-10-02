import { Dialog } from '@kobalte/core/dialog';
import { createSignal, For, onMount } from 'solid-js';
import { NAV_ITEMS, SITE } from '@/lib/site';
import ThemeToggle from './ThemeToggle';

const MobileNav = () => {
  const [open, setOpen] = createSignal(false);
  const [currentPath, setCurrentPath] = createSignal('');

  // 浏览器 API 仅可在 onMount 使用：渲染期不得读 location
  onMount(() => setCurrentPath(globalThis.location.pathname));

  const isActive = (href: string) => {
    const path = currentPath();
    return path !== '' && path.startsWith(href);
  };

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
            <a
              href="/"
              class="font-mono text-base font-bold"
              onClick={() => setOpen(false)}
            >
              {SITE.title}
            </a>
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
              {(item) => (
                <a
                  href={item.href}
                  onClick={() => setOpen(false)}
                  aria-current={isActive(item.href) ? 'page' : undefined}
                  class="relative flex items-center gap-3 px-5 py-3 font-mono text-xs tracking-widest uppercase transition-colors"
                  classList={{
                    'text-foreground': isActive(item.href),
                    'text-muted-foreground': !isActive(item.href),
                    'hover:text-foreground': !isActive(item.href),
                  }}
                >
                  <span
                    class="bg-accent absolute top-1/2 left-0 h-3.5 w-0.5 -translate-y-1/2 rounded-full transition-opacity duration-200"
                    classList={{ 'opacity-100': isActive(item.href), 'opacity-0': !isActive(item.href) }}
                  />

                  {item.title}
                </a>
              )}
            </For>
          </nav>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
};

export default MobileNav;
