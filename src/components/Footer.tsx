'use client';

import { cn } from '@/lib/utils';
import { memo } from 'react';

const CC_ICONS = {
  cc: 'https://mirrors.creativecommons.org/presskit/icons/cc.svg?ref=chooser-v1',
  by: 'https://mirrors.creativecommons.org/presskit/icons/by.svg?ref=chooser-v1',
  sa: 'https://mirrors.creativecommons.org/presskit/icons/sa.svg?ref=chooser-v1',
};

const CCLicenseIcons = memo(function CCLicenseIcons() {
  return (
    <span className="ml-2 flex gap-1.5">
      {Object.entries(CC_ICONS).map(([key, source]) => (
        <img
          key={key}
          className="h-5 w-auto opacity-80 transition-all duration-300 hover:scale-110 hover:opacity-100"
          src={source}
          alt={key.toUpperCase()}
          loading="lazy"
        />
      ))}
    </span>
  );
});

const Footer = memo(function Footer() {
  const current_year = new Date().getFullYear();

  return (
    <footer
      className={cn(
        'mt-auto w-full border-t border-gray-100/50 bg-gradient-to-t from-gray-50/50 to-transparent py-6 shadow-inner',
      )}
      aria-label="页脚">
      <div className="container mx-auto max-w-5xl px-4">
        <div className="text-muted-foreground flex flex-col items-center justify-center gap-6 text-sm md:flex-row md:gap-4">
          <div className="flex items-center justify-center gap-1">
            <span className="text-gray-600">{current_year} Elysium</span>
            <span className="mx-2 text-gray-400" aria-hidden="true">
              ·
            </span>
            <a
              href="https://creativecommons.org/licenses/by-sa/4.0/"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative inline-flex items-center transition-colors"
              aria-label="Creative Commons CC-BY-SA 4.0 许可证">
              <span className="group-hover:text-primary relative text-gray-600 transition-colors">
                CC-BY-SA 4.0
                <span className="bg-primary/70 absolute -bottom-0.5 left-1/2 h-px w-0 -translate-x-1/2 transition-all duration-300 group-hover:w-full"></span>
              </span>
              <CCLicenseIcons />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
});

export default Footer;
