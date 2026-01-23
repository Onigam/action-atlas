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
      <main className="min-h-screen bg-gradient-to-b from-white to-zinc-50">
        {/* Hero Section - Clean Minimal */}
        <section className="py-24 md:py-36">
          <div className="container-custom">
            <div className="mx-auto max-w-4xl text-center">
              <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl md:text-6xl">
                Discover meaningful{' '}
                <span className="text-teal-600">volunteering</span>{' '}
                opportunities
              </h1>
              <p className="mt-6 text-lg text-zinc-600 md:text-xl">
                AI-powered semantic search to find activities that match your
                skills, interests, and location.
              </p>

              {/* Search Bar */}
              <div className="mt-12">
                <SearchBar
                  placeholder="Try 'teach kids programming' or 'help the environment'"
                />
              </div>

              {/* Quick Stats - Minimal */}
              <div className="mt-20 grid grid-cols-3 gap-8">
                <div className="rounded-xl border border-zinc-100 bg-white p-6 shadow-sm">
                  <div className="text-4xl font-semibold text-teal-600">
                    10K+
                  </div>
                  <div className="mt-2 text-sm text-zinc-600">Activities</div>
                </div>
                <div className="rounded-xl border border-zinc-100 bg-white p-6 shadow-sm">
                  <div className="text-4xl font-semibold text-teal-600">
                    500+
                  </div>
                  <div className="mt-2 text-sm text-zinc-600">Organizations</div>
                </div>
                <div className="rounded-xl border border-zinc-100 bg-white p-6 shadow-sm">
                  <div className="text-4xl font-semibold text-teal-600">50+</div>
                  <div className="mt-2 text-sm text-zinc-600">Cities</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section - Minimal Cards */}
        <section className="bg-white py-24">
          <div className="container-custom">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
                How it works
              </h2>
              <p className="mt-4 text-lg text-zinc-600">
                Find the perfect volunteering opportunity in three simple steps
              </p>
            </div>

            <div className="mt-16 grid gap-8 md:grid-cols-3">
              {/* Step 1 */}
              <div className="rounded-xl border border-zinc-100 bg-white p-8 shadow-sm transition-shadow hover:shadow-md">
                <div className="flex flex-col items-center text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-50 p-3">
                    <Search className="h-6 w-6 text-teal-600" />
                  </div>
                  <h3 className="mt-6 text-xl font-semibold text-zinc-900">
                    Search naturally
                  </h3>
                  <p className="mt-3 text-zinc-600">
                    Describe what you want to do in plain language. Our AI
                    understands your intent.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="rounded-xl border border-zinc-100 bg-white p-8 shadow-sm transition-shadow hover:shadow-md">
                <div className="flex flex-col items-center text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-50 p-3">
                    <Sparkles className="h-6 w-6 text-teal-600" />
                  </div>
                  <h3 className="mt-6 text-xl font-semibold text-zinc-900">
                    Get smart matches
                  </h3>
                  <p className="mt-3 text-zinc-600">
                    See activities ranked by relevance to your skills,
                    interests, and location.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="rounded-xl border border-zinc-100 bg-white p-8 shadow-sm transition-shadow hover:shadow-md">
                <div className="flex flex-col items-center text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-50 p-3">
                    <Users className="h-6 w-6 text-teal-600" />
                  </div>
                  <h3 className="mt-6 text-xl font-semibold text-zinc-900">
                    Make an impact
                  </h3>
                  <p className="mt-3 text-zinc-600">
                    Connect directly with organizations and start volunteering
                    today.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section - Clean Minimal */}
        <section className="py-24">
          <div className="container-custom">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
                Ready to make a difference?
              </h2>
              <p className="mt-4 text-lg text-zinc-600">
                Join thousands of volunteers making an impact in their
                communities.
              </p>
              <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
                <Link href={ROUTES.SEARCH}>
                  <Button size="lg" variant="soft" className="w-full sm:w-auto">
                    Start Searching
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href={ROUTES.ABOUT}>
                  <Button
                    size="lg"
                    variant="ghost"
                    className="w-full rounded-lg border border-zinc-200 text-zinc-700 hover:bg-zinc-50 sm:w-auto"
                  >
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
