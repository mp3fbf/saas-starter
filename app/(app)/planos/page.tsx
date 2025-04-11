/**
 * @description
 * Placeholder page component for the Reading Plans list view (`/app/planos`).
 * This page will eventually display a list of available Bible reading plans.
 * For the initial setup (Step 4.5), it only renders a title.
 *
 * @dependencies
 * - React: Core React library.
 *
 * @notes
 * - Marked as a Server Component (`"use server";`).
 * - Actual data fetching and rendering of plan cards will be implemented in later steps.
 */
import React from 'react';

// Indicate that this is a Server Component.
// It might become an async function later to fetch plan data.
export default function PlanosPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-4">Planos de Leitura</h1>
      <p className="text-muted-foreground">
        (Conteúdo dos planos de leitura será exibido aqui.)
      </p>
    </div>
  );
}