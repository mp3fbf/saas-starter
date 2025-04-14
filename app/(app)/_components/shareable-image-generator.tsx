/**
 * @description
 * Client component responsible for generating a shareable image (e.g., for social media)
 * containing a Bible verse or reflection snippet from the daily content. It uses the
 * HTML Canvas API to draw the image and the Web Share API to trigger native sharing,
 * providing a download fallback if sharing is not supported. The image background and text
 * colors are chosen based on the current application theme passed as a prop.
 *
 * Key features:
 * - Renders a "Share Image" button.
 * - Uses a hidden canvas element to draw the image dynamically.
 * - Selects background/text colors based on the provided theme prop.
 * - Draws a background, wraps and styles text (verse or reflection).
 * - Adds basic branding.
 * - Attempts to use the Web Share API for native sharing.
 * - Provides an image download fallback if Web Share API is unavailable.
 *
 * @dependencies
 * - react (useRef): Core React hook for referencing the canvas element.
 * - @/components/ui/button (Button): Shadcn button component.
 * - lucide-react (Share2, Download): Icons for buttons.
 * - @/lib/utils (cn): Utility for merging class names.
 *
 * @props
 * - verseRef: The reference of the Bible verse (e.g., "João 3:16").
 * - verseText: The full text of the Bible verse.
 * - reflectionText: The text of the daily reflection.
 * - theme?: Optional string indicating the current theme ('light', 'dark', 'gold'). Defaults to 'light'.
 *
 * @notes
 * - Uses `"use client"`.
 * - Canvas dimensions are set for a square format (e.g., 1080x1080).
 * - Text wrapping logic is included in the `wrapText` helper function.
 * - Explicit hex color codes are used for drawing based on the theme.
 * - Error handling is included for the Web Share API call.
 * - The canvas is hidden visually using CSS but is still used for drawing.
 */
'use client';

import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Share2, Download } from 'lucide-react'; // Using Share2 for consistency
import { cn } from '@/lib/utils';

// Define the props interface for the component
interface ShareableImageGeneratorProps {
  verseRef: string;
  verseText: string;
  reflectionText: string;
  theme?: string; // Optional theme name ('light', 'dark', 'gold')
}

export function ShareableImageGenerator({
  verseRef,
  verseText,
  reflectionText,
  theme = 'light', // Default to 'light' theme
}: ShareableImageGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const appName = 'Palavra Viva App'; // Branding text

  /**
   * @description Helper function to wrap and draw text on the canvas.
   * @param {CanvasRenderingContext2D} context - The canvas rendering context.
   * @param {string} text - The text to draw.
   * @param {number} x - The starting X coordinate.
   * @param {number} y - The starting Y coordinate for the first line.
   * @param {number} maxWidth - The maximum width allowed for the text before wrapping.
   * @param {number} lineHeight - The height of each line of text.
   */
  const wrapText = (
    context: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number,
  ) => {
    const words = text.split(' ');
    let line = '';
    let currentY = y;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = context.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        context.fillText(line.trim(), x, currentY); // Draw the current line (trim trailing space)
        line = words[n] + ' '; // Start the new line
        currentY += lineHeight; // Move to the next line position
      } else {
        line = testLine; // Add the word to the current line
      }
    }
    context.fillText(line.trim(), x, currentY); // Draw the last line (trim trailing space)
  };

  /**
   * @description Triggers the download of the canvas content as a PNG image.
   * @param {HTMLCanvasElement} canvas - The canvas element containing the image.
   */
  const downloadFallback = (canvas: HTMLCanvasElement) => {
    console.log('Web Share API not supported or failed, initiating download fallback.');
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `palavra_viva_${verseRef.replace(/[:\s]/g, '_')}.png`; // Create a filename
    document.body.appendChild(link); // Required for Firefox
    link.click();
    document.body.removeChild(link);
  };

  /**
   * @description Generates the image on the canvas using theme-appropriate colors and
   * attempts to share it using the Web Share API, falling back to download if necessary.
   */
  const generateAndShare = async () => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.error('Canvas element not found.');
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('Canvas context not available.');
      return;
    }

    // --- Determine Colors Based on Theme ---
    let backgroundColorHex = '#FFFFFF'; // Default: Light theme background (White)
    let textColorHex = '#212529'; // Default: Light theme text (Dark Gray)

    switch (theme) {
      case 'dark':
        backgroundColorHex = '#212529'; // Dark Gray background
        textColorHex = '#F8F9FA'; // Very Light Gray text
        break;
      case 'gold':
        backgroundColorHex = '#EFAF00'; // Darker Gold background
        textColorHex = '#343A40'; // Dark Gray/Black text
        break;
      case 'light':
      default:
        // Already set to defaults above
        break;
    }
    console.log(`[Share Image] Using theme: ${theme}, BG: ${backgroundColorHex}, Text: ${textColorHex}`);

    // --- Canvas Drawing ---
    const width = 1080; // Square format suitable for Instagram
    const height = 1080;
    const padding = 80; // Padding around the text
    const maxWidth = width - padding * 2;

    canvas.width = width;
    canvas.height = height;

    // 1. Background (Using theme-based color)
    ctx.fillStyle = backgroundColorHex;
    ctx.fillRect(0, 0, width, height);

    // 2. Text Content (Prioritize verse, fallback to reflection snippet)
    const verseWordCount = verseText?.split(' ').length || 0;
    const maxWords = 50; // Define a reasonable limit for verse text on image
    const textToShare = (verseText && verseWordCount <= maxWords)
        ? verseText
        : reflectionText.substring(0, 200) + (reflectionText.length > 200 ? '...' : ''); // Snippet

    const refText = verseRef;

    // Text Styling (Using theme-based color)
    ctx.fillStyle = textColorHex;
    ctx.textAlign = 'center';
    const baseFontSize = 48; // Adjust as needed
    const lineHeight = baseFontSize * 1.4;
    // Ensure font is loaded, otherwise use fallback
    ctx.font = `italic ${baseFontSize}px Manrope, sans-serif`;

    // Calculate approximate number of lines needed for dynamic vertical centering
    const words = `"${textToShare}"`.split(' ');
    let lines = 1;
    let currentLine = '';
    for (const word of words) {
        const testLine = currentLine + word + ' ';
        if (ctx.measureText(testLine).width > maxWidth && currentLine !== '') {
            lines++;
            currentLine = word + ' ';
        } else {
            currentLine = testLine;
        }
    }
    const totalTextHeight = lines * lineHeight;
    // Adjust start Y for centering, considering reference text space below
    const startY = (height - totalTextHeight - (lineHeight * 1.5) - 36) / 2 + lineHeight;

    // Draw Main Text (Wrapped)
    wrapText(
      ctx,
      `"${textToShare}"`, // Add quotes around verse/reflection
      width / 2, // Center horizontally
      startY, // Use calculated start Y
      maxWidth,
      lineHeight,
    );

    // Draw Verse Reference (Below the main text)
    const refFontSize = 36;
    ctx.font = `normal ${refFontSize}px Manrope, sans-serif`;
    // Position reference text below the wrapped text block
    const refY = startY + totalTextHeight + lineHeight * 0.5;
    ctx.fillText(
      `- ${refText}`,
      width / 2, // Center horizontally
      refY,
    );

    // 3. Branding
    const brandFontSize = 28;
    ctx.font = `normal ${brandFontSize}px Manrope, sans-serif`;
    ctx.fillStyle = textColorHex; // Use theme text color
    ctx.globalAlpha = 0.7; // Slightly transparent branding
    ctx.fillText(
      appName,
      width / 2, // Center horizontally
      height - padding / 2, // Position near the bottom
    );
    ctx.globalAlpha = 1.0; // Reset alpha

    // --- Sharing Logic ---
    canvas.toBlob(async (blob) => {
      if (!blob) {
        console.error('Failed to create blob from canvas.');
        alert('Erro ao gerar a imagem para compartilhamento.');
        return;
      }

      const file = new File([blob], `palavra_viva_${verseRef.replace(/[:\s]/g, '_')}.png`, { type: 'image/png' });
      const shareData = {
        files: [file],
        title: `Palavra Viva - ${verseRef}`,
        text: `Reflexão sobre ${verseRef} no app Palavra Viva.`,
      };

      // Check if Web Share API is available and can share files
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        try {
          console.log('Attempting to share using Web Share API...');
          await navigator.share(shareData);
          console.log('Shared successfully via Web Share API.');
        } catch (error) {
          // Handle errors (e.g., user cancelled share)
          if (error instanceof Error && error.name !== 'AbortError') {
            console.error('Error using Web Share API:', error);
            // Fallback to download if sharing fails for reasons other than cancellation
            downloadFallback(canvas);
          } else {
            console.log('Share action aborted by user or failed silently.');
             // Optionally provide download even if aborted: downloadFallback(canvas);
          }
        }
      } else {
        // Web Share API not supported or cannot share files, use download fallback
        downloadFallback(canvas);
      }
    }, 'image/png'); // Specify PNG format
  };

  return (
    <>
      {/* The canvas element used for drawing. It's hidden visually. */}
      <canvas
        ref={canvasRef}
        width={1080}
        height={1080}
        className="hidden" // Hide the canvas element itself
        aria-hidden="true"
      ></canvas>

      {/* The button that triggers the image generation and sharing */}
      <Button variant="outline" onClick={generateAndShare} className="w-full sm:w-auto">
        <Share2 className="mr-2 h-4 w-4" />
        Compartilhar Imagem
      </Button>
      {/* Note: Consider adding a loading state to the button */}
    </>
  );
}