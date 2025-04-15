'use server';

import { getStripePrices, getStripeProducts } from '@/lib/payments/stripe';
import { checkoutAction, customerPortalAction } from '@/lib/payments/actions';
import { getUserWithSubscription } from '@/lib/db/queries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { isUserPremium } from '@/lib/auth/helpers';
import { Check } from 'lucide-react';

// Define interfaces for the simplified data structures returned by our helpers
interface SimpleProduct {
  id: string;
  name: string;
  description: string | null;
  defaultPriceId: string | undefined;
}

interface SimplePrice {
  id: string;
  productId: string;
  productName: string;
  unitAmount: number | null;
  currency: string;
  interval: 'day' | 'week' | 'month' | 'year' | undefined;
  trialPeriodDays: number | null | undefined;
}

/**
 * @description
 * Pricing page for Palavra Viva. Displays the available subscription plan (Premium)
 * and allows users to initiate the checkout process or manage their existing subscription.
 *
 * Key features:
 * - Fetches product and price information from Stripe.
 * - Checks the user's current subscription status.
 * - Displays plan features and pricing.
 * - Provides a button to start the 7-day free trial via Stripe Checkout.
 * - Provides a button to manage an existing subscription via Stripe Customer Portal.
 * - Handles errors during data fetching from Stripe.
 *
 * @dependencies
 * - @/lib/payments/stripe (getStripePrices, getStripeProducts): Functions to fetch plan data.
 * - @/lib/payments/actions (checkoutAction, customerPortalAction): Server actions for Stripe checkout and portal.
 * - @/lib/db/queries (getUserWithSubscription): Function to get user and subscription data.
 * - @/components/ui/* (Button, Card, etc.): Shadcn UI components.
 * - @/lib/auth/helpers (isUserPremium): Utility to check premium status.
 * - lucide-react (Check): Icon component.
 *
 * @notes
 * - Assumes a single "Premium" product defined in Stripe.
 * - Uses simplified data structures (`SimpleProduct`, `SimplePrice`) matching the return types of helper functions.
 * - Formats price according to Brazilian locale (pt-BR, BRL).
 */
export default async function PricingPage() {
  // Fetch user data to check current status
  const userData = await getUserWithSubscription();
  // Determine if user is premium (active subscription or valid trial)
  const isPremium = isUserPremium(userData, userData?.account);

  // Fetch products and prices from Stripe using our helper functions
  let products: SimpleProduct[] = [];
  let prices: SimplePrice[] = [];
  let error: string | null = null;

  try {
    // These functions return simplified structures
    products = await getStripeProducts();
    prices = await getStripePrices();
  } catch (e) {
    console.error("Error fetching Stripe products/prices:", e);
    error = "Não foi possível carregar os planos. Tente novamente mais tarde.";
  }

  // Find the premium product and its associated price
  // Assumes product name contains "Premium" (case-insensitive)
  const premiumProduct = products.find(p => p.name.toLowerCase().includes('premium'));
  // Finds the price associated with the found product's ID
  const premiumPrice = prices.find(p => p.productId === premiumProduct?.id);

  // Helper function to format the price amount into BRL currency string
  const formatPrice = (price: SimplePrice | undefined): string => {
    if (!price || price.unitAmount === null || price.unitAmount === undefined) return 'Gratuito'; // Handle free or missing amount
    const amount = price.unitAmount / 100; // Convert cents to currency unit
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: price.currency.toUpperCase(), // Use currency from Stripe Price object
    }).format(amount);
  };

  // Helper function to format the recurring interval text
  const getIntervalText = (price: SimplePrice | undefined): string => {
    if (!price?.interval) return '';
    // Translate interval into Portuguese
    const intervalMap = { day: 'dia', week: 'semana', month: 'mês', year: 'ano' };
    return `/ ${intervalMap[price.interval] || price.interval}`;
  };

  return (
    <div className="container mx-auto max-w-4xl py-12 px-4">
      <h1 className="text-3xl font-bold text-center mb-4">Escolha seu Plano</h1>
      <p className="text-center text-muted-foreground mb-10">
        Comece gratuitamente com nosso teste de 7 dias do plano Premium.
      </p>

      {/* Display error message if fetching failed */}
      {error && (
        <p className="text-center text-red-500 mb-6">{error}</p>
      )}

      <div className="grid grid-cols-1 gap-8">
        {/* Premium Plan Card */}
        {/* Add green border if user is already premium */}
        <Card className={isPremium ? 'border-primary' : ''}>
          <CardHeader className="text-center">
            {/* Display Product Name or default */}
            <CardTitle className="text-2xl">{premiumProduct?.name || 'Premium'}</CardTitle>
            {/* Display Product Description or default */}
            <CardDescription>
              {premiumProduct?.description || 'Acesso completo a todos os recursos e conteúdos.'}
            </CardDescription>
            {/* Display Price */}
            <div className="mt-4">
              <span className="text-4xl font-bold">{formatPrice(premiumPrice)}</span>
              <span className="text-muted-foreground text-sm">{getIntervalText(premiumPrice)}</span>
            </div>
          </CardHeader>
          <CardContent>
            {/* List of Features */}
            <ul className="space-y-3 mb-8">
              {[ // Define premium features
                'Reflexões diárias inspiradoras',
                'Áudio das reflexões com voz naturalista',
                'Planos de leitura bíblica guiados',
                'Sem anúncios',
                'Temas visuais exclusivos',
                'Oração em dupla (anônima)',
                'Acesso offline (em breve)',
              ].map((feature) => (
                <li key={feature} className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>

            {/* Checkout Button - shown only if price is available */}
            {premiumPrice && (
              // Form triggering the checkout server action
              <form action={checkoutAction}>
                {/* Hidden input passing the Stripe Price ID */}
                <input type="hidden" name="priceId" value={premiumPrice.id} />
                <Button
                  type="submit"
                  className="w-full"
                  // Disable button if user is already premium, price unavailable, or error occurred
                  disabled={isPremium || !premiumPrice || !!error}
                >
                  {/* Button text changes based on premium status */}
                  {isPremium ? 'Plano Ativo' : `Iniciar Teste Gratuito de ${premiumPrice.trialPeriodDays || 7} Dias`}
                </Button>
              </form>
            )}
            {/* Message if price is unavailable and no error occurred */}
            {!premiumPrice && !error && (
              <p className="text-center text-muted-foreground">Plano Premium indisponível no momento.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Link to Customer Portal - shown only if user is premium and has Stripe customer ID */}
      {isPremium && userData?.account?.stripeCustomerId && (
        <div className="text-center mt-8">
           {/* Form triggering the customer portal server action */}
           <form action={customerPortalAction}>
              <Button type="submit" variant="outline">
                Gerenciar minha assinatura
              </Button>
            </form>
        </div>
      )}
    </div>
  );
}
