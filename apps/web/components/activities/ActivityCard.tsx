import type { Activity } from '@action-atlas/types';
import { MapPin, Clock, Award } from 'lucide-react';
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

  return (
    <Link href={ROUTES.ACTIVITY(activity.activityId)}>
      <Card className="card-hover h-full transition-all hover:border-primary-200">
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
            {truncate(activity.description, 120)}
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
              <span className="text-xs">({distance.toFixed(1)} km)</span>
            )}
          </div>

          {/* Time Commitment */}
          {activity.timeCommitment.hoursPerWeek && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4 shrink-0" />
              <span>{activity.timeCommitment.hoursPerWeek} hours/week</span>
              {activity.timeCommitment.isFlexible && (
                <span className="text-xs">(flexible)</span>
              )}
            </div>
          )}

          {/* Skills */}
          {activity.skills.length > 0 && (
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <Award className="h-4 w-4 shrink-0 mt-0.5" />
              <div className="flex flex-wrap gap-1">
                {activity.skills.slice(0, 3).map((skill, index) => (
                  <span
                    key={index}
                    className="rounded-md bg-muted px-2 py-0.5 text-xs"
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
