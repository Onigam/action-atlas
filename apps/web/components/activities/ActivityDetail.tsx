'use client';

import type { Activity } from '@action-atlas/types';
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
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ACTIVITY_CATEGORIES, ROUTES } from '@/lib/constants';
import { formatDate, formatLocationShort } from '@/lib/utils';

export interface ActivityDetailProps {
  activity: Activity;
}

export function ActivityDetail({ activity }: ActivityDetailProps) {
  const categoryLabel =
    ACTIVITY_CATEGORIES[activity.category]?.label ?? activity.category;

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: activity.title,
          text: activity.description.slice(0, 160),
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
      {/* Header */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="primary">{categoryLabel}</Badge>
            {activity.timeCommitment.isFlexible && (
              <Badge variant="secondary">Flexible Schedule</Badge>
            )}
            {activity.timeCommitment.isOneTime && (
              <Badge variant="secondary">One-time</Badge>
            )}
            {activity.timeCommitment.isRecurring && (
              <Badge variant="secondary">Recurring</Badge>
            )}
          </div>

          <Button variant="ghost" size="sm" onClick={() => void handleShare()}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>

        <h1 className="text-4xl font-bold tracking-tight">{activity.title}</h1>

        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <Link
            href={ROUTES.ORGANIZATION(activity.organizationId)}
            className="flex items-center gap-2 hover:text-foreground transition-colors"
          >
            <Building className="h-4 w-4" />
            <span className="hover:underline">View Organization</span>
          </Link>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>{formatLocationShort(activity.location)}</span>
          </div>
          {activity.timeCommitment.hoursPerWeek && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{activity.timeCommitment.hoursPerWeek} hours/week</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Posted {formatDate(activity.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="prose prose-gray max-w-none">
        <h2 className="text-2xl font-semibold">About this opportunity</h2>
        <p className="text-muted-foreground whitespace-pre-wrap">
          {activity.description}
        </p>
      </div>

      {/* Skills Required */}
      {activity.skills.length > 0 && (
        <div>
          <h2 className="mb-4 text-2xl font-semibold">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {activity.skills.map((skill, index) => (
              <div
                key={index}
                className="flex items-center gap-2 rounded-lg border bg-card px-4 py-2"
              >
                <Award className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{skill.name}</span>
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
      {activity.timeCommitment.schedule && (
        <div>
          <h2 className="mb-4 text-2xl font-semibold">Schedule</h2>
          <p className="text-muted-foreground">{activity.timeCommitment.schedule}</p>
        </div>
      )}

      {/* Contact Information */}
      <div className="rounded-xl border bg-card p-6">
        <h2 className="mb-4 text-2xl font-semibold">Contact Information</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-muted-foreground" />
            <div>
              <div className="font-medium">{activity.contact.name}</div>
              <div className="text-sm text-muted-foreground">
                {activity.contact.role}
              </div>
              <a
                href={`mailto:${activity.contact.email}`}
                className="text-sm text-primary hover:underline"
              >
                {activity.contact.email}
              </a>
            </div>
          </div>

          {activity.contact.phone && (
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-muted-foreground" />
              <a
                href={`tel:${activity.contact.phone}`}
                className="text-primary hover:underline"
              >
                {activity.contact.phone}
              </a>
            </div>
          )}

          {activity.website && (
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5 text-muted-foreground" />
              <a
                href={activity.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Visit website
              </a>
            </div>
          )}
        </div>

        <div className="mt-6">
          <Button size="lg" className="w-full sm:w-auto">
            Apply Now
          </Button>
        </div>
      </div>

      {/* Location Details */}
      <div>
        <h2 className="mb-4 text-2xl font-semibold">Location</h2>
        <div className="rounded-xl border bg-card p-6">
          <div className="space-y-1 text-sm">
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
          </div>
          {/* Map placeholder */}
          <div className="mt-4 flex h-64 items-center justify-center rounded-lg bg-muted">
            <p className="text-sm text-muted-foreground">
              Map view coming soon...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
