import { NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { daily_content, DailyContent } from '@/lib/db/schema';

// Define an extended type for debugging
type DailyContentWithDebug = DailyContent & {
  audioUrlFree_debug?: {
    original: string;
    isRelative: boolean;
    isAbsolute: boolean;
    isSupabaseUrl: boolean;
    urlStructure: string;
  };
  audioUrlPremium_debug?: {
    original: string;
    isRelative: boolean;
    isAbsolute: boolean;
    isSupabaseUrl: boolean;
    urlStructure: string;
  };
};

export async function GET() {
  try {
    // Fetch all daily content entries
    const content = await db.select().from(daily_content);
    
    // Add debug info for each entry
    const contentWithDebug: DailyContentWithDebug[] = content.map(entry => {
      // Create a copy of the entry
      const entryCopy: DailyContentWithDebug = { ...entry };
      
      // Add debug info for audio URLs
      if (entryCopy.audioUrlFree) {
        const urlStructure = getUrlStructure(entryCopy.audioUrlFree);
        entryCopy.audioUrlFree_debug = {
          original: entryCopy.audioUrlFree,
          isRelative: entryCopy.audioUrlFree.startsWith('/'),
          isAbsolute: entryCopy.audioUrlFree.startsWith('http'),
          isSupabaseUrl: entryCopy.audioUrlFree.includes('supabase'),
          urlStructure,
        };
      }
      
      if (entryCopy.audioUrlPremium) {
        const urlStructure = getUrlStructure(entryCopy.audioUrlPremium);
        entryCopy.audioUrlPremium_debug = {
          original: entryCopy.audioUrlPremium,
          isRelative: entryCopy.audioUrlPremium.startsWith('/'),
          isAbsolute: entryCopy.audioUrlPremium.startsWith('http'),
          isSupabaseUrl: entryCopy.audioUrlPremium.includes('supabase'),
          urlStructure,
        };
      }
      
      return entryCopy;
    });
    
    return NextResponse.json(contentWithDebug);
  } catch (error) {
    console.error('Error fetching daily content:', error);
    return NextResponse.json(
      { error: 'Failed to fetch daily content' },
      { status: 500 }
    );
  }
}

/**
 * Helper to analyze the structure of a URL
 */
function getUrlStructure(url: string): string {
  try {
    if (url.startsWith('http')) {
      const parsedUrl = new URL(url);
      return `${parsedUrl.protocol}//${parsedUrl.host}/...`;
    } else if (url.startsWith('/')) {
      return 'Relative path: /...';
    } else {
      return 'Unknown format';
    }
  } catch (e) {
    return 'Invalid URL format';
  }
} 