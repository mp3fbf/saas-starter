/**
 * @description
 * Client component responsible for playing audio content (e.g., daily reflections).
 * It handles switching between free and premium audio sources based on user status
 * and provides standard play/pause controls.
 *
 * Key features:
 * - Selects audio source (free/premium) based on `isPremium` prop.
 * - Uses HTML5 Audio element for playback.
 * - Manages playback state (`isPlaying`).
 * - Displays Play/Pause icons dynamically.
 * - Handles audio end event to reset play state.
 * - Disables button if no valid audio URL is available.
 *
 * @dependencies
 * - react (useState, useRef, useEffect): Core React hooks for state and side effects.
 * - @/components/ui/button (Button): Shadcn UI component for the button.
 * - lucide-react (Play, Pause): Icons for play/pause states.
 * - @/lib/utils (cn): Utility for conditional class names (though not strictly needed here yet).
 *
 * @props
 * - audioUrlFree: URL string for the standard/free audio track, or null.
 * - audioUrlPremium: URL string for the premium audio track, or null.
 * - isPremium: Boolean indicating if the current user has premium access (active subscription or trial).
 *
 * @notes
 * - Uses `"use client"` directive as it relies on React hooks.
 * - Error handling for audio loading/playback could be enhanced further (e.g., listening to the 'error' event on the Audio element).
 * - Cleanup logic in `useEffect` ensures the audio object is properly handled when the component unmounts or the URL changes.
 */
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause } from 'lucide-react';
// import { cn } from '@/lib/utils'; // Import cn if needed for more complex styling

// Define the props interface for type safety
interface AudioPlayerProps {
  audioUrlFree: string | null;
  audioUrlPremium: string | null;
  isPremium: boolean;
}

export default function AudioPlayer({
  audioUrlFree,
  audioUrlPremium,
  isPremium,
}: AudioPlayerProps) {
  // State to track whether audio is currently playing
  const [isPlaying, setIsPlaying] = useState(false);
  // State to track if an error occurred during loading/playback
  const [error, setError] = useState<string | null>(null);
  // Ref to hold the HTMLAudioElement instance
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Determine the correct audio URL based on premium status
  const audioUrl = isPremium ? audioUrlPremium : audioUrlFree;

  // Effect to initialize and clean up the Audio object when the URL changes
  useEffect(() => {
    // Clear previous error state when URL changes
    setError(null);

    // Only proceed if a valid audio URL is provided
    if (audioUrl) {
      // Create a new Audio object
      audioRef.current = new Audio(audioUrl);

      // Event listener for when the audio finishes playing
      audioRef.current.onended = () => {
        setIsPlaying(false); // Reset playing state
      };

      // Event listener for audio errors
      audioRef.current.onerror = (e) => {
        console.error('Audio playback error:', e);
        setError('Erro ao carregar o áudio.'); // Set error message
        setIsPlaying(false); // Reset playing state
        // Prevent default error handling if necessary
        // Depending on the error type, you might want more specific messages
        // For instance, checking event.target.error.code
      };

      // Optional: Listener for when audio can start playing
      // audioRef.current.oncanplaythrough = () => {
      //   console.log("Audio can play through.");
      // };

      // Optional: Listener for loading state
      // audioRef.current.onloadstart = () => {
      //   console.log("Audio loading started...");
      // };

    } else {
      // If no audioUrl, ensure the ref is null
      audioRef.current = null;
    }

    // Cleanup function: Pause audio and release the object when the component unmounts or URL changes
    return () => {
      audioRef.current?.pause(); // Pause playback if active
      audioRef.current = null; // Release the audio object reference
    };
  }, [audioUrl]); // Rerun effect if the audioUrl changes

  // Handler for the play/pause button click
  const handlePlayPause = () => {
    if (!audioRef.current || error) return; // Do nothing if no audio element or if there's an error

    if (isPlaying) {
      audioRef.current.pause(); // Pause playback
    } else {
      // Attempt to play, potentially catching errors
      audioRef.current.play().catch((playError) => {
        console.error('Error attempting to play audio:', playError);
        setError('Não foi possível iniciar a reprodução.');
        setIsPlaying(false); // Ensure state reflects failure
      });
    }
    // Toggle the playing state (optimistically, error handler above corrects if needed)
    setIsPlaying(!isPlaying);
  };

  // Render disabled button if no URL or if an error occurred
  if (!audioUrl || error) {
    return (
      <Button disabled variant="ghost" className="flex items-center text-muted-foreground">
        {/* Display appropriate icon and text */}
        {error ? (
            <Pause className="mr-2 h-4 w-4" /> /* Show pause icon for error state */
        ) : (
            <Play className="mr-2 h-4 w-4" />
        )}
        {error || 'Áudio indisponível'}
      </Button>
    );
  }

  // Render the interactive play/pause button
  return (
    <Button onClick={handlePlayPause} variant="ghost" className="flex items-center">
      {/* Display Play or Pause icon based on state */}
      {isPlaying ? (
        <Pause className="mr-2 h-4 w-4" />
      ) : (
        <Play className="mr-2 h-4 w-4" />
      )}
      {/* Button label */}
      {isPlaying ? 'Pausar Áudio' : 'Ouvir em Áudio'}
    </Button>
  );
}