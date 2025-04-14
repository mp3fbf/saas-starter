import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { daily_content } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { generateAudio, freeVoiceId, premiumVoiceId } from '@/lib/content/elevenlabs';

/**
 * Debug endpoint to regenerate audio for an existing content entry
 * Use: /api/debug/regenerate-audio?date=2025-04-14
 */
export async function GET(request: NextRequest) {
  // Parse query parameters
  const searchParams = request.nextUrl.searchParams;
  const dateParam = searchParams.get('date');
  
  console.log('Audio regeneration triggered.');
  console.log(`Parameters: date=${dateParam || 'none'}`);
  
  if (!dateParam) {
    return NextResponse.json({
      success: false,
      error: 'Date parameter is required'
    }, { status: 400 });
  }
  
  try {
    // Find the content for the specified date
    const content = await db
      .select()
      .from(daily_content)
      .where(eq(daily_content.contentDate, dateParam))
      .limit(1);
    
    if (!content || content.length === 0) {
      return NextResponse.json({
        success: false,
        error: `No content found for date: ${dateParam}`
      }, { status: 404 });
    }
    
    const contentItem = content[0];
    console.log(`Found content for date ${dateParam}: ID ${contentItem.id}`);
    
    if (!contentItem.reflectionText) {
      return NextResponse.json({
        success: false,
        error: 'Content has no reflection text to generate audio from'
      }, { status: 400 });
    }
    
    // Generate audio for both free and premium tiers
    console.log('Generating free audio...');
    const audioUrlFree = await generateAudio(contentItem.reflectionText, freeVoiceId);
    console.log(`Free audio result: ${audioUrlFree ? 'success' : 'failed'}`);
    
    console.log('Generating premium audio...');
    const audioUrlPremium = await generateAudio(contentItem.reflectionText, premiumVoiceId);
    console.log(`Premium audio result: ${audioUrlPremium ? 'success' : 'failed'}`);
    
    // Update the database record with the new audio URLs
    const updateResult = await db
      .update(daily_content)
      .set({
        audioUrlFree,
        audioUrlPremium,
        updatedAt: new Date()
      })
      .where(eq(daily_content.id, contentItem.id));
    
    console.log('Database update completed');
    
    return NextResponse.json({
      success: true,
      message: 'Audio regenerated successfully',
      audioUrlFree,
      audioUrlPremium
    });
    
  } catch (error) {
    console.error('Error during audio regeneration:', error);
    return NextResponse.json({
      success: false,
      error: `Audio regeneration failed: ${error instanceof Error ? error.message : String(error)}`
    }, { status: 500 });
  }
} 