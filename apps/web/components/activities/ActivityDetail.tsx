import { useState } from 'react';
import type { SearchResult } from '@action-atlas/types';
import {
  MapPin,
  Clock,
  Award,
  Calendar,
  Share2,
  Building,
  Send,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MarkdownContent } from '@/components/ui/markdown-content';
import { ACTIVITY_CATEGORIES, ROUTES } from '@/lib/constants';
import { formatDate, formatLocationShort } from '@/lib/utils';

export interface ActivityDetailProps {
  activity: SearchResult;
}

export function ActivityDetail({ activity }: ActivityDetailProps) {
  const [showInterestForm, setShowInterestForm] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    'idle' | 'success' | 'error'
  >('idle');

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

  const handleInterestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch(
        `/api/activities/${activity._id || activity.activityId}/contact`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        }
      );

      if (!response.ok) throw new Error('Failed to submit');

      setSubmitStatus('success');
      setEmail('');
      setTimeout(() => {
        setShowInterestForm(false);
        setSubmitStatus('idle');
      }, 5000);
    } catch (error) {
      console.error('Error submitting interest:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
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
      {activity.skills &&
        Array.isArray(activity.skills) &&
        activity.skills.length > 0 && (
          <div className="rounded-xl border border-zinc-100 bg-white p-6 shadow-sm md:p-8">
            <h2 className="mb-5 text-xl font-semibold text-zinc-900">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {activity.skills.map((skill, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 transition-colors hover:border-teal-200 hover:bg-teal-50"
                >
                  <Award className="h-4 w-4 text-teal-600" />
                  <span className="text-sm font-medium text-zinc-700">
                    {skill}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      {/* Schedule */}
      {activity.timeCommitment?.schedule && (
        <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-6 shadow-sm md:p-8">
          <h2 className="mb-4 text-xl font-semibold text-zinc-900">Schedule</h2>
          <p className="text-zinc-600">{activity.timeCommitment.schedule}</p>
        </div>
      )}

      {/* Interest / Contact Form */}
      <div className="rounded-xl border border-zinc-100 bg-white p-6 shadow-sm md:p-8">
        <h2 className="mb-5 text-xl font-semibold text-zinc-900">
          I'm Interested
        </h2>

        {submitStatus === 'success' ? (
          <div className="rounded-lg border border-teal-200 bg-teal-50 p-6 text-center">
            <div className="mb-3 flex justify-center">
              <div className="rounded-full bg-teal-100 p-3">
                <Send className="h-6 w-6 text-teal-600" />
              </div>
            </div>
            <h3 className="mb-2 text-lg font-medium text-teal-900">
              Message Sent!
            </h3>
            <p className="text-teal-700">
              The organization has been notified of your interest. They will
              contact you shortly.
            </p>
          </div>
        ) : showInterestForm ? (
          <form onSubmit={handleInterestSubmit} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-zinc-700"
              >
                Your Email Address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full"
                disabled={isSubmitting}
              />
              <p className="text-xs text-zinc-500">
                We'll share this with the organization so they can reach out to
                you.
              </p>
            </div>

            {submitStatus === 'error' && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
                Something went wrong. Please try again later.
              </div>
            )}

            <div className="flex gap-3">
              <Button type="submit" variant="primary" disabled={isSubmitting}>
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowInterestForm(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <div>
            <p className="mb-6 text-zinc-600">
              Interested in this opportunity? Click the button below to get in
              touch with the organization.
            </p>
            <Button
              size="lg"
              onClick={() => setShowInterestForm(true)}
              className="w-full sm:w-auto"
            >
              I'm Interested
            </Button>
          </div>
        )}
      </div>

      {/* Location Details */}
      <div className="rounded-xl border border-zinc-100 bg-white p-6 shadow-sm md:p-8">
        <h2 className="mb-5 text-xl font-semibold text-zinc-900">Location</h2>
        <div className="space-y-4">
          <div className="rounded-lg border border-zinc-100 bg-zinc-50 p-4">
            <div className="flex items-center gap-2 text-zinc-600">
              <MapPin className="h-4 w-4 text-zinc-500" />
              <span>
                {formatLocationShort(activity.geolocations, activity.language)}
              </span>
            </div>
          </div>
          {/* Map placeholder */}
          <div className="flex h-48 items-center justify-center rounded-lg border border-zinc-100 bg-zinc-50">
            <div className="text-center">
              <div className="mb-2 text-4xl">🗺️</div>
              <p className="text-sm text-zinc-500">Map view coming soon</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
