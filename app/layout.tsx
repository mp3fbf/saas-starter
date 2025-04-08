/**
 * @description
 * This is the root layout component for the entire Palavra Viva application.
 * It sets up the basic HTML structure, applies global styles and fonts,
 * configures metadata for SEO and PWA, and wraps the application in necessary providers,
 * specifically the UserProvider for authentication state.
 *
 * Key features:
 * - Defines global metadata (title, description).
 * - Sets up viewport configuration for responsiveness.
 * - Applies the Manrope font globally.
 * - Initializes the UserProvider with the authenticated user state fetched server-side.
 * - Provides the base HTML document structure (html, body).
 *
 * @dependencies
 * - next/font/google: For loading the Manrope font.
 * - @/lib/auth (UserProvider): Context provider for user authentication state.
 * - @/lib/db/queries (getUser): Function to fetch initial user state server-side.
 * - ./globals.css: Global styles for the application.
 *
 * @notes
 * - The `userPromise` is passed to `UserProvider` to avoid waterfalls and allow
 *   server components deeper in the tree to access user data quickly if needed,
 *   while still providing the user state via context for client components.
 * - The `themeColor` meta tag is added for PWA theming consistency.
 */
import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Manrope } from 'next/font/google';
import { UserProvider } from '@/lib/auth';
import { getUserWithSubscription } from '@/lib/db/queries'; // Will update this import later when the function is created

// Load the Manrope font with the Latin subset
const manrope = Manrope({ subsets: ['latin'] });

/**
 * @description
 * Metadata configuration for the Palavra Viva application.
 * Includes title, description, and theme color for PWA/browser integration.
 */
export const metadata: Metadata = {
  title: 'Palavra Viva - Seu Devocional Diário',
  description:
    'App devocional cristão com versículos, reflexões, áudio e mais.',
  themeColor: '#ADD8E6', // Light Blue - Can be refined later
};

/**
 * @description
 * Viewport configuration for the application.
 * Disables user scaling for a more app-like feel on mobile.
 */
export const viewport: Viewport = {
  maximumScale: 1,
};

/**
 * @description
 * RootLayout component serves as the main layout for all pages.
 * It sets up the HTML structure, applies global styles, loads fonts,
 * and wraps the application content with the UserProvider for authentication state.
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
  let userPromise = getUserWithSubscription(); // Placeholder, function needs implementation

  return (
    <html
      lang="pt-BR" // Set language to Brazilian Portuguese
      className={`bg-white dark:bg-gray-950 text-black dark:text-white ${manrope.className}`}
    >
      <body className="min-h-[100dvh] bg-gray-50">
        {/* UserProvider makes user authentication state available throughout the app */}
        <UserProvider userPromise={userPromise}>{children}</UserProvider>
      </body>
    </html>
  );
}