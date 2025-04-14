/**
 * @description
 * Development script to manually generate daily devotional content for the current date.
 *
 * This script directly invokes the `generateDailyContent` server action, bypassing the
 * cron job mechanism. It's useful for testing the content generation pipeline and
 * populating the database with today's content during development.
 *
 * @dependencies
 * - @/lib/content/actions (generateDailyContent): The core server action for content generation.
 * - tsx: Used via pnpm to execute this TypeScript script directly.
 *
 * @notes
 * - Requires necessary environment variables (OPENAI_API_KEY, ELEVENLABS_API_KEY, etc.) to be set.
 * - Ensure your database connection is configured correctly in `.env`.
 * - This script targets the current date based on the system clock where it's run.
 * - Check the server logs for detailed output from the `generateDailyContent` action.
 */
import { generateDailyContent } from '@/lib/content/actions';

async function run() {
  console.log('Attempting to generate content for today...');
  const today = new Date();

  try {
    const result = await generateDailyContent(today);
    console.log('Generation Result:', result);

    if (result.success) {
      console.log(`Successfully processed generation for date: ${result.date}`);
    } else {
      console.error(`Failed to generate content for date ${result.date}: ${result.message}`);
      process.exitCode = 1; // Indicate failure
    }
  } catch (error) {
    console.error('An unexpected error occurred running the script:', error);
    process.exitCode = 1; // Indicate failure
  }
}

run();
