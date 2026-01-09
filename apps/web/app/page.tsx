import { ArrowRight, Search, Sparkles, Users } from 'lucide-react';
import Link from 'next/link';

import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { SearchBar } from '@/components/search/SearchBar';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/constants';

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        {/* Hero Section */}
        <section className="container-custom py-20 md:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl text-balance">
              Discover meaningful{' '}
              <span className="text-primary">volunteering opportunities</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground md:text-xl">
              AI-powered semantic search to find activities that match your
              skills, interests, and location. Make a difference in your
              community today.
            </p>

            {/* Search Bar */}
            <div className="mt-10">
              <SearchBar
                placeholder="Try 'teach kids programming' or 'help the environment'"
              />
            </div>

            {/* Quick Stats */}
            <div className="mt-12 grid grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-primary">1,200+</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Activities
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">500+</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Organizations
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">50+</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Cities
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="border-t bg-muted/50 py-20">
          <div className="container-custom">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                How it works
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Find the perfect volunteering opportunity in three simple steps
              </p>
            </div>

            <div className="mt-16 grid gap-8 md:grid-cols-3">
              <div className="flex flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Search className="h-8 w-8" />
                </div>
                <h3 className="mt-4 text-xl font-semibold">
                  Search naturally
                </h3>
                <p className="mt-2 text-muted-foreground">
                  Describe what you want to do in plain language. Our AI
                  understands your intent.
                </p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Sparkles className="h-8 w-8" />
                </div>
                <h3 className="mt-4 text-xl font-semibold">Get smart matches</h3>
                <p className="mt-2 text-muted-foreground">
                  See activities ranked by relevance to your skills,
                  interests, and location.
                </p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Users className="h-8 w-8" />
                </div>
                <h3 className="mt-4 text-xl font-semibold">Make an impact</h3>
                <p className="mt-2 text-muted-foreground">
                  Connect directly with organizations and start volunteering
                  today.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container-custom py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to make a difference?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Join thousands of volunteers making an impact in their
              communities.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link href={ROUTES.SEARCH}>
                <Button size="lg" className="w-full sm:w-auto">
                  Start Searching
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href={ROUTES.ABOUT}>
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
