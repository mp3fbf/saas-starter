/**
 * @description
 * Layout component for the core authenticated application routes within the `(app)` group.
 * This layout wraps the main content of the Palavra Viva app sections (like Home, Planos, etc.)
 * and includes the `BottomNavigation` component for mobile navigation.
 *
 * Key features:
 * - Provides the main structure for the authenticated app view.
 * - Includes the `BottomNavigation` component, which is visible on mobile screens.
 * - Adds bottom padding to the main content area to prevent overlap with the bottom navigation.
 *
 * @dependencies
 * - React: Core React library.
 * - @/app/(app)/_components/bottom-navigation (BottomNavigation): The mobile navigation bar component.
 *
 * @notes
 * - Marked as a Server Component (`"use server";`) as it doesn't require client-side hooks directly.
 * - The `BottomNavigation` component itself is a Client Component.
 * - `pb-16 lg:pb-0` class on `<main>` prevents content from being obscured by the fixed bottom nav on mobile.
 */
import React from 'react'; // Import React
import { BottomNavigation } from '@/app/(app)/_components/bottom-navigation'; // Import the component

// Indicate that this is a Server Component.
// Data fetching for user context (like theme) might be added here later if needed.
export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Main content area */}
      {/* Added pb-16 for padding below content, lg:pb-0 removes it on large screens */}
      {/* Wrap children in a main tag for semantic structure */}
      <main className="flex-1 pb-16 lg:pb-0">{children}</main>

      {/* Render the Bottom Navigation component */}
      {/* It will be conditionally displayed based on screen size via its own Tailwind classes */}
      <BottomNavigation />
    </div>
  );
}