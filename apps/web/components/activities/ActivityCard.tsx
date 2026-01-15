import type { Activity } from '@action-atlas/types';
import { MapPin, Clock, Award } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ROUTES, ACTIVITY_CATEGORIES } from '@/lib/constants';
import { truncate, formatLocationShort } from '@/lib/utils';

export interface ActivityCardProps {
  activity: Activity;
  relevanceScore?: number;
  distance?: number;
}

export function ActivityCard({
  activity,
  relevanceScore,
  distance,
}: ActivityCardProps) {
  const categoryLabel =
    ACTIVITY_CATEGORIES[activity.category]?.label ?? activity.category;

  // Seed data uses cuid instead of activityId
  const activityId = activity.activityId || (activity as any).cuid || (activity as any)._id;

  // Seed data uses shortDescription field
  const description = (activity as any).shortDescription || activity.description;

  // Seed data may have coverImageUrl
  const coverImageUrl = (activity as any).coverImageUrl;

  return (
    <Link href={ROUTES.ACTIVITY(activityId)}>
      <Card className="card-hover h-full transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal-md overflow-hidden">
        {/* Cover Image */}
        {coverImageUrl && (
          <div className="relative w-full h-48 bg-muted">
            <Image
              src={coverImageUrl}
              alt={activity.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        )}

        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="line-clamp-2 text-xl">
              {activity.title}
            </CardTitle>
            {relevanceScore && relevanceScore > 0.8 && (
              <Badge variant="success" className="shrink-0">
                Match
              </Badge>
            )}
          </div>
          <CardDescription className="line-clamp-2">
            {truncate(description, 120)}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Category */}
          <div>
            <Badge variant="secondary">{categoryLabel}</Badge>
          </div>

          {/* Location */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 shrink-0" />
            <span>{formatLocationShort(activity.location)}</span>
            {distance !== undefined && (
              <span className="text-xs">({(distance / 1000).toFixed(0)} km)</span>
            )}
          </div>

          {/* Time Commitment */}
          {activity.timeCommitment?.hoursPerWeek && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4 shrink-0" />
              <span>{activity.timeCommitment.hoursPerWeek} hours/week</span>
              {activity.timeCommitment.isFlexible && (
                <span className="text-xs">(flexible)</span>
              )}
            </div>
          )}

          {/* Skills */}
          {activity.skills && Array.isArray(activity.skills) && activity.skills.length > 0 && (
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <Award className="h-4 w-4 shrink-0 mt-0.5" />
              <div className="flex flex-wrap gap-1">
                {activity.skills.slice(0, 3).map((skill, index) => (
                  <span
                    key={index}
                    className="rounded-sm bg-gray-100 border border-gray-300 px-2 py-0.5 text-xs font-medium"
                  >
                    {skill.name}
                  </span>
                ))}
                {activity.skills.length > 3 && (
                  <span className="text-xs">
                    +{activity.skills.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
