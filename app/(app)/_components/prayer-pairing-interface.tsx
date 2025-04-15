/**
 * @description
 * Client component providing the user interface for the Prayer Pairing feature.
 * It displays the user's current pairing status (not started, waiting, paired),
 * shows notifications if their partner has prayed, and provides buttons to
 * request a pair, mark a prayer as done, or acknowledge a notification.
 *
 * @dependencies
 * - react (useState, useEffect, useActionState, startTransition): Core React hooks.
 * - @/lib/db/schema (PrayerPairStatus): Type definition for the status object.
 * - @/lib/prayers/actions: Server actions for prayer pairing interactions.
 * - @/components/ui/button (Button): Shadcn button component.
 * - @/components/ui/card (Card, CardContent, etc.): Shadcn card components.
 * - @/components/ui/loading-spinner (LoadingSpinner): Loading indicator component.
 * - lucide-react (Users, Check, BellRing, Loader2): Icons.
 * - @/lib/auth/middleware (ActionState): Type for server action state.
 *
 * @props
 * - initialStatus: The initial `PrayerPairStatus` fetched server-side by the parent page.
 *
 * @notes
 * - Uses `"use client";`.
 * - Manages local display state derived from the initial prop and action results.
 * - Uses `useActionState` for handling feedback and pending states of server actions.
 * - Acknowledging the notification clears the `notified` flag locally for immediate UI update,
 *   relying on the server action to persist the change.
 */
'use client';

import React, { useState, useEffect, useActionState, startTransition } from 'react';
import type { PrayerPairStatus } from '@/lib/db/schema';
import type { ActionState } from '@/lib/auth/middleware';
import {
  requestPrayerPair,
  markPrayerAsDone,
  acknowledgePrayerNotification,
} from '@/lib/prayers/actions';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { Users, Check, BellRing, Loader2 } from 'lucide-react';

interface PrayerPairingInterfaceProps {
  initialStatus: PrayerPairStatus;
}

export default function PrayerPairingInterface({
  initialStatus,
}: PrayerPairingInterfaceProps) {
  // Local state to manage the displayed status, initialized by props
  const [displayStatus, setDisplayStatus] = useState<PrayerPairStatus>(initialStatus);

  // Update local state if the initial prop changes (e.g., parent page revalidates)
  useEffect(() => {
    setDisplayStatus(initialStatus);
  }, [initialStatus]);

  // Action state hooks for server actions
  const [requestState, requestPrayerPairAction, isRequestPending] =
    useActionState<ActionState, FormData>(requestPrayerPair, { success: '', error: '' });
  const [markDoneState, markPrayerDoneAction, isMarkDonePending] =
    useActionState<ActionState, FormData>(markPrayerAsDone, { success: '', error: '' });
  const [acknowledgeState, acknowledgeNotificationAction, isAcknowledgePending] =
    useActionState<ActionState, FormData>(acknowledgePrayerNotification, { success: '', error: '' });


    // Effect to update display status based on action results
    useEffect(() => {
        if (requestState.success && requestState.success.includes('Aguardando')) {
            setDisplayStatus(prev => ({ ...prev, status: 'waiting' }));
        } else if (requestState.success && requestState.success.includes('formada')) {
            // Ideally, parent page would revalidate, but force local state change for responsiveness
            setDisplayStatus(prev => ({ ...prev, status: 'paired', notified: false }));
        }
        // Similar logic could be added for markPrayerDoneAction if needed,
        // though the main status doesn't change immediately.
    }, [requestState.success]);

    // Handle acknowledging the notification
    const handleAcknowledge = () => {
        const formData = new FormData(); // Action doesn't need form data, but hook expects it
        startTransition(() => {
            acknowledgeNotificationAction(formData);
            // Optimistically update local state to hide notification immediately
            setDisplayStatus(prev => ({ ...prev, notified: false }));
        });
    }

  // Helper function to render content based on status
  const renderContent = () => {
    switch (displayStatus.status) {
      case 'not_started':
        return (
          <>
            <CardDescription>
              Conecte-se anonimamente com outro membro da comunidade para orarem
              um pelo outro. Ao clicar, você pode ser pareado imediatamente ou
              ficar na fila por até 24 horas.
            </CardDescription>
            <form action={requestPrayerPairAction}>
              <Button type="submit" disabled={isRequestPending} className="w-full mt-4">
                {isRequestPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Users className="mr-2 h-4 w-4" />
                )}
                Quero orar por alguém
              </Button>
            </form>
            {requestState.error && <p className="text-destructive text-sm mt-2">{requestState.error}</p>}
            {requestState.success && <p className="text-green-600 text-sm mt-2">{requestState.success}</p>}
          </>
        );

      case 'waiting':
        return (
          <>
            <CardDescription>
              Estamos buscando um par de oração para você. Sua solicitação
              permanecerá ativa por 24 horas. Você pode voltar mais tarde para
              verificar.
            </CardDescription>
            {/* Optional: Add a cancel request button here */}
             {requestState.error && <p className="text-destructive text-sm mt-2">{requestState.error}</p>}
             {requestState.success && <p className="text-green-600 text-sm mt-2">{requestState.success}</p>}
          </>
        );

      case 'paired':
        return (
          <>
            <CardDescription>
              Você foi conectado com alguém! Lembre-se de orar por essa
              pessoa hoje. Seu anonimato é mantido.
            </CardDescription>
            {/* Notification Area */}
            {displayStatus.notified && (
                <div className="mt-4 p-3 bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-600/50 rounded-md flex items-center justify-between gap-2">
                    <div className="flex items-center">
                        <BellRing className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2 flex-shrink-0" />
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                        Boa notícia! Seu par de oração orou por você.
                        </p>
                    </div>
                    <form action={acknowledgeNotificationAction}>
                         <Button
                            variant="outline"
                            size="sm"
                            onClick={handleAcknowledge} // Use onClick for optimistic update + action
                            disabled={isAcknowledgePending}
                            className="text-xs"
                        >
                            {isAcknowledgePending ? <Loader2 className="h-3 w-3 animate-spin"/> : "Ok"}
                        </Button>
                    </form>
                </div>
            )}
            {acknowledgeState.error && <p className="text-destructive text-sm mt-2">{acknowledgeState.error}</p>}

            {/* Mark as Done Button */}
            <form action={markPrayerDoneAction} className="mt-4">
              <Button type="submit" disabled={isMarkDonePending} className="w-full">
                {isMarkDonePending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Check className="mr-2 h-4 w-4" />
                )}
                Já orei pelo meu par
              </Button>
            </form>
            {markDoneState.error && <p className="text-destructive text-sm mt-2">{markDoneState.error}</p>}
            {markDoneState.success && <p className="text-green-600 text-sm mt-2">{markDoneState.success}</p>}
          </>
        );
      default:
        return <p className="text-muted-foreground">Carregando status...</p>;
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Oração em Dupla</CardTitle>
      </CardHeader>
      <CardContent>{renderContent()}</CardContent>
    </Card>
  );
}