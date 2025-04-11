/**
 * @description
 * Client component implementing the bottom navigation bar for the Palavra Viva app.
 * This navigation is primarily intended for mobile views and provides quick access
 * to the main sections of the authenticated application (`/app/*`).
 *
 * Key features:
 * - Uses `next/link` for client-side navigation.
 * - Uses `usePathname` hook to determine the active route for highlighting.
 * - Displays icons from `lucide-react` alongside labels.
 * - Fixed to the bottom of the viewport on smaller screens (`lg:hidden`).
 * - Highlights the currently active navigation item.
 *
 * @dependencies
 * - react: Core React library, specifically `useState`.
 * - next/link: For client-side navigation.
 * - next/navigation (usePathname): To get the current route path.
 * - lucide-react: For icons (Home, ListChecks, NotebookPen, Users, Settings).
 * - @/lib/utils (cn): Utility for conditional class names.
 *
 * @notes
 * - The component is marked with `"use client"` as it uses React hooks.
 * - Styling uses Tailwind CSS classes for layout, positioning, and appearance.
 * - The active link style changes the color of the icon and text.
 * - Assumes the theme variables (`--color-primary`, `--color-muted-foreground`) are defined in `globals.css`.
 */
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  ListChecks,
  NotebookPen,
  Users,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Define the structure for a navigation item
interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType; // Lucide icons are components
}

export function BottomNavigation() {
  const pathname = usePathname();

  // Define the navigation items
  const navItems: NavItem[] = [
    { href: '/app', label: 'Início', icon: Home },
    { href: '/app/planos', label: 'Planos', icon: ListChecks },
    { href: '/app/oracoes', label: 'Orações', icon: NotebookPen },
    { href: '/app/orar-dupla', label: 'Orar Dupla', icon: Users },
    { href: '/dashboard', label: 'Ajustes', icon: Settings }, // Link to existing dashboard/settings
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card shadow-sm lg:hidden">
      <div className="mx-auto flex h-16 max-w-md items-center justify-around px-2">
        {navItems.map((item) => {
          // Determine if the current item's link is active.
          // Handle exact match for '/' and prefix match for others.
          const isActive =
            item.href === '/app'
              ? pathname === item.href
              : pathname?.startsWith(item.href);

          // Dynamically set class names based on active state
          const linkClasses = cn(
            'flex flex-col items-center justify-center space-y-1 rounded-md p-2 text-xs font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
            isActive
              ? 'text-primary' // Active link color using CSS variable
              : 'text-muted-foreground', // Inactive link color
          );

          return (
            <Link key={item.href} href={item.href} className={linkClasses}>
              <item.icon className="h-5 w-5" aria-hidden="true" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}