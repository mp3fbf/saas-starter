/**
 * @description
 * This file contains server actions related to fetching and generating
 * the daily devotional content (verse, reflection, audio) for the Palavra Viva application.
 *
 * Key Actions/Functions:
 * - `generateDailyContent`: Server action triggered (e.g., by a cron job) to automatically
 *   generate and store the content for a specific date using OpenAI, ElevenLabs, and the Bible DB.
 * - `getDailyContent`: Function to retrieve the daily content for a given date from the database,
 *   intended for use by frontend components.
 *
 * @dependencies
 * - drizzle-orm (eq, and): For database querying.
 * - @/lib/db/drizzle (db): Drizzle database instance.
 * - @/lib/db/schema (daily_content, DailyContent, NewDailyContent): DB table schema and types.
 * - ./openai (getVerseSuggestion, generateReflection): OpenAI API helper functions.
 * - ./elevenlabs (generateAudio, freeVoiceId, premiumVoiceId): ElevenLabs API helper functions.
 * - ./bible (getVerseText): Function to retrieve verse text from the database.
 *
 * @notes
 * - The `generateDailyContent` action includes checks to prevent duplicate entries.
 * - Error handling is implemented for API calls and database operations.
 * - Assumes API keys and voice IDs are correctly configured in environment variables.
 * - Date handling requires careful formatting for database queries.
 */
'use server';

import { eq, sql } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { daily_content, NewDailyContent, DailyContent } from '@/lib/db/schema';
import { getVerseSuggestion, generateReflection } from './openai';
import { generateAudio, freeVoiceId, premiumVoiceId } from './elevenlabs';
import { getVerseText } from './bible';

/**
 * @description Formats a Date object into 'YYYY-MM-DD' string suitable for SQL DATE comparison.
 * @param {Date} date - The date object to format.
 * @returns {string} The formatted date string.
 */
function formatDateForDB(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * @description Server action to generate daily devotional content for a target date.
 * It fetches a verse suggestion, verse text, generates a reflection, generates audio,
 * and saves everything to the database. It checks for existing content first.
 *
 * @param {Date} [targetDate] - The date for which to generate content. Defaults to tomorrow.
 * @returns {Promise<{ success: boolean; message: string; date?: string }>} Status object indicating success or failure.
 */
export async function generateDailyContent(
  targetDate?: Date,
): Promise<{ success: boolean; message: string; date?: string }> {
  const dateToGenerate = targetDate || new Date(Date.now() + 24 * 60 * 60 * 1000); // Default to tomorrow
  const formattedDate = formatDateForDB(dateToGenerate);
  const generationTime = new Date().toISOString(); // For logging

  console.log(
    `[${generationTime}] Attempting to generate content for date: ${formattedDate}`,
  );

  try {
    // 1. Check if content for this date already exists
    const existingContent = await db
      .select({ id: daily_content.id })
      .from(daily_content)
      .where(eq(daily_content.contentDate, formattedDate))
      .limit(1);

    if (existingContent.length > 0) {
      const message = `Content for date ${formattedDate} already exists. Skipping generation.`;
      console.log(`[${generationTime}] ${message}`);
      return { success: true, message: message, date: formattedDate };
    }

    console.log(`[${generationTime}] No existing content found for ${formattedDate}. Proceeding...`);

    // 2. Get Verse Suggestion from OpenAI
    const verseRef = await getVerseSuggestion(); // Add options if themes are implemented later
    if (!verseRef) {
      throw new Error('Failed to get verse suggestion from OpenAI.');
    }
    console.log(`[${generationTime}] Suggested verse: ${verseRef}`);

    // 3. Get Verse Text from Database
    const verseText = await getVerseText(verseRef);
    if (!verseText) {
      // Attempting to parse might fail if the suggestion format is unexpected
      throw new Error(`Failed to get verse text for reference: ${verseRef}`);
    }
    console.log(`[${generationTime}] Retrieved verse text for ${verseRef}.`);

    // 4. Generate Reflection from OpenAI
    const reflectionText = await generateReflection(verseRef, verseText);
    if (!reflectionText) {
      throw new Error('Failed to generate reflection from OpenAI.');
    }
    console.log(`[${generationTime}] Generated reflection for ${verseRef}.`);

    // 5. Generate Audio (Free Tier) from ElevenLabs
    let audioUrlFree: string | null = null;
    try {
      audioUrlFree = await generateAudio(reflectionText, freeVoiceId);
      console.log(`[${generationTime}] Generated free audio (URL: ${audioUrlFree})`);
    } catch (audioError) {
      console.error(
        `[${generationTime}] Failed to generate free audio:`,
        audioError,
      );
      // Log error but continue - content can exist without audio initially
    }

    // 6. Generate Audio (Premium Tier) from ElevenLabs
    let audioUrlPremium: string | null = null;
    try {
      audioUrlPremium = await generateAudio(reflectionText, premiumVoiceId);
      console.log(`[${generationTime}] Generated premium audio (URL: ${audioUrlPremium})`);
    } catch (audioError) {
      console.error(
        `[${generationTime}] Failed to generate premium audio:`,
        audioError,
      );
      // Log error but continue
    }

    // 7. Insert into Database
    const newContent: NewDailyContent = {
      contentDate: formattedDate, // Use the formatted date string
      verseRef: verseRef,
      verseText: verseText,
      reflectionText: reflectionText,
      audioUrlFree: audioUrlFree,
      audioUrlPremium: audioUrlPremium,
      // createdAt and updatedAt have defaults in schema
    };

    await db.insert(daily_content).values(newContent);
    const successMessage = `Successfully generated and saved content for date: ${formattedDate}`;
    console.log(`[${generationTime}] ${successMessage}`);
    return { success: true, message: successMessage, date: formattedDate };
  } catch (error) {
    const errorMessage = `Failed to generate content for date ${formattedDate}: ${
      error instanceof Error ? error.message : String(error)
    }`;
    console.error(`[${generationTime}] ${errorMessage}`);
    // Optionally log the full error stack
    // console.error(error);
    return { success: false, message: errorMessage, date: formattedDate };
  }
}

/**
 * @description Retrieves the daily devotional content for a specific date from the database.
 * @param {Date} date - The date for which to retrieve content.
 * @returns {Promise<DailyContent | null>} The daily content object if found, otherwise null.
 */
export async function getDailyContent(
  date: Date,
): Promise<DailyContent | null> {
  const formattedDate = formatDateForDB(date);
  try {
    const result = await db
      .select()
      .from(daily_content)
      .where(eq(daily_content.contentDate, formattedDate))
      .limit(1);

    if (result.length > 0) {
      return result[0];
    } else {
      return null; // No content found for this date
    }
  } catch (error) {
    console.error(
      `Database error fetching content for date ${formattedDate}:`,
      error,
    );
    return null; // Return null on database error
  }
}