'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import * as React from 'react';

import { ActivityDetail } from '@/components/activities/ActivityDetail';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { ROUTES } from '@/lib/constants';
import { useActivity } from '@/lib/hooks';

export default function ActivityPage() {
  const params = useParams();
  const id = params?.['id'] as string;

  const { data: activity, isLoading, error } = useActivity(id);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-zinc-50 to-white">
        <div className="container-custom py-8 md:py-12">
          {/* Back link */}
          <Link
            href={ROUTES.SEARCH}
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-zinc-500 transition-colors hover:text-teal-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to activities
          </Link>

          {isLoading && (
            <div className="space-y-6">
              <div className="h-10 w-3/4 animate-pulse rounded-lg bg-zinc-100" />
              <div className="h-5 w-1/4 animate-pulse rounded-lg bg-zinc-100" />
              <div className="h-64 w-full animate-pulse rounded-xl bg-zinc-100" />
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-xl border border-zinc-200 bg-white p-12 shadow-sm">
                <div className="mb-6 text-5xl">🔍</div>
                <h1 className="mb-3 text-2xl font-semibold text-zinc-900">
                  Activity not found
                </h1>
                <p className="text-zinc-600">
                  The activity you&apos;re looking for doesn&apos;t exist or has been
                  removed.
                </p>
                <Link
                  href={ROUTES.SEARCH}
                  className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-teal-600 transition-colors hover:text-teal-700"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to activities
                </Link>
              </div>
            </div>
          )}

          {activity && !isLoading && !error && (
            <ActivityDetail activity={activity} />
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
