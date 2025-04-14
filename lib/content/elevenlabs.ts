/**
 * @module lib/content/elevenlabs
 * @description
 * Interacts with the ElevenLabs Text-to-Speech API to generate audio
 * from text and uploads the result to a Supabase Storage bucket.
 *
 * @dependencies
 * - node-fetch (or built-in fetch): For making HTTP requests to the API.
 * - @supabase/supabase-js: For uploading audio to Supabase Storage.
 * - crypto: For generating unique file names.
 *
 * @requires Environment Variables:
 * - `ELEVENLABS_API_KEY`: Your ElevenLabs API key.
 * - `ELEVENLABS_VOICE_ID_FREE`: (Optional) Voice ID for the free tier.
 * - `ELEVENLABS_VOICE_ID_PREMIUM`: (Optional) Voice ID for the premium tier.
 * - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL.
 * - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key.
 *
 * @notes
 * - Ensure the Supabase bucket ('audio-content') exists and has appropriate
 *   public read (SELECT) policies configured for `anon` and `authenticated` roles.
 */

import { randomUUID } from 'crypto';
import { supabase } from '../supabase/client'; // Ensure this path is correct

/**
 * @description
 * This module initializes and configures the client logic for interacting with the
 * ElevenLabs Text-to-Speech (TTS) API within the Palavra Viva application.
 * It provides a helper function to generate audio from text using specified voice IDs
 * and uploads the resulting audio to Supabase Storage.
 *
 * Key features:
 * - Retrieves the ElevenLabs API key from environment variables.
 * - Retrieves voice IDs for free and premium tiers from environment variables.
 * - Provides a function `generateAudio` to request TTS generation and store the audio.
 * - Includes basic error handling for API key configuration and upload process.
 *
 * @dependencies
 * - node-fetch (or built-in fetch): For making HTTP requests to the API.
 * - @supabase/supabase-js: For uploading audio to Supabase Storage.
 * - crypto: For generating unique file names.
 *
 * @notes
 * - Ensure `ELEVENLABS_API_KEY`, `ELEVENLABS_VOICE_ID_FREE`, and
 *   `ELEVENLABS_VOICE_ID_PREMIUM` environment variables are set in your `.env` file.
 * - Ensure the Supabase bucket ('audio-content') exists and has appropriate public read policies.
 * - Consider adding more robust error handling (e.g., rate limits, API errors), retry logic.
 * - The API endpoint and request structure should be verified against the current
 *   ElevenLabs documentation.
 */

// --- Configuration ---

const apiKey = process.env.ELEVENLABS_API_KEY;
const envFreeVoiceId = process.env.ELEVENLABS_VOICE_ID_FREE;
const envPremiumVoiceId = process.env.ELEVENLABS_VOICE_ID_PREMIUM;

// Provide default fallbacks if environment variables are not set
export const freeVoiceId = envFreeVoiceId || '21m00Tcm4TlvDq8ikWAM'; // Default free voice
export const premiumVoiceId = envPremiumVoiceId || 'N2lVS1w4EtoT3dr4eOWO'; // Default premium voice

const ELEVENLABS_API_BASE_URL = 'https://api.elevenlabs.io/v1';
const SUPABASE_AUDIO_BUCKET = 'audio-content'; // Your bucket name

// --- Initial Checks ---

if (!apiKey) {
  console.error(
    'ERROR: [ElevenLabs] API key is not configured. Please set ELEVENLABS_API_KEY in environment variables.',
  );
}
if (!envFreeVoiceId) {
  console.warn(
    'WARN: [ElevenLabs] ELEVENLABS_VOICE_ID_FREE not set in environment, using default fallback voice ID.',
  );
}
if (!envPremiumVoiceId) {
  console.warn(
    'WARN: [ElevenLabs] ELEVENLABS_VOICE_ID_PREMIUM not set in environment, using default fallback voice ID.',
  );
}

// --- Core Function ---

/**
 * @description Generates audio from text using a specified ElevenLabs voice ID,
 * uploads it to Supabase Storage, and returns the public URL.
 *
 * @param {string} text - The text content to convert to speech.
 * @param {string} voiceId - The ID of the ElevenLabs voice to use.
 * @returns {Promise<string | null>} A promise that resolves to the public URL of the
 *                                  generated and stored audio file, or null if generation
 *                                  or upload failed.
 */
export async function generateAudio(
  text: string,
  voiceId: string,
): Promise<string | null> {
  // Debug: Log function entry with params
  console.log('[DEBUG][ElevenLabs] generateAudio called with:', { 
    textLength: text?.length,
    voiceId,
    hasApiKey: !!apiKey
  });

  if (!apiKey) {
    console.error('[ElevenLabs] API key not available for generateAudio call.');
    return null;
  }
  
  if (!text || !voiceId) {
    console.error('[ElevenLabs] Missing text or voiceId for generateAudio call.');
    return null;
  }

  console.log(`[ElevenLabs] Requesting audio generation for voice ${voiceId}...`);
  const apiUrl = `${ELEVENLABS_API_BASE_URL}/text-to-speech/${voiceId}`;
  const requestBody = {
    text: text,
    model_id: 'eleven_multilingual_v2', // Or another suitable model
    voice_settings: {
      stability: 0.5, // Example settings, adjust as needed
      similarity_boost: 0.75,
    },
  };

  try {
    // Step 1: Call ElevenLabs API
    console.log('[DEBUG][ElevenLabs] Sending request to API:', { 
      apiUrl,
      textLength: text.length
    });
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
        Accept: 'audio/mpeg', // Specify expected response type
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`[ElevenLabs] API Error (${response.status}): ${errorBody}`);
      return null;
    }

    // Step 2: Get audio data as a Blob
    const audioBlob = await response.blob();
    if (!audioBlob || audioBlob.size === 0) {
      console.error('[ElevenLabs] Received empty audio blob from API.');
      return null;
    }
    console.log(`[ElevenLabs] Received audio blob, size: ${audioBlob.size} bytes.`);

    // Step 3: Upload Blob to Supabase Storage
    const fileName = `${voiceId}-${randomUUID()}.mp3`;
    console.log(`[DEBUG][Supabase] Uploading to bucket '${SUPABASE_AUDIO_BUCKET}' as '${fileName}'...`);

    const { error: uploadError, data: uploadData } = await supabase.storage
      .from(SUPABASE_AUDIO_BUCKET)
      .upload(fileName, audioBlob, {
        contentType: 'audio/mpeg',
        upsert: false,
      });

    if (uploadError) {
      console.error('[Supabase] Error uploading audio to Storage:', uploadError);
      return null;
    }

    // Debug: Log upload success
    console.log('[DEBUG][Supabase] Upload successful:', uploadData);

    // Step 4: Get Public URL for the uploaded file
    console.log(`[Supabase] Retrieving public URL for '${fileName}'...`);
    const { data: urlData } = supabase.storage
      .from(SUPABASE_AUDIO_BUCKET)
      .getPublicUrl(fileName);

    if (!urlData || !urlData.publicUrl) {
      console.error('[Supabase] Could not get public URL for uploaded audio.');
      return null;
    }

    // Debug: Log the full public URL details for debugging
    console.log('[DEBUG][Supabase] Public URL details:', {
      url: urlData.publicUrl,
      bucket: SUPABASE_AUDIO_BUCKET,
      fileName: fileName,
      urlStructure: {
        isRelative: urlData.publicUrl.startsWith('/'),
        isAbsolute: urlData.publicUrl.startsWith('http'),
        urlLength: urlData.publicUrl.length
      }
    });

    console.log('[Supabase] Successfully uploaded audio. Public URL:', urlData.publicUrl);
    return urlData.publicUrl;

  } catch (error) {
    console.error('[ElevenLabs/Supabase] Unexpected error during audio generation or upload:', error);
    return null;
  }
}