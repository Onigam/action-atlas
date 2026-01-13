'use client';

import { useParams } from 'next/navigation';
import * as React from 'react';

import { ActivityDetail } from '@/components/activities/ActivityDetail';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { useActivity } from '@/lib/hooks';

export default function ActivityPage() {
  const params = useParams();
  const id = params?.['id'] as string;

  const { data: activity, isLoading, error } = useActivity(id);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-primary-50 via-secondary-50 to-accent-50">
        <div className="container-custom py-12">
          {isLoading && (
            <div className="space-y-6">
              <div className="h-12 w-3/4 animate-pulse rounded-xl border-3 border-black bg-gradient-to-r from-primary-200 to-secondary-200 shadow-brutal" />
              <div className="h-6 w-1/4 animate-pulse rounded-xl border-3 border-black bg-gradient-to-r from-primary-200 to-secondary-200 shadow-brutal" />
              <div className="h-64 w-full animate-pulse rounded-2xl border-3 border-black bg-gradient-to-br from-white via-primary-50 to-secondary-50 shadow-brutal-lg" />
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-3xl border-4 border-black bg-destructive-500 p-12 shadow-brutal-xl">
                <div className="mb-6 text-7xl">⚠️</div>
                <h1 className="mb-3 text-3xl font-black uppercase tracking-tight text-black">
                  Activity not found
                </h1>
                <p className="text-base font-bold text-black/80">
                  The activity you&apos;re looking for doesn&apos;t exist or has been
                  removed.
                </p>
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
