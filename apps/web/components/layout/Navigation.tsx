'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { ROUTES } from '@/lib/constants';
import { cn } from '@/lib/utils';

const navigationItems = [
  { label: 'Search', href: ROUTES.SEARCH },
  { label: 'About', href: ROUTES.ABOUT },
  { label: 'Contact', href: ROUTES.CONTACT },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="hidden md:flex items-center gap-6">
      {navigationItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'text-sm font-medium transition-colors relative',
              isActive
                ? 'text-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            )}
          >
            {item.label}
            {isActive && (
              <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary-600 rounded-full" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
