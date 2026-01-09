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
      <main className="min-h-screen bg-background">
        <div className="container-custom py-12">
          {isLoading && (
            <div className="space-y-4">
              <div className="skeleton h-12 w-3/4" />
              <div className="skeleton h-6 w-1/4" />
              <div className="skeleton h-64 w-full" />
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 text-6xl">⚠️</div>
              <h1 className="mb-2 text-2xl font-semibold">Activity not found</h1>
              <p className="text-muted-foreground">
                The activity you&apos;re looking for doesn&apos;t exist or has been
                removed.
              </p>
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
