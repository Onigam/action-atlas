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
      <main className="min-h-screen bg-white">
        {/* Hero Section - Clean Minimal */}
        <section className="py-20 md:py-32">
          <div className="container-custom">
            <div className="mx-auto max-w-4xl text-center">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
                Discover meaningful{' '}
                <span className="text-primary-600">volunteering</span>{' '}
                opportunities
              </h1>
              <p className="mt-6 text-lg text-gray-600 md:text-xl">
                AI-powered semantic search to find activities that match your
                skills, interests, and location.
              </p>

              {/* Search Bar */}
              <div className="mt-10">
                <SearchBar
                  placeholder="Try 'teach kids programming' or 'help the environment'"
                />
              </div>

              {/* Quick Stats - Minimal */}
              <div className="mt-16 grid grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary-600">10K+</div>
                  <div className="mt-2 text-sm font-medium text-gray-600">
                    Activities
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary-600">500+</div>
                  <div className="mt-2 text-sm font-medium text-gray-600">
                    Organizations
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary-600">50+</div>
                  <div className="mt-2 text-sm font-medium text-gray-600">
                    Cities
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section - Minimal Cards */}
        <section className="bg-gray-50 py-20">
          <div className="container-custom">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                How it works
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Find the perfect volunteering opportunity in three simple steps
              </p>
            </div>

            <div className="mt-16 grid gap-8 md:grid-cols-3">
              {/* Step 1 */}
              <div className="rounded-2xl bg-white p-8 shadow-sm">
                <div className="flex flex-col items-center text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100">
                    <Search className="h-6 w-6 text-primary-600" />
                  </div>
                  <h3 className="mt-6 text-xl font-semibold text-gray-900">
                    Search naturally
                  </h3>
                  <p className="mt-3 text-gray-600">
                    Describe what you want to do in plain language. Our AI
                    understands your intent.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="rounded-2xl bg-white p-8 shadow-sm">
                <div className="flex flex-col items-center text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100">
                    <Sparkles className="h-6 w-6 text-primary-600" />
                  </div>
                  <h3 className="mt-6 text-xl font-semibold text-gray-900">
                    Get smart matches
                  </h3>
                  <p className="mt-3 text-gray-600">
                    See activities ranked by relevance to your skills,
                    interests, and location.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="rounded-2xl bg-white p-8 shadow-sm">
                <div className="flex flex-col items-center text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100">
                    <Users className="h-6 w-6 text-primary-600" />
                  </div>
                  <h3 className="mt-6 text-xl font-semibold text-gray-900">
                    Make an impact
                  </h3>
                  <p className="mt-3 text-gray-600">
                    Connect directly with organizations and start volunteering
                    today.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section - Clean with Purple */}
        <section className="py-20">
          <div className="container-custom">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Ready to make a difference?
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Join thousands of volunteers making an impact in their
                communities.
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
                <Link href={ROUTES.SEARCH}>
                  <Button size="lg" variant="primary" className="w-full sm:w-auto">
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
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
