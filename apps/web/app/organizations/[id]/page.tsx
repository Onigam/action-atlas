'use client';

import { MapPin, Mail, Phone, Globe, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import * as React from 'react';

import { ActivityCard } from '@/components/activities/ActivityCard';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { Badge } from '@/components/ui/badge';
import { MarkdownContent } from '@/components/ui/markdown-content';
import { ROUTES } from '@/lib/constants';
import { useOrganization, useOrganizationActivities } from '@/lib/hooks';
import { formatLegacyLocationShort } from '@/lib/utils';

export default function OrganizationPage() {
  const params = useParams();
  const id = params?.['id'] as string;

  const { data: organization, isLoading, error } = useOrganization(id);
  const {
    data: activitiesData,
    isLoading: activitiesLoading,
  } = useOrganizationActivities(id);

  const activities = activitiesData?.activities || [];

  const statusVariant: Record<string, 'success' | 'warning' | 'destructive' | 'muted'> = {
    verified: 'success',
    pending: 'warning',
    rejected: 'destructive',
    suspended: 'destructive',
  };

  // Loading state
  if (isLoading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gradient-to-b from-zinc-50 to-white">
          <div className="container-custom py-8 md:py-12">
            <div className="space-y-6">
              <div className="h-20 w-20 animate-pulse rounded-xl bg-zinc-100" />
              <div className="h-10 w-3/4 animate-pulse rounded-lg bg-zinc-100" />
              <div className="h-5 w-1/2 animate-pulse rounded-lg bg-zinc-100" />
              <div className="h-32 w-full animate-pulse rounded-xl bg-zinc-100" />
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // Error state
  if (error || !organization) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gradient-to-b from-zinc-50 to-white">
          <div className="container-custom py-8 md:py-12">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-xl border border-zinc-200 bg-white p-12 shadow-sm">
                <div className="mb-6 text-5xl">🔍</div>
                <h1 className="mb-3 text-2xl font-semibold text-zinc-900">
                  Organization not found
                </h1>
                <p className="text-zinc-600">
                  The organization you&apos;re looking for doesn&apos;t exist or has been
                  removed.
                </p>
                <Link
                  href={ROUTES.HOME}
                  className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-teal-600 transition-colors hover:text-teal-700"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to home
                </Link>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-zinc-50 to-white">
        {/* Back link */}
        <div className="container-custom pt-8">
          <Link
            href={ROUTES.SEARCH}
            className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 transition-colors hover:text-teal-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to activities
          </Link>
        </div>

        {/* Organization Header */}
        <div className="container-custom py-8">
          <div className="rounded-xl border border-zinc-100 bg-white p-6 shadow-sm md:p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-start">
              {organization.logo && (
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-zinc-200 shadow-sm">
                  <img
                    src={organization.logo}
                    alt={`${organization.name} logo`}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}

              <div className="flex-1 space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-semibold text-zinc-900 md:text-3xl">
                    {organization.name}
                  </h1>
                  <Badge variant={statusVariant[organization.status] || 'muted'}>
                    {organization.status}
                  </Badge>
                </div>

                <div className="text-zinc-600">
                  <MarkdownContent content={organization.description} />
                </div>

                {organization.mission && (
                  <div className="rounded-lg border border-zinc-100 bg-zinc-50 p-4">
                    <h2 className="mb-2 text-sm font-semibold text-zinc-900">
                      Mission
                    </h2>
                    <div className="text-sm text-zinc-600">
                      <MarkdownContent content={organization.mission} />
                    </div>
                  </div>
                )}

                {/* Contact info */}
                <div className="flex flex-wrap gap-3 pt-2">
                  <div className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2">
                    <MapPin className="h-4 w-4 text-zinc-500" />
                    <span className="text-sm text-zinc-600">
                      {formatLegacyLocationShort(organization.location)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2">
                    <Mail className="h-4 w-4 text-zinc-500" />
                    <a
                      href={`mailto:${organization.email}`}
                      className="text-sm font-medium text-teal-600 transition-colors hover:text-teal-700"
                    >
                      {organization.email}
                    </a>
                  </div>
                  {organization.phone && (
                    <div className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2">
                      <Phone className="h-4 w-4 text-zinc-500" />
                      <a
                        href={`tel:${organization.phone}`}
                        className="text-sm font-medium text-teal-600 transition-colors hover:text-teal-700"
                      >
                        {organization.phone}
                      </a>
                    </div>
                  )}
                  {organization.website && (
                    <div className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2">
                      <Globe className="h-4 w-4 text-zinc-500" />
                      <a
                        href={organization.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-teal-600 transition-colors hover:text-teal-700"
                      >
                        Visit website
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Activities List */}
        <div className="container-custom pb-12">
          <div className="mb-6 rounded-xl border border-zinc-100 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-zinc-900">
              Activities
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              {activitiesLoading
                ? 'Loading activities...'
                : `${activities.length} ${activities.length === 1 ? 'activity' : 'activities'}`}
            </p>
          </div>

          {activitiesLoading ? (
            <div className="grid gap-6 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-64 animate-pulse rounded-xl bg-zinc-100"
                />
              ))}
            </div>
          ) : activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-xl border border-zinc-100 bg-white p-12 shadow-sm">
                <div className="mb-4 text-4xl">📋</div>
                <h3 className="mb-2 text-lg font-semibold text-zinc-900">
                  No activities yet
                </h3>
                <p className="text-zinc-600">
                  This organization hasn&apos;t posted any volunteering activities yet.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {activities.map((activity) => (
                <ActivityCard key={activity.activityId} activity={activity} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
