'use client';

import { MapPin, Mail, Phone, Globe } from 'lucide-react';
import { useParams } from 'next/navigation';
import * as React from 'react';

import { ActivityCard } from '@/components/activities/ActivityCard';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { Badge } from '@/components/ui/badge';
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

  const statusColor: Record<string, 'success' | 'warning' | 'destructive'> = {
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
        <main className="min-h-screen bg-gradient-to-br from-primary-50 via-secondary-50 to-accent-50">
          <div className="container-custom py-12">
            <div className="space-y-6">
              <div className="h-24 w-24 animate-pulse rounded-2xl border-3 border-black bg-gradient-to-r from-primary-200 to-secondary-200 shadow-brutal" />
              <div className="h-12 w-3/4 animate-pulse rounded-xl border-3 border-black bg-gradient-to-r from-primary-200 to-secondary-200 shadow-brutal" />
              <div className="h-6 w-1/2 animate-pulse rounded-xl border-3 border-black bg-gradient-to-r from-primary-200 to-secondary-200 shadow-brutal" />
              <div className="h-32 w-full animate-pulse rounded-xl border-3 border-black bg-gradient-to-r from-primary-200 to-secondary-200 shadow-brutal" />
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
        <main className="min-h-screen bg-gradient-to-br from-primary-50 via-secondary-50 to-accent-50">
          <div className="container-custom py-12">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="rounded-3xl border-4 border-black bg-destructive-500 p-12 shadow-brutal-xl">
                <div className="mb-6 text-7xl">⚠️</div>
                <h1 className="mb-3 text-3xl font-black uppercase tracking-tight text-black">
                  Organization not found
                </h1>
                <p className="text-base font-bold text-black/80">
                  The organization you&apos;re looking for doesn&apos;t exist or has been
                  removed.
                </p>
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
      <main className="min-h-screen bg-gradient-to-br from-primary-50 via-secondary-50 to-accent-50">
        {/* Organization Header - Colorful Gradient */}
        <div className="border-b-4 border-black bg-gradient-to-r from-primary-400 via-secondary-400 to-accent-400 shadow-brutal-lg">
          <div className="container-custom py-12">
            <div className="flex flex-col gap-6 md:flex-row md:items-start">
              {organization.logo && (
                <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl border-3 border-black shadow-brutal">
                  <img
                    src={organization.logo}
                    alt={`${organization.name} logo`}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}

              <div className="flex-1">
                <div className="mb-2 flex flex-wrap items-center gap-3">
                  <h1 className="text-4xl font-black uppercase tracking-tight text-black md:text-5xl">
                    {organization.name}
                  </h1>
                  <Badge variant={statusColor[organization.status] || 'secondary'}>
                    {organization.status}
                  </Badge>
                </div>

                <p className="mb-6 text-lg font-bold text-black/90">
                  {organization.description}
                </p>

                {organization.mission && (
                  <div className="mb-6 rounded-xl border-3 border-black bg-white p-4 shadow-brutal-sm">
                    <h2 className="mb-2 text-sm font-black uppercase tracking-wide text-black">
                      Mission
                    </h2>
                    <p className="font-bold text-gray-800">{organization.mission}</p>
                  </div>
                )}

                <div className="flex flex-wrap gap-3 text-sm">
                  <div className="flex items-center gap-2 rounded-lg border-2 border-black bg-primary-100 px-3 py-2 shadow-brutal-sm">
                    <MapPin className="h-4 w-4 text-black" />
                    <span className="font-bold text-black">
                      {formatLegacyLocationShort(organization.location)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg border-2 border-black bg-secondary-100 px-3 py-2 shadow-brutal-sm">
                    <Mail className="h-4 w-4 text-black" />
                    <a
                      href={`mailto:${organization.email}`}
                      className="font-bold text-black hover:underline"
                    >
                      {organization.email}
                    </a>
                  </div>
                  {organization.phone && (
                    <div className="flex items-center gap-2 rounded-lg border-2 border-black bg-accent-100 px-3 py-2 shadow-brutal-sm">
                      <Phone className="h-4 w-4 text-black" />
                      <a
                        href={`tel:${organization.phone}`}
                        className="font-bold text-black hover:underline"
                      >
                        {organization.phone}
                      </a>
                    </div>
                  )}
                  {organization.website && (
                    <div className="flex items-center gap-2 rounded-lg border-2 border-black bg-white px-3 py-2 shadow-brutal-sm">
                      <Globe className="h-4 w-4 text-black" />
                      <a
                        href={organization.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bold text-black hover:underline"
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
        <div className="container-custom py-12">
          <div className="mb-8 rounded-2xl border-3 border-black bg-white p-6 shadow-brutal">
            <h2 className="text-3xl font-black uppercase tracking-tight text-black">
              Activities
            </h2>
            <p className="mt-2 font-bold text-gray-700">
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
                  className="h-64 animate-pulse rounded-2xl border-3 border-black bg-gradient-to-br from-white via-primary-50 to-secondary-50 shadow-brutal-lg"
                />
              ))}
            </div>
          ) : activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-3xl border-4 border-black bg-gradient-to-br from-secondary-400 via-primary-400 to-accent-400 p-12 shadow-brutal-xl">
                <div className="mb-4 text-6xl">📋</div>
                <h3 className="mb-2 text-xl font-black uppercase tracking-tight text-black">
                  No activities yet
                </h3>
                <p className="font-bold text-black/80">
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
