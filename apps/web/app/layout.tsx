import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { NuqsAdapter } from 'nuqs/adapters/next/app';

import './globals.css';
import { QueryProvider } from '@/components/providers/QueryProvider';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Action Atlas - Discover Volunteering Opportunities',
    template: '%s | Action Atlas',
  },
  description:
    'AI-powered semantic search for discovering meaningful volunteering activities. Find opportunities that match your skills, interests, and location.',
  keywords: [
    'volunteering',
    'volunteer',
    'community service',
    'nonprofit',
    'charity',
    'social impact',
    'semantic search',
  ],
  authors: [{ name: 'Action Atlas Team' }],
  creator: 'Action Atlas',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://actionatlas.org',
    title: 'Action Atlas - Discover Volunteering Opportunities',
    description:
      'AI-powered semantic search for discovering meaningful volunteering activities.',
    siteName: 'Action Atlas',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Action Atlas - Discover Volunteering Opportunities',
    description:
      'AI-powered semantic search for discovering meaningful volunteering activities.',
    creator: '@actionatlas',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.variable} suppressHydrationWarning>
        <NuqsAdapter>
          <QueryProvider>{children}</QueryProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}
