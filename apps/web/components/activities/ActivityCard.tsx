import type { SearchResult } from '@action-atlas/types';
import { MapPin, Clock } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { ROUTES, ACTIVITY_CATEGORIES } from '@/lib/constants';
import { formatLocationShort } from '@/lib/utils';

export interface ActivityCardProps {
  activity: SearchResult;
  relevanceScore?: number;
  distance?: number;
}

export function ActivityCard({
  activity,
  relevanceScore,
  distance,
}: ActivityCardProps) {
  // Get category labels - handle both array and legacy single value
  const categories: string[] = Array.isArray(activity.category)
    ? activity.category
    : activity.category
      ? [activity.category]
      : [];

  const categoryLabels = categories.map(
    (cat) => ACTIVITY_CATEGORIES[cat]?.label ?? cat
  );

  // Seed data uses cuid instead of activityId
  const activityId = activity.activityId || activity.cuid || activity._id || '';

  // Seed data may have coverImageUrl
  const coverImageUrl = activity.coverImageUrl || undefined;

  return (
    <Link
      href={ROUTES.ACTIVITY(activityId)}
      className="group block h-full"
    >
      <article className="h-full border border-zinc-200 rounded-xl shadow-sm bg-white overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 focus-within:ring-2 focus-within:ring-teal-500/20 focus-within:border-teal-500">
        {/* Cover Image */}
        {coverImageUrl && (
          <div className="relative w-full h-40 bg-zinc-100">
            <Image
              src={coverImageUrl}
              alt=""
              fill
              className="object-cover rounded-t-xl"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {/* Title */}
          <h3 className="text-lg font-semibold text-zinc-900 line-clamp-2 group-hover:text-teal-700 transition-colors duration-200">
            {activity.title}
          </h3>

          {/* Meta row - Location and Time */}
          <div className="flex flex-wrap gap-4 mt-3 text-xs text-zinc-500">
            {/* Location */}
            <div className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 shrink-0 text-zinc-400" />
              <span>{formatLocationShort(activity.geolocations, activity.language)}</span>
              {distance !== undefined && (
                <span className="text-zinc-400">({(distance / 1000).toFixed(0)} km)</span>
              )}
            </div>

            {/* Time Commitment */}
            {activity.timeCommitment?.hoursPerWeek && (
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 shrink-0 text-zinc-400" />
                <span>
                  {activity.timeCommitment.hoursPerWeek}h/semaine
                  {activity.timeCommitment.isFlexible && ' (flexible)'}
                </span>
              </div>
            )}
          </div>

          {/* Description */}
          {activity.description && (
            <p className="text-sm text-zinc-600 line-clamp-2 mt-3">
              {activity.description.replace(/[#*_`]/g, '').substring(0, 150)}
            </p>
          )}

          {/* Categories and Match indicator */}
          <div className="flex items-center gap-2 mt-4 flex-wrap">
            {categoryLabels.map((label, index) => (
              <Badge key={index} variant="muted" className="text-xs">
                {label.toLowerCase()}
              </Badge>
            ))}

            {/* Match indicator for high relevance */}
            {relevanceScore && relevanceScore > 0.8 && (
              <Badge
                variant="muted"
                className="text-xs bg-teal-50 text-teal-700"
              >
                pertinent
              </Badge>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
