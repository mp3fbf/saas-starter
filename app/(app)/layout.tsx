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
import React from 'react';
import { getUserWithSubscription } from '@/lib/db/queries';
import Link from 'next/link';
import { signOut } from './actions';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch user data to display in the header
  const userData = await getUserWithSubscription();
  
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header with navigation and auth controls */}
      <header className="bg-primary text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div className="font-bold text-xl">Palavra Viva</div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className="hover:underline">
              Devocional
            </Link>
            <Link href="/planos" className="hover:underline">
              Planos
            </Link>
            <Link href="/oracoes" className="hover:underline">
              Orações
            </Link>
            <Link href="/orar-dupla" className="hover:underline">
              Orar em Dupla
            </Link>
            <Link href="/profile" className="hover:underline">
              Perfil
            </Link>
            
            {/* User info and logout */}
            <div className="flex items-center space-x-2">
              <span className="text-sm">
                {userData?.email}
              </span>
              <form action={signOut}>
                <button 
                  type="submit"
                  className="bg-white text-primary px-3 py-1 rounded-md text-sm hover:bg-gray-100"
                >
                  Sair
                </button>
              </form>
            </div>
          </nav>
          
          {/* Mobile Navigation - Bottom Tabs */}
          <div className="md:hidden flex items-center">
            {/* User email and logout button */}
            <span className="text-sm mr-2">
              {userData?.email}
            </span>
            <form action={signOut}>
              <button 
                type="submit"
                className="bg-white text-primary px-2 py-1 rounded-md text-xs hover:bg-gray-100"
              >
                Sair
              </button>
            </form>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-grow">
        {children}
      </main>
      
      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 w-full bg-white border-t border-gray-200 flex justify-around p-2">
        <Link href="/" className="flex flex-col items-center p-2 text-primary">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7m-14 0l2 2m0 0l7 7 7-7" />
          </svg>
          <span className="text-xs">Home</span>
        </Link>
        <Link href="/planos" className="flex flex-col items-center p-2 text-gray-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <span className="text-xs">Planos</span>
        </Link>
        <Link href="/oracoes" className="flex flex-col items-center p-2 text-gray-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <span className="text-xs">Orações</span>
        </Link>
        <Link href="/orar-dupla" className="flex flex-col items-center p-2 text-gray-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <span className="text-xs">Dupla</span>
        </Link>
        <Link href="/profile" className="flex flex-col items-center p-2 text-gray-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="text-xs">Perfil</span>
        </Link>
      </nav>
      
      {/* Footer - Hidden on mobile due to bottom nav */}
      <footer className="hidden md:block bg-gray-100 p-4 text-center text-gray-600 text-sm">
        <div className="container mx-auto">
          Palavra Viva &copy; {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
}