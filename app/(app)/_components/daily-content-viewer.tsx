/**
 * @description
 * Client component responsible for displaying the daily devotional content.
 * Receives content data and premium status from a parent Server Component.
 *
 * Key features:
 * - Displays the date, verse reference, verse text, and reflection.
 * - Integrates the `AudioPlayer` component for audio playback.
 * - Includes a placeholder share button.
 * - Uses Shadcn UI components (`Card`, `Button`) for styling.
 *
 * @dependencies
 * - react: Core React library.
 * - @/lib/db/schema (DailyContent): Type definition for the content object.
 * - @/components/ui/card: Shadcn Card components for layout.
 * - @/components/ui/button: Shadcn Button component.
 * - ./audio-player (AudioPlayer): Component for audio playback.
 * - lucide-react (Share2): Icon for the share button.
 *
 * @props
 * - content: The `DailyContent` object containing verse, reflection, and audio URLs.
 * - isPremium: Boolean indicating if the current user has premium access.
 *
 * @notes
 * - Marked with `"use client"` as it interacts with the `AudioPlayer` client component
 *   and will later integrate with the client-side share functionality.
 * - The share functionality is currently a placeholder button.
 * - Date formatting is basic; consider using a library like `date-fns` for localization if needed.
 */
'use client';

import React from 'react';
import { DailyContent } from '@/lib/db/schema'; // Import the type for daily content
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AudioPlayer from './audio-player'; // Import the AudioPlayer component
import { Share2 } from 'lucide-react'; // Import Share icon

// Define the props interface for the component
interface DailyContentViewerProps {
  content: DailyContent;
  isPremium: boolean;
}

export default function DailyContentViewer({
  content,
  isPremium,
}: DailyContentViewerProps) {
  // Format the date for display (adjust locale and options as needed)
  // Ensure date is parsed correctly, assuming YYYY-MM-DD format from DB
  // Parse as UTC to avoid timezone shifts when only date is present
  const displayDate = new Date(
    content.contentDate + 'T00:00:00Z',
  ).toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC', // Display the date based on UTC
  });

  // Placeholder function for the share action
  const handleShare = () => {
    // TODO: Implement share functionality (Step 8.1/8.2)
    // This might trigger the ShareableImageGenerator component/modal
    console.log('Share button clicked');
    alert('Funcionalidade de compartilhar será implementada em breve!');
  };

  return (
    <Card className="w-full max-w-2xl mx-auto my-4 shadow-lg border border-border rounded-xl overflow-hidden">
      <CardHeader className="pb-2 bg-card">
        {/* Display the formatted date */}
        <CardDescription className="text-center text-sm text-muted-foreground">
          {displayDate}
        </CardDescription>
        {/* Display the Bible verse reference */}
        <CardTitle className="text-center text-2xl font-semibold pt-2 text-primary">
          {content.verseRef}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 pt-4 pb-4 px-6 bg-background">
        {/* Display the Bible verse text */}
        <blockquote className="text-center text-lg md:text-xl italic border-l-4 border-primary pl-4 py-2 bg-card rounded-r-md">
          {/* Using dangerouslySetInnerHTML to render potential line breaks if needed,
              otherwise, just use {content.verseText}. Be cautious if verseText
              could ever contain untrusted content. For Bible text, it's generally safe. */}
          {content.verseText}
        </blockquote>

        {/* Display the reflection text */}
        {/* Using prose for potential better text formatting if needed */}
        <div className="prose prose-base md:prose-lg max-w-none text-foreground text-justify leading-relaxed">
          {/* Split reflection into paragraphs if it contains newline characters */}
          {content.reflectionText.split('\n').map((paragraph, index) => (
            <p key={index} className={index > 0 ? 'mt-4' : ''}>
              {paragraph}
            </p>
          ))}
        </div>
      </CardContent>

      <CardFooter className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0 sm:space-x-2 pt-4 pb-4 px-6 bg-card border-t border-border">
        {/* Audio Player Component */}
        <AudioPlayer
          audioUrlFree={content.audioUrlFree}
          audioUrlPremium={content.audioUrlPremium}
          isPremium={isPremium}
        />

        {/* Share Button Placeholder */}
        <Button variant="outline" onClick={handleShare}>
          <Share2 className="mr-2 h-4 w-4" />
          Compartilhar
        </Button>
      </CardFooter>
    </Card>
  );
}