import { Search } from 'lucide-react';
import Link from 'next/link';

import { ROUTES } from '@/lib/constants';

import { Navigation } from './Navigation';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container-custom flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href={ROUTES.HOME} className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Search className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold">Action Atlas</span>
          </Link>

          <Navigation />
        </div>

        <div className="flex items-center gap-4">
          {/* Future: Add authentication buttons here */}
          {/* <Button variant="ghost" size="sm">Sign In</Button> */}
          {/* <Button size="sm">Get Started</Button> */}
        </div>
      </div>
    </header>
  );
}
