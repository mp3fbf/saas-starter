/**
 * @description
 * This file defines the UserContext and UserProvider for managing global
 * user authentication state within the Palavra Viva application.
 * It fetches the user's data, including their subscription status,
 * server-side and makes it available to client components via the `useUser` hook.
 *
 * Key Components/Hooks:
 * - `UserContext`: React context holding the user state.
 * - `UserProvider`: Component that fetches user data and provides the context.
 * - `useUser`: Hook for client components to access the user context.
 *
 * State Provided:
 * - `user`: The core user object (type `User`) or null if not logged in.
 * - `team`: The associated team object (type `Team`, representing the user's account/subscription) or null.
 * - `isPremium`: A boolean flag indicating if the user has active premium access (via subscription or trial).
 * - `setUserData`: A function to update the entire user context state (UserWithSubscription | null).
 *
 * @dependencies
 * - react: Core React library for context and hooks.
 * - @/lib/db/schema (User, Team, UserWithSubscription): Database type definitions.
 * - @/lib/auth/helpers (isUserPremium): Helper function to determine premium status.
 * - @/lib/db/queries (getUserWithSubscription): Function to fetch user and subscription data (used via promise prop).
 *
 * @notes
 * - The `UserProvider` expects a `userPromise` prop, typically created by calling `getUserWithSubscription()`
 *   in a server component (like the root layout) and passed down.
 * - `React.use(userPromise)` efficiently resolves the promise for initial state.
 * - The `isPremium` flag is derived state based on the user's subscription and trial data.
 */
'use client'; // This component needs hooks (useState, useContext, useEffect, use)

import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
  use, // Import use hook for resolving promise
} from 'react';
import type { User, Team, UserWithSubscription } from '@/lib/db/schema'; // Import relevant types
import { isUserPremium } from './helpers'; // Import the premium check helper

/**
 * @description Defines the shape of the data provided by the UserContext.
 */
type UserContextType = {
  user: User | null; // The core user data or null if logged out
  team: Team | null; // The associated team/account/subscription data or null
  isPremium: boolean; // Derived flag indicating premium status
  // Function to update the entire user data context (e.g., after login/logout or profile update)
  setUserData: (userData: UserWithSubscription | null) => void;
};

// Create the React Context with an initial value of null.
const UserContext = createContext<UserContextType | null>(null);

/**
 * @description Custom hook to access the UserContext data.
 * Throws an error if used outside of a UserProvider.
 * @returns {UserContextType} The current user context data (user, team, isPremium, setUserData).
 */
export function useUser(): UserContextType {
  const context = useContext(UserContext);
  if (context === null) {
    // Ensure the hook is used within the provider tree
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

/**
 * @description
 * Provides the UserContext to its children. Fetches initial user data
 * (including subscription) using the provided promise and manages the state.
 *
 * @param {object} props - Component props.
 * @param {ReactNode} props.children - The child components to render within the provider.
 * @param {Promise<UserWithSubscription | null>} props.userPromise - A promise that resolves
 *        to the initial user data (including subscription details) or null. This is typically
 *        obtained by calling `getUserWithSubscription()` in a parent server component.
 * @returns {JSX.Element} The UserContext.Provider wrapping the children.
 */
export function UserProvider({
  children,
  userPromise,
}: {
  children: ReactNode;
  userPromise: Promise<UserWithSubscription | null>;
}) {
  // Resolve the promise passed from the server component using React.use
  const initialUserData = use(userPromise);

  // State to hold the user data (including subscription info)
  const [userData, setUserData] = useState<UserWithSubscription | null>(
    initialUserData,
  );

  // Effect to update the state if the initial promise resolution changes
  // (e.g., on navigation or re-render if the promise source updates)
  useEffect(() => {
    setUserData(initialUserData);
  }, [initialUserData]);

  // Derive user, team, and isPremium status from the current state
  const user = userData ? { ...userData, account: undefined } as User : null; // Extract core User type
  const team = userData ? userData.account : null; // Extract Team type
  const isPremium = isUserPremium(userData); // Calculate premium status

  // Provide the derived values and the state setter function to the context
  return (
    <UserContext.Provider value={{ user, team, isPremium, setUserData }}>
      {children}
    </UserContext.Provider>
  );
}