'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Moon, MoreHorizontal, Sun, Zap } from 'lucide-react';
import { useTheme } from '@/providers/ThemeProvider';
import ConnectButton from '../../wallet/ConnectButton';
import { MOBILE_NAV_LINKS, MORE_LINKS, NAV_LINKS } from './config';

export default function Navbar() {
  const [moreOpen, setMoreOpen] = useState(false);
  const { theme, toggle } = useTheme();
  const pathname = usePathname();

  return (
    <>
      <nav
        className={
          'sticky top-0 z-50 md:border-b md:border-(--border) md:bg-(--card)/80 backdrop-blur-xl'
        }
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="items-center gap-2 text-lg font-bold text-(--foreground) hidden md:flex"
          >
            <Zap size={22} className="text-blue-500" />
            <span className="bg-linear-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
              SendWhich
            </span>
          </Link>

          <div className="ml-8 hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? 'bg-blue-500/10 text-blue-500'
                    : 'text-(--muted) hover:bg-(--accent) hover:text-(--foreground)'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-3">
            <button
              type="button"
              onClick={toggle}
              className="rounded-lg border border-(--border) p-2 text-(--muted) transition-colors hover:bg-(--accent) hover:text-(--foreground)"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            <ConnectButton />
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
            className="absolute inset-x-0 bottom-16 rounded-t-2xl border-t border-(--border) bg-(--card) p-4 shadow-2xl"
          >
            <div className="mx-auto max-w-md">
              <div className="space-y-1">
                {MORE_LINKS.map((item, index) => {
                  if (item.type === 'separator') {
                    return (
                      <div
                        key={`separator-${index}`}
                        role="separator"
                        className="my-2 border-t border-(--border)"
                      />
                    );
                  }

                  const { href, icon: Icon, label } = item;
                  const isExternal = href.startsWith('http');
                  const className =
                    'flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-(--foreground) transition-colors hover:bg-(--accent)';
                  const contents = (
                    <>
                      <Icon
                        size={20}
                        className="text-blue-500"
                        aria-hidden="true"
                      />
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
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setMoreOpen(false)}
                      className={className}
                    >
                      {contents}
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        </div>
      )}

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-(--border) bg-(--card)/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden">
        <div className="mx-auto flex h-16 max-w-md items-center justify-around px-2">
          {MOBILE_NAV_LINKS.map(({ href, icon: Icon, label }) => {
            const isActive = pathname === href;

            return (
              <Link
                key={href}
                href={href}
                aria-current={isActive ? 'page' : undefined}
                className={`flex min-w-0 flex-1 flex-col items-center gap-1 rounded-lg py-2 text-xs font-medium transition-colors ${
                  isActive
                    ? 'text-blue-500'
                    : 'text-(--muted) hover:text-(--foreground)'
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
            className={`flex min-w-0 flex-1 flex-col items-center gap-1 rounded-lg py-2 text-xs font-medium transition-colors ${
              moreOpen
                ? 'text-blue-500'
                : 'text-(--muted) hover:text-(--foreground)'
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
