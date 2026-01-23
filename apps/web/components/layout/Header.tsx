'use client';

import { Menu, Search, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { ROUTES } from '@/lib/constants';

import { Navigation } from './Navigation';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-100 bg-white/80 backdrop-blur-sm">
      <div className="container-custom flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link
            href={ROUTES.HOME}
            className="group flex items-center gap-3 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 rounded-lg"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 transition-colors group-hover:bg-teal-100">
              <Search className="h-5 w-5 text-teal-600" />
            </div>
            <span className="text-xl font-bold text-zinc-900">
              Action Atlas
            </span>
          </Link>

          <Navigation />
        </div>

        <div className="flex items-center gap-4">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg text-zinc-600 hover:bg-zinc-50 hover:text-teal-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
            aria-label="Toggle mobile menu"
            aria-expanded={mobileMenuOpen}
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
      <div
        className={`md:hidden overflow-hidden transition-all duration-200 ease-in-out ${
          mobileMenuOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <nav className="container-custom flex flex-col gap-1 py-4 bg-white shadow-sm">
          {[
            { label: 'Search', href: ROUTES.SEARCH },
            { label: 'About', href: ROUTES.ABOUT },
            { label: 'Contact', href: ROUTES.CONTACT },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-4 py-3 text-sm font-medium text-zinc-600 hover:bg-zinc-50 hover:text-teal-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-500"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
