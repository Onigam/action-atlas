import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import type { ZodSchema } from 'zod';

/**
 * Standard error response format
 */
export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
  details?: unknown;
}

/**
 * Standard success response format
 */
export interface ApiSuccessResponse<T = unknown> {
  data?: T;
  metadata?: {
    executionTimeMs?: number;
    [key: string]: unknown;
  };
}

/**
 * Validate request data with Zod schema
 * Throws ZodError if validation fails
 */
export function validateRequest<T>(schema: ZodSchema<T>, data: unknown): T {
  return schema.parse(data);
}

/**
 * Convert errors to standardized NextResponse
 */
export function handleApiError(error: unknown): NextResponse<ApiError> {
  // Validation errors
  if (error instanceof ZodError) {
    const firstError = error.errors[0];
    return NextResponse.json(
      {
        error: 'Validation Error',
        message: firstError?.message ?? 'Invalid input',
        statusCode: 400,
        details: error.errors,
      },
      { status: 400 }
    );
  }

  // Custom application errors with status codes
  if (error instanceof Error && 'statusCode' in error) {
    const statusCode = (error as Error & { statusCode: number }).statusCode;
    return NextResponse.json(
      {
        error: error.name || 'Application Error',
        message: error.message,
        statusCode,
      },
      { status: statusCode }
    );
  }

  // Generic errors
  if (error instanceof Error) {
    // Log full error for debugging
    console.error('API Error:', error);

    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: error.message || 'An unexpected error occurred',
        statusCode: 500,
      },
      { status: 500 }
    );
  }

  // Unknown error type
  console.error('Unknown error type:', error);
  return NextResponse.json(
    {
      error: 'Internal Server Error',
      message: 'An unexpected error occurred',
      statusCode: 500,
    },
    { status: 500 }
  );
}

/**
 * Create a success response with metadata
 */
export function successResponse<T>(
  data: T,
  metadata?: Record<string, unknown>
): NextResponse {
  const response: ApiSuccessResponse<T> = {
    data,
  };

  if (metadata !== undefined) {
    response.metadata = metadata;
  }

  return NextResponse.json(response, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

/**
 * Create a paginated response
 */
export interface PaginatedResponse<T> {
  results: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export function paginatedResponse<T>(
  results: T[],
  total: number,
  page: number,
  pageSize: number
): NextResponse<PaginatedResponse<T>> {
  return NextResponse.json({
    results,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  });
}

/**
 * Higher-order function to wrap API route handlers with error handling
 */
export function withErrorHandling<T extends unknown[]>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args);
    } catch (error) {
      return handleApiError(error);
    }
  };
}

/**
 * Custom error classes for specific scenarios
 */
export class NotFoundError extends Error {
  statusCode = 404;
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class BadRequestError extends Error {
  statusCode = 400;
  constructor(message: string) {
    super(message);
    this.name = 'BadRequestError';
  }
}

export class UnauthorizedError extends Error {
  statusCode = 401;
  constructor(message: string) {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends Error {
  statusCode = 403;
  constructor(message: string) {
    super(message);
    this.name = 'ForbiddenError';
  }
}

/**
 * Extract pagination parameters from URL search params
 */
export function getPaginationParams(searchParams: URLSearchParams) {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const pageSize = Math.min(
    100,
    Math.max(1, parseInt(searchParams.get('pageSize') || '20', 10))
  );
  const offset = (page - 1) * pageSize;

  return { page, pageSize, offset };
}

/**
 * Measure execution time of an async function
 */
export async function measureExecutionTime<T>(
  fn: () => Promise<T>
): Promise<{ result: T; executionTimeMs: number }> {
  const startTime = Date.now();
  const result = await fn();
  const executionTimeMs = Date.now() - startTime;

  return { result, executionTimeMs };
}
