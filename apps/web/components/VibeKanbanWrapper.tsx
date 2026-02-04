'use client';

import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';

const VibeKanbanWebCompanion = dynamic<Record<string, never>>(
  () =>
    import('vibe-kanban-web-companion').then(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (mod) => mod.VibeKanbanWebCompanion as ComponentType<Record<string, never>>
    ),
  { ssr: false }
);

export function VibeKanbanWrapper() {
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return <VibeKanbanWebCompanion />;
}
