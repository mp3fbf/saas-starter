/**
 * @description
 * Page component for the Prayer Pairing feature (`/app/orar-dupla`).
 * This page displays the user interface for requesting and managing anonymous
 * prayer pairings. It fetches the user's initial status server-side and renders
 * the `PrayerPairingInterface` client component to handle interactions.
 *
 * @dependencies
 * - React: Core React library.
 * - next/navigation (redirect): For redirecting unauthenticated users.
 * - @/lib/db/queries (getUser, getPrayerPairStatus): Functions to fetch user and status data.
 * - @/app/(app)/_components/prayer-pairing-interface (PrayerPairingInterface): The client component for UI and interactions.
 *
 * @notes
 * - Marked as an async Server Component (`async function Page`) to fetch initial data.
 * - Middleware should protect this route, but an explicit user check is included.
 */
import React from 'react';
import { redirect } from 'next/navigation';
import { getUser, getPrayerPairStatus } from '@/lib/db/queries';
import PrayerPairingInterface from '@/app/(app)/_components/prayer-pairing-interface';

// Indicate that this is an async Server Component.
export default async function OrarDuplaPage() {
  // Get the authenticated user
  const user = await getUser();

  // Redirect to sign-in if the user is somehow not authenticated
  if (!user) {
    redirect('/sign-in?redirect=/app/orar-dupla');
  }

  // Fetch the initial prayer pairing status for the user
  const initialStatus = await getPrayerPairStatus(user.id);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-2 text-center">Oração em Dupla</h1>
      <p className="text-muted-foreground mb-6 text-center max-w-xl mx-auto">
        Experimente o poder da oração comunitária! Conecte-se anonimamente com
        outro irmão ou irmã em Cristo para intercederem um pelo outro.
      </p>

      {/*
        Render the client component responsible for the UI and interactions,
        passing the initial status fetched on the server.
      */}
      <PrayerPairingInterface initialStatus={initialStatus} />
    </div>
  );
}