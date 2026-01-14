import { NextResponse } from 'next/server';

/**
 * Health check endpoint for deployment verification
 * Used by Railway deployment workflow to verify application is running
 */
export async function GET() {
  return NextResponse.json(
    {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
    { status: 200 }
  );
}
