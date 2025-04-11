/**
 * @description
 * An animated terminal component, primarily for visual effect on the marketing page.
 * It simulates typing out setup commands.
 * Moved from `app/(dashboard)/terminal.tsx` to `app/terminal.tsx` to be co-located
 * with the root marketing page (`app/page.tsx`) that uses it.
 *
 * @dependencies
 * - react (useState, useEffect): For managing animation state and side effects.
 * - lucide-react: For copy/check icons.
 *
 * @notes
 * - The commands shown are from the original template and should ideally be
 *   updated or removed if not relevant to Palavra Viva's setup/marketing.
 */
'use client';

import { useState, useEffect } from 'react';
import { Copy, Check } from 'lucide-react';

export function Terminal() {
  const [terminalStep, setTerminalStep] = useState(0);
  const [copied, setCopied] = useState(false);
  // TODO: Update these commands if this component is kept for Palavra Viva
  const terminalSteps = [
    'git clone https://github.com/seu-usuario/palavra-viva', // Example update
    'pnpm install',
    'pnpm db:migrate',
    'pnpm db:seed', // Optional depending on final setup
    'pnpm dev 🎉',
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setTerminalStep((prev) =>
        prev < terminalSteps.length - 1 ? prev + 1 : prev,
      );
      // Reset animation loop after a delay
      if (terminalStep === terminalSteps.length - 1) {
        setTimeout(() => setTerminalStep(0), 3000); // Wait 3s before restarting
      }
    }, 800); // Adjust timing as needed

    return () => clearTimeout(timer);
  }, [terminalStep, terminalSteps.length]); // Add terminalSteps.length dependency

  const copyToClipboard = () => {
    // Intentionally copying only the relevant commands, not the whole sequence
    const commandsToCopy = terminalSteps.slice(0, -1).join('\n'); // Exclude the 'pnpm dev' part
    navigator.clipboard.writeText(commandsToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full rounded-lg shadow-lg overflow-hidden bg-gray-900 text-white font-mono text-sm relative">
      <div className="p-4">
        {/* Terminal Header */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          {/* Copy Button */}
          <button
            onClick={copyToClipboard}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Copy setup commands"
            title="Copy setup commands"
          >
            {copied ? (
              <Check className="h-5 w-5 text-green-400" />
            ) : (
              <Copy className="h-5 w-5" />
            )}
          </button>
        </div>
        {/* Terminal Content */}
        <div className="space-y-2 min-h-[140px]">
          {' '}
          {/* Set min-height to prevent layout shifts */}
          {terminalSteps.map((step, index) => (
            <div
              key={index}
              // Use opacity for fade-in effect, ensure visibility logic is correct
              className={`transition-opacity duration-500 ease-in ${
                index <= terminalStep ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <span className="text-green-400">$</span> {step}
            </div>
          ))}
          {/* Blinking cursor effect (Optional) */}
          {terminalStep < terminalSteps.length -1 && (
             <div className="inline-block h-4 w-2 bg-green-400 animate-pulse"></div>
          )}
        </div>
      </div>
    </div>
  );
}