import {
  connectToDatabase,
  findActivityById,
  findOrganizationById,
} from '@action-atlas/database';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import {
  handleApiError,
  NotFoundError,
  validateRequest,
} from '@/lib/api-utils';

// Input validation schema
const ContactRequest = z.object({
  email: z.string().email(),
});

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

// Helper to safely get charity field from activity (legacy data support)
function getCharityField(activity: Record<string, unknown>): string | undefined {
  const charity = activity['charity'];
  return typeof charity === 'string' ? charity : undefined;
}

/**
 * POST /api/activities/:id/contact - Send interest message to Telegram
 */
export async function POST(
  request: Request,
  context: RouteContext
): Promise<NextResponse> {
  try {
    await connectToDatabase();

    const { id } = await context.params;
    const body: unknown = await request.json();
    const { email } = validateRequest(ContactRequest, body);

    // Fetch activity details
    const activity = await findActivityById(id);
    if (!activity) {
      throw new NotFoundError(`Activity with ID ${id} not found`);
    }

    // Fetch charity/organization details (support legacy charity field)
    const activityRecord = activity as unknown as Record<string, unknown>;
    const charityField = getCharityField(activityRecord);
    const organizationId = activity.organizationId || charityField;
    let charityName = 'Unknown Organization';

    if (organizationId) {
      // Try to find organization if we have an ID
      try {
        const organization = await findOrganizationById(organizationId);
        if (organization) {
          charityName = organization.name;
        } else if (charityField) {
          // Fallback to charity field if organization lookup fails but charity field exists
          charityName = charityField;
        }
      } catch {
        // Fallback to charity string if organization lookup fails
        if (charityField) {
          charityName = charityField;
        }
      }
    }

    // Prepare message for Telegram
    const botToken = process.env['TELEGRAM_BOT_TOKEN'];
    const chatId = process.env['TELEGRAM_CHAT_ID'];

    if (!botToken || !chatId) {
      console.error('Telegram configuration missing');
      // We still return success to the user to not expose server configuration issues
      // but log the error
      return NextResponse.json(
        { message: 'Request received' },
        { status: 200 }
      );
    }

    const message = `
📢 *New Interest in Activity*

👤 *User Email:* ${email}
🎯 *Activity:* ${activity.title}
🏢 *Organization:* ${charityName}
🆔 *Activity ID:* ${id}

[View Activity](https://action-atlas.com/activities/${id})
`;

    // Send to Telegram
    const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown',
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Telegram API error:', errorData);
      throw new Error('Failed to send notification');
    }

    return NextResponse.json(
      { message: 'Interest registered successfully' },
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
