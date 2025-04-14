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

  // DEBUGGING: Log received props
  console.log('[DEBUG] AudioPlayer props received:', {
    audioUrlFree,
    audioUrlPremium,
    isPremium,
  });

  // Determine the correct audio URL based on premium status
  const audioUrl = isPremium ? audioUrlPremium : audioUrlFree;
  
  // DEBUGGING: Log final selected URL
  console.log('[DEBUG] AudioPlayer final URL selected:', audioUrl);

  // Effect to initialize and clean up the Audio object when the URL changes
  useEffect(() => {
    // Clear previous error state when URL changes
    setError(null);

    // DEBUGGING: Log effect trigger
    console.log('[DEBUG] AudioPlayer useEffect triggered with URL:', audioUrl);

    // Only proceed if a valid audio URL is provided
    if (audioUrl) {
      // DEBUGGING: Log URL structure before creating Audio object
      console.log('[DEBUG] Creating Audio object with URL:', {
        originalUrl: audioUrl,
      });

      // Create a new Audio object
      audioRef.current = new Audio(audioUrl);

      // Event listener for when the audio finishes playing
      audioRef.current.onended = () => {
        console.log('[DEBUG] Audio playback ended naturally');
        setIsPlaying(false); // Reset playing state
      };

      // Event listener for audio errors
      audioRef.current.onerror = (e) => {
        console.error('[DEBUG] Audio playback error details:', {
          errorEvent: e,
          errorCode: audioRef.current?.error?.code,
          errorMessage: audioRef.current?.error?.message,
          networkState: audioRef.current?.networkState,
          readyState: audioRef.current?.readyState,
          audioURL: audioUrl,
        });
        setError('Erro ao carregar o áudio.'); // Set error message
        setIsPlaying(false); // Reset playing state
      };

      // Add more debug listeners
      audioRef.current.onloadstart = () => {
        console.log('[DEBUG] Audio loading started');
      };
      
      audioRef.current.oncanplay = () => {
        console.log('[DEBUG] Audio can start playing');
      };
      
      audioRef.current.onwaiting = () => {
        console.log('[DEBUG] Audio is waiting for more data');
      };

    } else {
      // If no audioUrl, ensure the ref is null
      console.log('[DEBUG] No audio URL provided, setting ref to null');
      audioRef.current = null;
    }

    // Cleanup function: Pause audio and release the object when the component unmounts or URL changes
    return () => {
      console.log('[DEBUG] Cleaning up audio object');
      audioRef.current?.pause(); // Pause playback if active
      audioRef.current = null; // Release the audio object reference
    };
  }, [audioUrl]); // Rerun effect if the audioUrl changes

  // Handler for the play/pause button click
  const handlePlayPause = () => {
    console.log('[DEBUG] Play/Pause button clicked, current state:', {
      isPlaying,
      hasAudioRef: !!audioRef.current,
      hasError: !!error,
      currentTime: audioRef.current?.currentTime,
    });
    
    if (!audioRef.current || error) return; // Do nothing if no audio element or if there's an error

    if (isPlaying) {
      console.log('[DEBUG] Pausing audio');
      audioRef.current.pause(); // Pause playback
    } else {
      console.log('[DEBUG] Attempting to play audio');
      // Attempt to play, potentially catching errors
      audioRef.current.play().catch((playError) => {
        console.error('[DEBUG] Error attempting to play audio:', playError);
        setError('Não foi possível iniciar a reprodução.');
        setIsPlaying(false); // Ensure state reflects failure
      });
    }
    // Toggle the playing state (optimistically, error handler above corrects if needed)
    setIsPlaying(!isPlaying);
  };

  // Render disabled button if no URL or if an error occurred
  if (!audioUrl || error) {
    console.log('[DEBUG] Rendering disabled button due to:', {
      noUrl: !audioUrl, 
      error: error
    });
    
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