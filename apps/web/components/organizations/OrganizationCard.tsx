import type { Organization } from '@action-atlas/types';
import { MapPin, Globe, Mail } from 'lucide-react';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { MarkdownContent } from '@/components/ui/markdown-content';
import { ROUTES } from '@/lib/constants';
import { formatLegacyLocationShort } from '@/lib/utils';

export interface OrganizationCardProps {
  organization: Organization;
  activityCount?: number;
}

export function OrganizationCard({
  organization,
  activityCount,
}: OrganizationCardProps) {
  const statusColor: Record<string, 'success' | 'warning' | 'destructive'> = {
    verified: 'success',
    pending: 'warning',
    rejected: 'destructive',
    suspended: 'destructive',
  };

  return (
    <Link href={ROUTES.ORGANIZATION(organization.organizationId)}>
      <Card className="card-hover h-full transition-all hover:border-primary-200">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3">
              {organization.logo && (
                <img
                  src={organization.logo}
                  alt={`${organization.name} logo`}
                  className="h-12 w-12 rounded-lg object-cover"
                />
              )}
              <div>
                <CardTitle className="line-clamp-1 text-xl">
                  {organization.name}
                </CardTitle>
                <Badge
                  variant={statusColor[organization.status] || 'secondary'}
                  className="mt-1"
                >
                  {organization.status}
                </Badge>
              </div>
            </div>
          </div>
          <MarkdownContent
            content={organization.description}
            truncate
            lineClamp={2}
            className="mt-2"
          />
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Location */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 shrink-0" />
            <span>{formatLegacyLocationShort(organization.location)}</span>
          </div>

          {/* Email */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="h-4 w-4 shrink-0" />
            <span className="truncate">{organization.email}</span>
          </div>

          {/* Website */}
          {organization.website && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Globe className="h-4 w-4 shrink-0" />
              <span className="truncate">{organization.website}</span>
            </div>
          )}

          {/* Activity Count */}
          {activityCount !== undefined && (
            <div className="pt-2 border-t">
              <span className="text-sm font-medium">
                {activityCount} {activityCount === 1 ? 'activity' : 'activities'}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
