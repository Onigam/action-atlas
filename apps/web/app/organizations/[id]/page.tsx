'use client';

import { MapPin, Mail, Phone, Globe } from 'lucide-react';
import { useParams } from 'next/navigation';
import * as React from 'react';

import { ActivityCard } from '@/components/activities/ActivityCard';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { Badge } from '@/components/ui/badge';
import { useOrganization, useOrganizationActivities } from '@/lib/hooks';
import { formatLocationShort } from '@/lib/utils';

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
        <main className="min-h-screen bg-background">
          <div className="container-custom py-12">
            <div className="space-y-4">
              <div className="skeleton h-24 w-24 rounded-xl" />
              <div className="skeleton h-12 w-3/4" />
              <div className="skeleton h-6 w-1/2" />
              <div className="skeleton h-32 w-full" />
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
        <main className="min-h-screen bg-background">
          <div className="container-custom py-12">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="mb-4 text-6xl">⚠️</div>
              <h1 className="mb-2 text-2xl font-semibold">Organization not found</h1>
              <p className="text-muted-foreground">
                The organization you&apos;re looking for doesn&apos;t exist or has been
                removed.
              </p>
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
      <main className="min-h-screen bg-background">
        {/* Organization Header */}
        <div className="border-b bg-muted/30">
          <div className="container-custom py-12">
            <div className="flex flex-col gap-6 md:flex-row md:items-start">
              {organization.logo && (
                <img
                  src={organization.logo}
                  alt={`${organization.name} logo`}
                  className="h-24 w-24 rounded-xl object-cover shadow-md"
                />
              )}

              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h1 className="text-4xl font-bold">{organization.name}</h1>
                  <Badge variant={statusColor[organization.status] || 'secondary'}>
                    {organization.status}
                  </Badge>
                </div>

                <p className="text-lg text-muted-foreground mb-6">
                  {organization.description}
                </p>

                {organization.mission && (
                  <div className="mb-6">
                    <h2 className="text-sm font-semibold text-foreground mb-2">
                      Mission
                    </h2>
                    <p className="text-muted-foreground">{organization.mission}</p>
                  </div>
                )}

                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{formatLocationShort(organization.location)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <a
                      href={`mailto:${organization.email}`}
                      className="hover:text-primary"
                    >
                      {organization.email}
                    </a>
                  </div>
                  {organization.phone && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <a
                        href={`tel:${organization.phone}`}
                        className="hover:text-primary"
                      >
                        {organization.phone}
                      </a>
                    </div>
                  )}
                  {organization.website && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Globe className="h-4 w-4" />
                      <a
                        href={organization.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-primary"
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
          <div className="mb-8">
            <h2 className="text-3xl font-bold">Activities</h2>
            <p className="mt-2 text-muted-foreground">
              {activitiesLoading
                ? 'Loading activities...'
                : `${activities.length} ${activities.length === 1 ? 'activity' : 'activities'}`}
            </p>
          </div>

          {activitiesLoading ? (
            <div className="grid gap-6 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="skeleton h-64 rounded-xl" />
              ))}
            </div>
          ) : activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 text-6xl">📋</div>
              <h3 className="text-xl font-semibold mb-2">No activities yet</h3>
              <p className="text-muted-foreground">
                This organization hasn&apos;t posted any volunteering activities yet.
              </p>
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
