'use client';

import type { SearchResult } from '@action-atlas/types';
import {
  MapPin,
  Clock,
  Award,
  Mail,
  Phone,
  Calendar,
  Share2,
  Building,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MarkdownContent } from '@/components/ui/markdown-content';
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
    <div className="space-y-6">
      {/* Cover Image */}
      {coverImageUrl && (
        <div className="relative -mx-4 h-64 w-[calc(100%+2rem)] overflow-hidden rounded-none bg-zinc-100 shadow-md md:mx-0 md:h-96 md:w-full md:rounded-xl">
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
      <div className="space-y-5 rounded-xl border border-zinc-100 bg-white p-6 shadow-sm md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {categoryLabels.map((label, index) => (
              <Badge key={index} variant="muted" className="text-sm">
                {label}
              </Badge>
            ))}
            {activity.timeCommitment?.isFlexible && (
              <Badge variant="subtle" className="text-sm">
                Flexible Schedule
              </Badge>
            )}
            {activity.timeCommitment?.isOneTime && (
              <Badge variant="subtle" className="text-sm">
                One-time
              </Badge>
            )}
            {activity.timeCommitment?.isRecurring && (
              <Badge variant="subtle" className="text-sm">
                Recurring
              </Badge>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => void handleShare()}
            className="border-zinc-200 text-zinc-600 transition-colors hover:border-zinc-300 hover:text-zinc-900"
          >
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
        </div>

        <h1 className="text-2xl font-semibold text-zinc-900 md:text-3xl">
          {activity.title}
        </h1>

        <div className="flex flex-wrap items-center gap-3">
          {organizationId && organizationId.trim() && (
            <Link
              href={ROUTES.ORGANIZATION(organizationId)}
              className="group flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 transition-all hover:border-teal-300 hover:shadow-sm"
            >
              <Building className="h-4 w-4 text-zinc-500 transition-colors group-hover:text-teal-600" />
              <span className="text-sm font-medium text-teal-600 transition-colors group-hover:text-teal-700">
                View Organization
              </span>
            </Link>
          )}
          <div className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2">
            <MapPin className="h-4 w-4 text-zinc-500" />
            <span className="text-sm text-zinc-500">
              {formatLocationShort(activity.geolocations, activity.language)}
            </span>
          </div>
          {activity.timeCommitment?.hoursPerWeek && (
            <div className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2">
              <Clock className="h-4 w-4 text-zinc-500" />
              <span className="text-sm text-zinc-500">
                {activity.timeCommitment.hoursPerWeek} hours/week
              </span>
            </div>
          )}
          <div className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2">
            <Calendar className="h-4 w-4 text-zinc-500" />
            <span className="text-sm text-zinc-500">
              Posted {formatDate(activity.createdAt)}
            </span>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="rounded-xl border border-zinc-100 bg-white p-6 shadow-sm md:p-8">
        <h2 className="mb-4 text-xl font-semibold text-zinc-900">
          About this opportunity
        </h2>
        <div className="text-zinc-600">
          <MarkdownContent content={activity.description || ''} />
        </div>
      </div>

      {/* Skills Required */}
      {activity.skills && Array.isArray(activity.skills) && activity.skills.length > 0 && (
        <div className="rounded-xl border border-zinc-100 bg-white p-6 shadow-sm md:p-8">
          <h2 className="mb-5 text-xl font-semibold text-zinc-900">
            Skills
          </h2>
          <div className="flex flex-wrap gap-2">
            {activity.skills.map((skill, index) => (
              <div
                key={index}
                className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 transition-colors hover:border-teal-200 hover:bg-teal-50"
              >
                <Award className="h-4 w-4 text-teal-600" />
                <span className="text-sm font-medium text-zinc-700">{skill}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Schedule */}
      {activity.timeCommitment?.schedule && (
        <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-6 shadow-sm md:p-8">
          <h2 className="mb-4 text-xl font-semibold text-zinc-900">
            Schedule
          </h2>
          <p className="text-zinc-600">
            {activity.timeCommitment.schedule}
          </p>
        </div>
      )}

      {/* Contact Information */}
      <div className="rounded-xl border border-zinc-100 bg-white p-6 shadow-sm md:p-8">
        <h2 className="mb-5 text-xl font-semibold text-zinc-900">
          Contact Information
        </h2>
        <div className="space-y-3">
          <div className="flex items-start gap-4 rounded-lg border border-zinc-100 bg-zinc-50 p-4">
            <div className="rounded-lg bg-teal-50 p-2">
              <Mail className="h-5 w-5 text-teal-600" />
            </div>
            <div>
              <div className="font-medium text-zinc-900">
                {activity.contact.name}
              </div>
              {activity.contact.role && (
                <div className="text-sm text-zinc-500">
                  {activity.contact.role}
                </div>
              )}
              <a
                href={`mailto:${activity.contact.email}`}
                className="text-sm font-medium text-teal-600 transition-colors hover:text-teal-700"
              >
                {activity.contact.email}
              </a>
            </div>
          </div>

          {activity.contact.phone && (
            <div className="flex items-center gap-4 rounded-lg border border-zinc-100 bg-zinc-50 p-4">
              <div className="rounded-lg bg-zinc-100 p-2">
                <Phone className="h-5 w-5 text-zinc-600" />
              </div>
              <a
                href={`tel:${activity.contact.phone}`}
                className="font-medium text-teal-600 transition-colors hover:text-teal-700"
              >
                {activity.contact.phone}
              </a>
            </div>
          )}
        </div>

        <div className="mt-6">
          <Button variant="soft" size="lg" className="w-full sm:w-auto">
            Apply Now
          </Button>
        </div>
      </div>

      {/* Location Details */}
      <div className="rounded-xl border border-zinc-100 bg-white p-6 shadow-sm md:p-8">
        <h2 className="mb-5 text-xl font-semibold text-zinc-900">
          Location
        </h2>
        <div className="space-y-4">
          <div className="rounded-lg border border-zinc-100 bg-zinc-50 p-4">
            <div className="flex items-center gap-2 text-zinc-600">
              <MapPin className="h-4 w-4 text-zinc-500" />
              <span>{formatLocationShort(activity.geolocations, activity.language)}</span>
            </div>
          </div>
          {/* Map placeholder */}
          <div className="flex h-48 items-center justify-center rounded-lg border border-zinc-100 bg-zinc-50">
            <div className="text-center">
              <div className="mb-2 text-4xl">🗺️</div>
              <p className="text-sm text-zinc-500">
                Map view coming soon
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
