/**
 * @description
 * Page component for the Personal Prayers section (`/app/oracoes`).
 * This page displays the user's prayer list, managed via local storage
 * by the `PrayerList` client component.
 *
 * @dependencies
 * - React: Core React library.
 * - @/app/(app)/_components/prayer-list (PrayerList): The client component that handles prayer management.
 *
 * @notes
 * - Marked as a Server Component (`"use server";`).
 * - It simply renders the `PrayerList` component, which contains all the
 *   client-side logic for interacting with localStorage and managing prayers.
 */
import React from 'react';
import PrayerList from '@/app/(app)/_components/prayer-list'; // Import the client component

// Indicate that this is a Server Component.
// It renders the PrayerList client component which handles interaction.
'use server';

export default function OracoesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/*
        The PrayerList component is a client component responsible for
        handling the display, addition, and deletion of prayers using
        localStorage. This server page just needs to render it.
      */}
      <PrayerList />
    </div>
  );
}