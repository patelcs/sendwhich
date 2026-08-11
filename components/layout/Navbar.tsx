'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Moon, MoreHorizontal, Sun, Zap } from 'lucide-react';
import { useTheme } from '@/providers/ThemeProvider';
import { uiConfigs } from '@/configs';
import { WalletConnection } from '../wallet';

function isActive(pathname: string, href: string) {
  if (href == '/') return pathname === href;
  return pathname.includes(href);
}

export default function Navbar() {
  const { showBrandInTopNavbar, routes } = uiConfigs;
  const [moreOpen, setMoreOpen] = useState(false);
  const { theme, toggle } = useTheme();
  const pathname = usePathname();

  return (
    <>
      <nav className={'sticky top-0 z-50 border-b border-(--navbar-border) bg-(--navbar-background)'}>
        <div className="flex h-16 w-full items-center px-4 sm:px-6 lg:px-8">
          {showBrandInTopNavbar && (
            <Link href="/" className="flex items-center gap-2 text-lg font-bold text-(--navbar-foreground)">
              <Zap size={22} className="text-(--brand)" />
              <span className="bg-linear-to-r from-(--brand) to-(--brand-secondary) bg-clip-text text-transparent">
                SendWhich
              </span>
            </Link>
          )}

          <div className="ml-8 hidden items-center gap-1 md:flex">
            {routes.navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive(pathname, link.href)
                    ? 'bg-(--brand)/10 text-(--brand)'
                    : 'text-(--navbar-muted) hover:bg-(--navbar-accent) hover:text-(--navbar-foreground)'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="ml-auto flex min-w-0 items-center gap-2 sm:gap-3">
            {/* Theme button temporarily disabled — light theme isn't ready yet.
            <button
            type="button"
            onClick={toggle}
            className="flex items-center justify-center p-2 text-(--icon-muted) transition-colors hover:text-(--icon-muted-hover) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--brand)"
            aria-label="Toggle theme"
            >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            */}
            <WalletConnection />
          </div>
        </div>
      </nav>

      {moreOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 md:hidden">
          <button
            type="button"
            className="absolute inset-0 h-full w-full cursor-default"
            onClick={() => setMoreOpen(false)}
            aria-label="Close more menu"
          />
          <section
            id="mobile-more-menu"
            role="dialog"
            aria-modal="true"
            aria-label="More navigation"
            className="absolute inset-x-0 bottom-14 rounded-t-2xl border-t border-(--border) bg-(--card) p-4 shadow-2xl"
          >
            <div className="mx-auto max-w-md">
              {routes.navLinksMobileMore.map((section, sectionIndex) => (
                <div
                  key={section.title ?? `section-${sectionIndex}`}
                  className={sectionIndex > 0 ? 'mt-4 border-t border-(--border) pt-4' : ''}
                >
                  {section.title && (
                    <p className="px-3 pb-1.5 text-xs font-semibold tracking-wide text-(--muted) uppercase">
                      {section.title}
                    </p>
                  )}

                  <div className="space-y-1">
                    {section.items.map(({ href, icon: Icon, label }) => {
                      const isExternal = href.startsWith('http');
                      const className =
                        'flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-(--foreground) transition-colors hover:bg-(--accent)';
                      const contents = (
                        <>
                          <Icon size={20} className="text-(--brand)" aria-hidden="true" />
                          {label}
                        </>
                      );

                      return isExternal ? (
                        <a
                          key={href}
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => setMoreOpen(false)}
                          className={className}
                        >
                          {contents}
                        </a>
                      ) : (
                        <Link key={href} href={href} onClick={() => setMoreOpen(false)} className={className}>
                          {contents}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-(--navbar-border) bg-(--bottom-bar) pb-[env(safe-area-inset-bottom)] md:hidden">
        <div className="mx-auto flex h-14 max-w-md items-center justify-around px-2">
          {routes.navLinksMobile.map(({ href, icon: Icon, label }) => {
            const _isActive = isActive(pathname, href);

            return (
              <Link
                key={href}
                href={href}
                aria-current={_isActive ? 'page' : undefined}
                className={`flex min-w-0 flex-1 flex-col items-center gap-1 rounded-lg py-1.5 text-xs font-medium transition-colors ${
                  _isActive ? 'text-(--brand)' : 'text-(--navbar-muted) hover:text-(--navbar-foreground)'
                }`}
              >
                <Icon size={20} aria-hidden="true" />
                <span className="truncate">{label}</span>
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => setMoreOpen((open) => !open)}
            aria-expanded={moreOpen}
            aria-controls="mobile-more-menu"
            className={`flex min-w-0 flex-1 flex-col items-center gap-1 rounded-lg py-1.5 text-xs font-medium transition-colors ${
              moreOpen ? 'text-(--brand)' : 'text-(--navbar-muted) hover:text-(--navbar-foreground)'
            }`}
          >
            <MoreHorizontal size={20} aria-hidden="true" />
            <span>More</span>
          </button>
        </div>
      </nav>
    </>
  );
}
