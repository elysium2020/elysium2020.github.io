'use client';

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { memo, useState } from 'react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { title: 'Post', href: '/posts' },
  { title: 'Tag', href: '/tags' },
  { title: 'About', href: '/about' },
] as const;

const LinkWithUnderline = ({
  href,
  children,
  className,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) => (
  <a
    href={href}
    onClick={onClick}
    className={cn(
      'group hover:text-primary relative inline-block font-medium tracking-wide transition-all duration-300',
      className,
    )}>
    {children}
    <span className="bg-primary absolute -bottom-1 left-1/2 h-0.5 w-0 -translate-x-1/2 transform transition-all duration-300 ease-out group-hover:w-full"></span>
  </a>
);

const MobileHeader = memo(function MobileHeader() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          className="hover:bg-accent/50 rounded-full p-2 transition-all duration-300 md:hidden"
          aria-label="打开侧边栏">
          <Menu className="transition-transform duration-300 ease-in-out" />
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="border-r-primary/20 w-3/4">
        <SheetHeader className="border-b border-gray-100 p-4">
          <SheetTitle className="sr-only">导航菜单</SheetTitle>
          <SheetDescription className="sr-only">
            网站主导航链接
          </SheetDescription>
          <LinkWithUnderline
            href="/"
            className="text-xl font-bold"
            onClick={() => setOpen(false)}>
            Elysium's Blog
          </LinkWithUnderline>
        </SheetHeader>
        <nav
          className="mt-6 flex flex-col space-y-6 px-4"
          aria-label="移动端导航">
          {NAV_ITEMS.map((item) => (
            <LinkWithUnderline
              key={item.title}
              href={item.href}
              onClick={() => setOpen(false)}
              className="text-lg">
              {item.title}
            </LinkWithUnderline>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
});

const Header = memo(function Header() {
  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40 border-b border-gray-200 shadow-sm backdrop-blur">
      <nav
        className="container mx-auto flex max-w-5xl items-center justify-between p-4"
        aria-label="主导航">
        <LinkWithUnderline href="/" className="text-lg font-bold">
          Elysium's Blog
        </LinkWithUnderline>
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            {NAV_ITEMS.map((item) => (
              <NavigationMenuItem key={item.title} className="group/nav-item">
                <NavigationMenuLink
                  href={item.href}
                  className={navigationMenuTriggerStyle({
                    className:
                      'hover:bg-accent/50 hover:text-primary relative bg-transparent transition-all duration-300',
                  })}>
                  <span className="relative flex items-center justify-center">
                    {item.title}
                    <span className="bg-primary pointer-events-none absolute -bottom-1 left-1/2 h-0.5 w-0 -translate-x-1/2 transform transition-all duration-300 ease-out group-hover/nav-item:w-full"></span>
                  </span>
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
        <MobileHeader />
      </nav>
    </header>
  );
});

export default Header;
