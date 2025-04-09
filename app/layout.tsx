/**
 * @description
 * This is the root layout component for the entire Palavra Viva application.
 * It sets up the basic HTML structure, applies global styles and fonts,
 * configures metadata for SEO and PWA, and wraps the application in necessary providers,
 * specifically the UserProvider for authentication state and the ServiceWorkerRegistrar
 * for PWA functionality.
 *
 * Key features:
 * - Defines global metadata (title, description).
 * - Sets up viewport configuration for responsiveness.
 * - Applies the Manrope font globally.
 * - Initializes the UserProvider with the authenticated user state fetched server-side.
 * - Provides the base HTML document structure (html, body).
 * - Includes the PWA manifest link.
 * - Registers the service worker using a client component wrapper.
 *
 * @dependencies
 * - next/font/google: For loading the Manrope font.
 * - @/lib/auth (UserProvider): Context provider for user authentication state.
 * - @/lib/db/queries (getUser): Function to fetch initial user state server-side.
 * - ./globals.css: Global styles for the application.
 * - react (useEffect): For client-side service worker registration.
 *
 * @notes
 * - The `userPromise` is passed to `UserProvider` to avoid waterfalls and allow
 *   server components deeper in the tree to access user data quickly if needed,
 *   while still providing the user state via context for client components.
 * - Service worker registration is handled in a separate client component (`ServiceWorkerRegistrar`)
 *   to ensure it only runs in the browser environment.
 */
'use client'; // Marking layout as client component to use useEffect for SW registration

import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Manrope } from 'next/font/google';
import { UserProvider } from '@/lib/auth';
// import { getUserWithSubscription } from '@/lib/db/queries'; // Will update this import later when the function is created
import React, { useEffect } from 'react'; // Import useEffect

// Load the Manrope font with the Latin subset
const manrope = Manrope({ subsets: ['latin'] });

/**
 * @description
 * Metadata configuration for the Palavra Viva application.
 * Includes title, description, and theme color for PWA/browser integration.
 * Note: Exporting metadata directly from a 'use client' component is not supported in App Router.
 * Metadata should typically be exported from Server Components (like page.tsx or server layout.tsx).
 * We will manage metadata in the server component part if needed, or keep it basic here if this layout remains client.
 * For now, we keep the structure but acknowledge this limitation.
 */
// export const metadata: Metadata = { // Cannot export metadata from client component
//   title: 'Palavra Viva - Seu Devocional Diário',
//   description:
//     'App devocional cristão com versículos, reflexões, áudio e mais.',
// };

/**
 * @description
 * Viewport configuration for the application.
 * Disables user scaling for a more app-like feel on mobile.
 */
// export const viewport: Viewport = { // Cannot export viewport from client component
//   maximumScale: 1,
//   themeColor: '#ADD8E6', // Light Blue - Used for browser UI theming
// };

/**
 * @description
 * Client component responsible for registering the service worker.
 * This component uses useEffect to run the registration logic only
 * on the client side after the component mounts.
 */
function ServiceWorkerRegistrar({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log(
            'Service Worker registered with scope:',
            registration.scope,
          );
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    }
  }, []); // Empty dependency array ensures this runs only once on mount

  return <>{children}</>; // Render children passed to it
}

/**
 * @description
 * RootLayout component serves as the main layout for all pages.
 * It sets up the HTML structure, applies global styles, loads fonts,
 * and wraps the application content with the UserProvider and ServiceWorkerRegistrar.
 * @param children - React nodes representing the page content to be rendered within the layout.
 * @returns The root HTML structure for the application.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch the user data server-side. This promise will be resolved by the UserProvider.
  // Note: We'll update `getUser` to `getUserWithSubscription` later as per the plan.
  // let userPromise = getUserWithSubscription(); // Placeholder, function needs implementation
  // TODO: Remove this placeholder when getUserWithSubscription is ready
  let userPromise = Promise.resolve(null); // Temporary placeholder

  return (
    <html
      lang="pt-BR" // Set language to Brazilian Portuguese
      className={`bg-white dark:bg-gray-950 text-black dark:text-white ${manrope.className}`}
    >
      <head>
        {/* Basic Metadata - Consider moving title/desc to specific page.tsx files */}
        <title>Palavra Viva - Seu Devocional Diário</title>
        <meta
          name="description"
          content="App devocional cristão com versículos, reflexões, áudio e mais."
        />
        {/* Viewport settings */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1"
        />
        {/* PWA Manifest Link */}
        <link rel="manifest" href="/manifest.json" />
        {/* Theme Color for PWA/Browser UI */}
        <meta name="theme-color" content="#ADD8E6" />
      </head>
      <body className="min-h-[100dvh] bg-gray-50">
        {/* ServiceWorkerRegistrar handles SW registration on client */}
        <ServiceWorkerRegistrar>
          {/* UserProvider makes user authentication state available throughout the app */}
          <UserProvider userPromise={userPromise}>{children}</UserProvider>
        </ServiceWorkerRegistrar>
      </body>
    </html>
  );
}