/**
 * @description
 * API Route handler for the Vercel Cron Job responsible for triggering
 * the daily content generation process for Palavra Viva.
 *
 * Endpoint: `/api/cron/generate-daily-content`
 * Method: GET (or POST, but GET is simpler for Vercel Cron config)
 *
 * Security:
 * - Requires a bearer token in the Authorization header that matches the
 *   `CRON_SECRET` environment variable. This prevents unauthorized triggering.
 *
 * Functionality:
 * - When triggered (and authorized), it calls the `generateDailyContent` server action
 *   from `lib/content/actions.ts`. This action handles the logic of generating
 *   the verse, reflection, and audio for the next day and saving it to the database.
 * - Returns a JSON response indicating success or failure of the content generation attempt.
 *
 * @dependencies
 * - next/server (NextRequest, NextResponse): For handling API requests and responses.
 * - @vercel/blob (optional): Can be used if audio files need to be stored.
 * - @/lib/content/actions (generateDailyContent): The core server action for content generation.
 *
 * @notes
 * - The `CRON_SECRET` environment variable MUST be set for security.
 * - Vercel Cron typically sends GET requests, so we implement the GET handler.
 * - The `generateDailyContent` action defaults to generating content for tomorrow.
 * - Error handling catches issues during the action call and returns an appropriate error response.
 */
import { NextRequest, NextResponse } from 'next/server';
import { generateDailyContent } from '@/lib/content/actions';

export const dynamic = 'force-dynamic'; // Ensure the route is always executed dynamically

export async function GET(request: NextRequest) {
  // 1. Security Check: Verify the cron secret
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.error(
      'CRON_SECRET environment variable is not set. Denying request.',
    );
    return NextResponse.json({ error: 'Internal configuration error' }, { status: 500 });
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    console.warn('Unauthorized attempt to access cron endpoint.');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Trigger Content Generation
  console.log('Cron job triggered: Starting daily content generation...');
  try {
    // Call the server action. It defaults to generating for tomorrow.
    const result = await generateDailyContent();

    if (result.success) {
      console.log(`Cron job successful: ${result.message}`);
      return NextResponse.json(
        { message: result.message, dateGeneratedFor: result.date },
        { status: 200 },
      );
    } else {
      console.error(`Cron job failed: ${result.message}`);
      return NextResponse.json(
        { error: 'Content generation failed', details: result.message },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error('Unexpected error during cron job execution:', error);
    return NextResponse.json(
      { error: 'Internal server error during content generation' },
      { status: 500 },
    );
  }
}

// Optional: Implement POST handler if needed, with similar logic
// export async function POST(request: NextRequest) { ... }