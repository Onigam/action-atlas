'use client';

import * as React from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';

import { cn } from '@/lib/utils';

interface MarkdownContentProps {
  content: string;
  className?: string;
  /**
   * When true, renders in truncated mode with line-clamp for cards.
   * When false, renders full content for detail pages.
   */
  truncate?: boolean;
  /**
   * Number of lines to clamp when truncate is true.
   * @default 2
   */
  lineClamp?: number;
}

/**
 * Custom components for truncated mode - renders inline elements
 * to support proper line-clamp behavior while preserving rich formatting.
 */
const truncatedComponents: Components = {
  // Render paragraphs as spans to keep everything inline for line-clamp
  p: ({ children }) => <span>{children} </span>,
  // Preserve text formatting
  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
  em: ({ children }) => <em>{children}</em>,
  del: ({ children }) => <del>{children}</del>,
  // Inline code
  code: ({ children }) => (
    <code className="rounded bg-gray-100 px-1 py-0.5 text-xs">{children}</code>
  ),
  // Links - preserve styling
  a: ({ children, href }) => (
    <a href={href} className="text-blue-600 underline">
      {children}
    </a>
  ),
  // Headers become inline spans with bold
  h1: ({ children }) => <strong>{children} </strong>,
  h2: ({ children }) => <strong>{children} </strong>,
  h3: ({ children }) => <strong>{children} </strong>,
  h4: ({ children }) => <strong>{children} </strong>,
  h5: ({ children }) => <strong>{children} </strong>,
  h6: ({ children }) => <strong>{children} </strong>,
  // Lists become inline text with bullet/number preserved as text
  ul: ({ children }) => <span>{children}</span>,
  ol: ({ children }) => <span>{children}</span>,
  li: ({ children }) => <span>• {children} </span>,
  // Blockquotes inline
  blockquote: ({ children }) => (
    <span className="italic text-gray-600">{children}</span>
  ),
  // Skip block elements that don't make sense inline
  pre: () => null,
  hr: () => <span> — </span>,
  img: () => null,
  table: () => null,
  thead: () => null,
  tbody: () => null,
  tr: () => null,
  th: () => null,
  td: () => null,
};

/**
 * Renders markdown content with proper formatting.
 * Supports truncated mode for cards (with ellipsis) and full mode for detail pages.
 */
export function MarkdownContent({
  content,
  className,
  truncate = false,
  lineClamp = 2,
}: MarkdownContentProps) {
  if (!content) {
    return null;
  }

  if (truncate) {
    // For truncated mode, render markdown inline with line-clamp
    // All block elements are converted to inline spans for proper truncation
    return (
      <div
        className={cn(
          'text-sm leading-relaxed text-gray-700',
          `line-clamp-${lineClamp}`,
          className
        )}
      >
        <ReactMarkdown components={truncatedComponents}>
          {normalizeForTruncation(content)}
        </ReactMarkdown>
      </div>
    );
  }

  // Full mode for detail pages - render actual markdown
  return (
    <div
      className={cn(
        'prose prose-gray max-w-none',
        // Custom prose styles to match the design system
        'prose-p:text-base prose-p:leading-relaxed prose-p:text-gray-700',
        'prose-headings:font-bold prose-headings:text-gray-900',
        'prose-strong:font-bold prose-strong:text-gray-900',
        'prose-ul:my-2 prose-ol:my-2',
        'prose-li:text-gray-700',
        'prose-a:text-blue-600 prose-a:underline hover:prose-a:text-blue-800',
        className
      )}
    >
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}

/**
 * Normalizes markdown content for truncated display.
 * Cleans up excessive whitespace while preserving markdown syntax.
 */
function normalizeForTruncation(text: string): string {
  return (
    text
      // Remove code blocks (they don't display well truncated)
      .replace(/```[\s\S]*?```/g, '')
      // Normalize multiple newlines to single space
      .replace(/\n{2,}/g, ' ')
      .replace(/\n/g, ' ')
      // Clean up multiple spaces
      .replace(/\s{2,}/g, ' ')
      .trim()
  );
}
