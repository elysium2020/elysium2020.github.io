'use client';

import { cn } from '@/lib/utils';
import { memo } from 'react';
import { Separator } from '@/components/ui/separator';

const CC_ICONS = {
  cc: 'https://mirrors.creativecommons.org/presskit/icons/cc.svg?ref=chooser-v1',
  by: 'https://mirrors.creativecommons.org/presskit/icons/by.svg?ref=chooser-v1',
  sa: 'https://mirrors.creativecommons.org/presskit/icons/sa.svg?ref=chooser-v1',
};

const CCLicenseIcons = memo(function CCLicenseIcons() {
  return (
    <span className="ml-2 flex gap-1.5">
      {Object.entries(CC_ICONS).map(([key, src]) => (
        <img
          key={key}
          src={src}
          alt={key.toUpperCase()}
          loading="lazy"
          className="h-5 w-auto opacity-80 transition duration-300 hover:scale-110 hover:opacity-100"
        />
      ))}
    </span>
  );
});

const Footer = memo(function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className={cn(
        'mt-auto w-full border-t border-gray-100/50 bg-gradient-to-t from-gray-50/50 to-transparent py-6 shadow-inner',
      )}>
      <div className="container mx-auto max-w-5xl px-4">
        <div className="text-muted-foreground flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm">
          <span className="text-gray-600">{currentYear} Elysium</span>

          <Separator
            orientation="vertical"
            className="mx-1 h-3 bg-gray-300/70"
          />

          <a
            href="https://creativecommons.org/licenses/by-sa/4.0/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Creative Commons CC-BY-SA 4.0 许可证"
            className="group inline-flex items-center transition-colors">
            <span className="group-hover:text-primary relative text-gray-600 transition-colors">
              CC-BY-SA 4.0
              <span className="bg-primary/70 absolute -bottom-0.5 left-1/2 h-px w-0 -translate-x-1/2 transition-all duration-300 group-hover:w-full" />
            </span>

            <CCLicenseIcons />
          </a>
        </div>
      </div>
    </footer>
  );
});

export default Footer;
