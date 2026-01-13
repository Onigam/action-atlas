import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    mongodb_uri: process.env['MONGODB_URI'] || 'NOT SET',
    node_env: process.env['NODE_ENV'],
    cwd: process.cwd(),
  });
}
