'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MobileNavigationLink } from '@/configs/ui-configs/types';

export default function SecondaryNavbar({
  children,
  subRoutes,
}: {
  children: React.ReactNode;
  subRoutes: MobileNavigationLink[];
}) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-start">
      <aside className="hidden md:block md:w-56 md:shrink-0">
        <nav aria-label="Settings sections" className="space-y-1">
          {subRoutes.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;

            return (
              <Link
                key={href}
                href={href}
                aria-current={isActive ? 'page' : undefined}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive ? 'bg-(--brand)/10 text-(--brand)' : 'text-(--foreground) hover:bg-(--accent)'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-(--brand)' : 'text-(--muted)'} aria-hidden="true" />
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
