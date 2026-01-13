'use client';

import { Menu, Search, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { ROUTES } from '@/lib/constants';

import { Navigation } from './Navigation';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur-sm shadow-sm">
      <div className="container-custom flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link
            href={ROUTES.HOME}
            className="group flex items-center gap-3 transition-colors"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-600 transition-colors group-hover:bg-primary-700">
              <Search className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">
              Action Atlas
            </span>
          </Link>

          <Navigation />
        </div>

        <div className="flex items-center gap-4">
          {/* Future: Add authentication buttons here */}
          {/* <Button variant="outline" size="sm">Sign In</Button> */}
          {/* <Button variant="primary" size="sm">Get Started</Button> */}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <nav className="container-custom flex flex-col gap-1 py-4">
            {[
              { label: 'Search', href: ROUTES.SEARCH },
              { label: 'About', href: ROUTES.ABOUT },
              { label: 'Contact', href: ROUTES.CONTACT },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg px-4 py-3 text-sm font-medium text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
