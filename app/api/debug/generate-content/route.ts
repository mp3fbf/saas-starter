import { NextRequest, NextResponse } from 'next/server';
import { generateDailyContent } from '@/lib/content/actions';

/**
 * Debug endpoint to manually trigger daily content generation
 * Use: /api/debug/generate-content?date=2025-04-15&force=true
 */
export async function GET(request: NextRequest) {
  // Parse query parameters
  const searchParams = request.nextUrl.searchParams;
  const dateParam = searchParams.get('date');
  const forceParam = searchParams.get('force') === 'true';
  
  console.log('Manual content generation triggered.');
  console.log(`Parameters: date=${dateParam || 'none'}, force=${forceParam}`);
  
  try {
    // Parse date if provided
    let targetDate: Date | undefined = undefined;
    
    if (dateParam) {
      try {
        targetDate = new Date(dateParam);
        // Check if date is valid
        if (isNaN(targetDate.getTime())) {
          return NextResponse.json(
            { error: 'Invalid date format. Use YYYY-MM-DD.' },
            { status: 400 }
          );
        }
      } catch (e) {
        return NextResponse.json(
          { error: 'Invalid date format. Use YYYY-MM-DD.' },
          { status: 400 }
        );
      }
    }
    
    // Check if content already exists for this date
    if (!forceParam && targetDate) {
      // This check happens inside generateDailyContent, we trust it
      console.log('Checking if content exists before generating...');
    }
    
    console.log(`Generating content for date: ${targetDate?.toISOString() || 'tomorrow (default)'}`);
    
    // Call the generation function
    const result = await generateDailyContent(targetDate);
    
    if (result.success) {
      console.log(`Content generation successful: ${result.message}`);
      return NextResponse.json({
        success: true,
        message: result.message,
        date: result.date,
      });
    } else {
      console.error(`Content generation failed: ${result.message}`);
      return NextResponse.json({
        success: false,
        error: result.message,
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error during content generation:', error);
    return NextResponse.json({
      success: false,
      error: `Content generation failed: ${error instanceof Error ? error.message : String(error)}`,
    }, { status: 500 });
  }
} 