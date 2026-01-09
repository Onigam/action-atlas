import Link from 'next/link';

import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/constants';

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="container-custom py-20">
          <div className="mx-auto max-w-md text-center">
            <div className="mb-8 text-6xl">🔍</div>
            <h1 className="text-4xl font-bold mb-4">Activity Not Found</h1>
            <p className="text-muted-foreground mb-8">
              The activity you&apos;re looking for doesn&apos;t exist or has been
              removed.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href={ROUTES.SEARCH}>
                <Button>Search Activities</Button>
              </Link>
              <Link href={ROUTES.HOME}>
                <Button variant="outline">Go Home</Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
