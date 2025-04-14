/**
 * @description
 * Client component for managing and displaying a user's personal prayer list.
 * This component allows users to add, view, and delete prayer requests or
 * thanksgivings. The data is stored locally in the browser's `localStorage`.
 *
 * Key features:
 * - Input field to add new prayers.
 * - List display of saved prayers.
 * - Button to delete individual prayers.
 * - Data persistence using `localStorage`.
 *
 * @dependencies
 * - react (useState, useEffect): Core React hooks for state and side effects.
 * - @/components/ui/input (Input): Shadcn component for text input.
 * - @/components/ui/button (Button): Shadcn component for buttons.
 * - @/components/ui/card (Card, CardContent, CardHeader, CardTitle): Shadcn components for layout.
 * - @/components/ui/label (Label): Shadcn component for input labels.
 * - lucide-react (Trash2): Icon for the delete button.
 * - @/lib/utils (cn): Utility for merging class names (optional, added for consistency).
 *
 * @notes
 * - Uses `"use client"` directive as it relies on React hooks and interacts with `localStorage`.
 * - `localStorage` is synchronous and has size limits (typically 5-10MB), suitable for text prayers.
 * - Error handling is included for loading data from `localStorage`.
 * - Prayer IDs are generated using `Date.now()` for simplicity; consider UUIDs for more robust uniqueness if needed.
 */
'use client';

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// Define the type for a single prayer item
interface PrayerItem {
  id: number; // Unique identifier (using timestamp for simplicity)
  text: string; // The content of the prayer
  createdAt: string; // ISO string representation of the creation date
}

// Define the key used for storing prayers in localStorage
const LOCAL_STORAGE_KEY = 'palavraVivaPrayers';

export default function PrayerList() {
  // State for the list of prayers
  const [prayers, setPrayers] = useState<PrayerItem[]>([]);
  // State for the text of the new prayer being entered
  const [newPrayerText, setNewPrayerText] = useState('');
  // State to track loading status
  const [isLoading, setIsLoading] = useState(true);

  // Effect to load prayers from localStorage when the component mounts
  useEffect(() => {
    try {
      const storedPrayers = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedPrayers) {
        // Parse the stored JSON string into an array of PrayerItem objects
        setPrayers(JSON.parse(storedPrayers));
      }
    } catch (error) {
      // Log an error if parsing fails (e.g., corrupted data)
      console.error('Error loading prayers from localStorage:', error);
      // Optionally clear corrupted data: localStorage.removeItem(LOCAL_STORAGE_KEY);
    } finally {
      // Set loading to false after attempting to load
      setIsLoading(false);
    }
  }, []); // Empty dependency array ensures this runs only once on mount

  // Function to add a new prayer to the list
  const addPrayer = () => {
    // Trim whitespace and check if the input text is empty
    const trimmedText = newPrayerText.trim();
    if (!trimmedText) {
      // Optionally show an error message to the user
      alert('Por favor, digite sua oração.');
      return;
    }

    // Create a new prayer item object
    const newPrayer: PrayerItem = {
      id: Date.now(), // Use current timestamp as a simple unique ID
      text: trimmedText,
      createdAt: new Date().toISOString(), // Store date as ISO string
    };

    // Update the state by adding the new prayer to the beginning of the list
    const updatedPrayers = [newPrayer, ...prayers];
    setPrayers(updatedPrayers);

    // Save the updated list back to localStorage
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedPrayers));
    } catch (error) {
      console.error('Error saving prayers to localStorage:', error);
      // Optionally revert state or show an error message
    }

    // Clear the input field
    setNewPrayerText('');
  };

  // Function to delete a prayer by its ID
  const deletePrayer = (idToDelete: number) => {
    // Filter out the prayer with the matching ID
    const updatedPrayers = prayers.filter((prayer) => prayer.id !== idToDelete);

    // Update the state
    setPrayers(updatedPrayers);

    // Save the updated list back to localStorage
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedPrayers));
    } catch (error) {
      console.error('Error saving prayers to localStorage after deletion:', error);
      // Optionally revert state or show an error message
    }
  };

  // Handle Enter key press in the input field to add prayer
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      addPrayer();
    }
  };

  // Show loading indicator while fetching from localStorage
  if (isLoading) {
    return <div>Carregando orações...</div>;
  }

  return (
    <Card className="w-full max-w-2xl mx-auto my-4 shadow-lg border border-border rounded-xl overflow-hidden">
      <CardHeader>
        <CardTitle>Meus Pedidos e Agradecimentos</CardTitle>
        <CardDescription>
          Um espaço privado para seus registros de oração. Eles são salvos
          apenas neste dispositivo.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Input section for adding new prayers */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-grow">
            <Label htmlFor="new-prayer" className="sr-only">
              Nova Oração
            </Label>
            <Input
              id="new-prayer"
              type="text"
              value={newPrayerText}
              onChange={(e) => setNewPrayerText(e.target.value)}
              onKeyDown={handleKeyDown} // Add prayer on Enter key
              placeholder="Escreva sua oração aqui..."
              aria-label="Nova oração"
              className="rounded-md"
            />
          </div>
          <Button onClick={addPrayer} className="rounded-md bg-primary hover:bg-primary/90 text-primary-foreground">
            Adicionar
          </Button>
        </div>

        {/* List of existing prayers */}
        <div className="space-y-3 mt-6 max-h-96 overflow-y-auto pr-2">
          {prayers.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              Você ainda não adicionou nenhuma oração.
            </p>
          ) : (
            prayers.map((prayer) => (
              <Card
                key={prayer.id}
                className="flex items-center justify-between p-3 bg-card border border-border rounded-lg shadow-sm"
              >
                <p className="text-sm text-card-foreground flex-grow mr-2 break-words">
                  {prayer.text}
                </p>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deletePrayer(prayer.id)}
                  aria-label="Excluir oração"
                  className="text-destructive hover:bg-destructive/10 rounded-full h-8 w-8"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </Card>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}