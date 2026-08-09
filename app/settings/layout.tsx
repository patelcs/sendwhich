'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { uiConfigs } from '@/configs';

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-start">
      <aside className="hidden md:block md:w-56 md:shrink-0">
        <nav aria-label="Settings sections" className="space-y-1">
          {uiConfigs.routes.settingLinks.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;

            return (
              <Link
                key={href}
                href={href}
                aria-current={isActive ? 'page' : undefined}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${isActive ? 'bg-(--brand)/10 text-(--brand)' : 'text-(--foreground) hover:bg-(--accent)'
                  }`}
              >
                <Icon size={18} className={isActive ? 'text-(--brand)' : 'text-(--muted)'} aria-hidden="true" />
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="min-w-0 flex-1 py-4 md:rounded-2xl md:border md:border-(--border) md:bg-(--card) md:p-4 lg:p-6">
        {children}
      </div>
    </div>
  );
}
