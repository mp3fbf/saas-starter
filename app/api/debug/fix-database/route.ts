import { NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { daily_content } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';

/**
 * Fixes the database by clearing all audio URLs that reference non-existent files.
 * This is a one-time operation to clean the database.
 */
export async function GET() {
  try {
    // Find all records with problematic audio URLs
    const recordsToFix = await db
      .select({
        id: daily_content.id,
        audioUrlFree: daily_content.audioUrlFree,
        audioUrlPremium: daily_content.audioUrlPremium,
      })
      .from(daily_content)
      .where(
        sql`${daily_content.audioUrlFree} LIKE '/mock%' OR ${daily_content.audioUrlPremium} LIKE '/mock%'`
      );

    console.log(`Found ${recordsToFix.length} records with problematic audio URLs`);

    // Update each record
    const updatePromises = recordsToFix.map(async (record) => {
      return db
        .update(daily_content)
        .set({
          audioUrlFree: null,
          audioUrlPremium: null,
        })
        .where(eq(daily_content.id, record.id));
    });

    await Promise.all(updatePromises);

    return NextResponse.json({
      success: true,
      recordsFixed: recordsToFix.length,
      message: 'Database cleaned successfully',
    });
  } catch (error) {
    console.error('Error fixing database:', error);
    return NextResponse.json(
      { error: 'Failed to fix database', details: String(error) },
      { status: 500 }
    );
  }
} 