/**
 * @description
 * Client component responsible for displaying the daily devotional content.
 * Receives content data and premium status from a parent Server Component.
 * Fetches the current theme using useUser to pass to the image generator.
 *
 * Key features:
 * - Displays the date, verse reference, verse text, and reflection.
 * - Integrates the `AudioPlayer` component for audio playback.
 * - Integrates the `ShareableImageGenerator` component, passing the current theme.
 * - Uses Shadcn UI components (`Card`) for styling.
 *
 * @dependencies
 * - react: Core React library.
 * - @/lib/auth (useUser): Hook to access user context (including theme).
 * - @/lib/db/schema (DailyContent): Type definition for the content object.
 * - @/components/ui/card: Shadcn Card components for layout.
 * - ./audio-player (AudioPlayer): Component for audio playback.
 * - ./shareable-image-generator (ShareableImageGenerator): Component for generating and sharing images.
 *
 * @props
 * - content: The `DailyContent` object containing verse, reflection, and audio URLs.
 * - isPremium: Boolean indicating if the current user has premium access.
 *
 * @notes
 * - Marked with `"use client"` as it interacts with client components and uses hooks.
 * - Date formatting is basic.
 */
'use client';

import React from 'react';
import { DailyContent } from '@/lib/db/schema'; // Import the type for daily content
import { useUser } from '@/lib/auth'; // Import useUser hook
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import AudioPlayer from './audio-player'; // Import the AudioPlayer component
import { ShareableImageGenerator } from './shareable-image-generator'; // Import the ShareableImageGenerator component

// Define the props interface for the component
interface DailyContentViewerProps {
  content: DailyContent;
  isPremium: boolean;
}

export default function DailyContentViewer({
  content,
  isPremium,
}: DailyContentViewerProps) {
  // Get user context, including the theme preference
  const { user } = useUser();
  const currentTheme = user?.theme || 'light'; // Default to light theme if not available

  // Format the date for display (adjust locale and options as needed)
  const displayDate = new Date(
    content.contentDate + 'T00:00:00Z',
  ).toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC', // Display the date based on UTC
  });

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
          {content.verseText}
        </blockquote>

        {/* Display the reflection text */}
        <div className="prose prose-base md:prose-lg max-w-none text-foreground text-justify leading-relaxed">
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

        {/* Shareable Image Generator Component - Pass the current theme */}
        <ShareableImageGenerator
          verseRef={content.verseRef}
          verseText={content.verseText}
          reflectionText={content.reflectionText}
          theme={currentTheme} // Pass the theme name
        />
      </CardFooter>
    </Card>
  );
}