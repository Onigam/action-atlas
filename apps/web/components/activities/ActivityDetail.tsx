'use client';

import type { SearchResult } from '@action-atlas/types';
import {
  MapPin,
  Clock,
  Award,
  Mail,
  Phone,
  Globe,
  Calendar,
  Share2,
  Building,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ACTIVITY_CATEGORIES, ROUTES } from '@/lib/constants';
import { formatDate, formatLocationShort } from '@/lib/utils';

export interface ActivityDetailProps {
  activity: SearchResult;
}

export function ActivityDetail({ activity }: ActivityDetailProps) {
  // Get category labels - handle both array and legacy single value
  const categories: string[] = Array.isArray(activity.category)
    ? activity.category
    : activity.category
      ? [activity.category]
      : [];

  const categoryLabels = categories.map(
    (cat) => ACTIVITY_CATEGORIES[cat]?.label ?? cat
  );

  // Seed data uses charity field instead of organizationId
  const organizationId = activity.organizationId || activity.charity || '';

  // Seed data may have coverImageUrl
  const coverImageUrl = activity.coverImageUrl || undefined;

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: activity.title,
          text: (activity.description || '').slice(0, 160),
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        alert('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <div className="space-y-8">
      {/* Cover Image */}
      {coverImageUrl && (
        <div className="relative w-full h-64 md:h-96 -mx-4 md:mx-0 rounded-none md:rounded-2xl overflow-hidden bg-gray-50 shadow-sm">
          <Image
            src={coverImageUrl}
            alt={activity.title}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 1200px"
          />
        </div>
      )}

      {/* Header */}
      <div className="space-y-6 rounded-2xl bg-white p-8 shadow-sm border border-gray-200">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {categoryLabels.map((label, index) => (
              <Badge key={index} variant="primary" className="text-sm">
                {label}
              </Badge>
            ))}
            {activity.timeCommitment?.isFlexible && (
              <Badge variant="secondary" className="text-sm">
                Flexible Schedule
              </Badge>
            )}
            {activity.timeCommitment?.isOneTime && (
              <Badge variant="secondary" className="text-sm">
                One-time
              </Badge>
            )}
            {activity.timeCommitment?.isRecurring && (
              <Badge variant="secondary" className="text-sm">
                Recurring
              </Badge>
            )}
          </div>

          <Button variant="outline" size="sm" onClick={() => void handleShare()}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>

        <h1 className="text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
          {activity.title}
        </h1>

        <div className="flex flex-wrap items-center gap-3">
          {organizationId && organizationId.trim() && (
            <Link
              href={ROUTES.ORGANIZATION(organizationId)}
              className="group flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm transition-all hover:shadow hover:border-primary-300"
            >
              <Building className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700 group-hover:text-primary-600">
                View Organization
              </span>
            </Link>
          )}
          <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-primary-50 px-3 py-2 shadow-sm">
            <MapPin className="h-4 w-4 text-primary-600" />
            <span className="text-sm font-medium text-gray-700">
              {formatLocationShort(activity.location)}
            </span>
          </div>
          {activity.timeCommitment?.hoursPerWeek && (
            <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 shadow-sm">
              <Clock className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">
                {activity.timeCommitment.hoursPerWeek} hours/week
              </span>
            </div>
          )}
          <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 shadow-sm">
            <Calendar className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">
              Posted {formatDate(activity.createdAt)}
            </span>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <h2 className="mb-4 text-3xl font-bold tracking-tight text-gray-900">
          About this opportunity
        </h2>
        <p className="whitespace-pre-wrap text-base leading-relaxed text-gray-700">
          {activity.description}
        </p>
      </div>

      {/* Skills Required */}
      {activity.skills && Array.isArray(activity.skills) && activity.skills.length > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <h2 className="mb-6 text-3xl font-bold tracking-tight text-gray-900">
            Skills
          </h2>
          <div className="flex flex-wrap gap-3">
            {activity.skills.map((skill, index) => (
              <div
                key={index}
                className="group flex items-center gap-2 rounded-lg border border-gray-200 bg-primary-50 px-4 py-3 shadow-sm transition-all hover:shadow hover:border-primary-300"
              >
                <Award className="h-5 w-5 text-primary-600" />
                <span className="font-medium text-gray-900">{skill.name}</span>
                {skill.level && (
                  <Badge variant="outline" className="text-xs">
                    {skill.level}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Schedule */}
      {activity.timeCommitment?.schedule && (
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-8 shadow-sm">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-gray-900">
            Schedule
          </h2>
          <p className="text-base font-medium leading-relaxed text-gray-700">
            {activity.timeCommitment.schedule}
          </p>
        </div>
      )}

      {/* Contact Information */}
      <div className="rounded-2xl border border-gray-200 bg-primary-50 p-8 shadow-sm">
        <h2 className="mb-6 text-3xl font-bold tracking-tight text-gray-900">
          Contact Information
        </h2>
        <div className="space-y-4">
          <div className="flex items-start gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="rounded-lg bg-primary-100 border border-primary-200 p-2">
              <Mail className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <div className="font-bold text-gray-900">
                {activity.contact.name}
                {/* Seed data uses surname field */}
                {activity.contact.surname && ` ${activity.contact.surname}`}
              </div>
              {activity.contact.role && (
                <div className="text-sm font-medium text-gray-600">
                  {activity.contact.role}
                </div>
              )}
              <a
                href={`mailto:${activity.contact.email}`}
                className="text-sm font-medium text-primary-600 hover:underline"
              >
                {activity.contact.email}
              </a>
            </div>
          </div>

          {activity.contact.phone && (
            <div className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <div className="rounded-lg bg-gray-100 border border-gray-200 p-2">
                <Phone className="h-5 w-5 text-gray-600" />
              </div>
              <a
                href={`tel:${activity.contact.phone}`}
                className="font-medium text-primary-600 hover:underline"
              >
                {activity.contact.phone}
              </a>
            </div>
          )}

          {activity.website && (
            <div className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <div className="rounded-lg bg-gray-100 border border-gray-200 p-2">
                <Globe className="h-5 w-5 text-gray-600" />
              </div>
              <a
                href={activity.website}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary-600 hover:underline"
              >
                Visit website
              </a>
            </div>
          )}
        </div>

        <div className="mt-8">
          <Button size="lg" className="w-full text-lg sm:w-auto">
            Apply Now
          </Button>
        </div>
      </div>

      {/* Location Details */}
      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <h2 className="mb-6 text-3xl font-bold tracking-tight text-gray-900">
          Location
        </h2>
        <div className="space-y-4">
          <div className="rounded-lg border border-gray-200 bg-primary-50 p-4 shadow-sm">
            <div className="space-y-1 text-sm font-medium text-gray-700">
              {/* Handle both new structure (address object) and legacy (string) */}
              {typeof activity.location === 'object' && activity.location.address ? (
                <>
                  {activity.location.address.street && (
                    <p>{activity.location.address.street}</p>
                  )}
                  <p>
                    {activity.location.address.city}
                    {activity.location.address.state &&
                      `, ${activity.location.address.state}`}
                    {activity.location.address.postalCode &&
                      ` ${activity.location.address.postalCode}`}
                  </p>
                  <p>{activity.location.address.country}</p>
                </>
              ) : (
                <p>{formatLocationShort(activity.location)}</p>
              )}
            </div>
          </div>
          {/* Map placeholder */}
          <div className="flex h-64 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 shadow-sm">
            <div className="text-center">
              <div className="mb-2 text-5xl">🗺️</div>
              <p className="text-sm font-medium text-gray-500">
                Map view coming soon...
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
