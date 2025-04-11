/**
 * @description
 * This is the main marketing/landing page for the Palavra Viva application.
 * It is displayed at the root path ('/').
 * This content was moved from the original `app/(dashboard)/page.tsx` to resolve
 * routing conflicts with the new `app/(app)/page.tsx`.
 *
 * @dependencies
 * - @/components/ui/button: Button component from Shadcn/ui.
 * - lucide-react: For icons (ArrowRight, CreditCard, Database).
 * - ./terminal: The animated terminal component, now moved to the root app directory.
 *
 * @notes
 * - This page is publicly accessible (not protected by authentication middleware).
 */
'use server'; // Mark as a Server Component

import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, CreditCard, Database } from 'lucide-react';
import { Terminal } from '@/app/terminal'; // Use @ alias

/**
 * @description Renders the main marketing/landing page content.
 * @returns The homepage component.
 */
export default async function MarketingHomePage() {
  // No async operations needed here currently, but returning JSX implicitly works
  // within the Server Component model. Could be marked async if data fetching were added.
  return (
    <main>
      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
              {/* Updated Headline and Description for Palavra Viva */}
              <h1 className="text-4xl font-bold text-gray-900 tracking-tight sm:text-5xl md:text-6xl">
                Seu Devocional Diário
                <span className="block text-primary">Palavra Viva</span>
              </h1>
              <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
                Comece seu dia inspirado com versículos, reflexões e áudio. Uma
                experiência devocional simples e edificante para o seu
                cotidiano.
              </p>
              {/* Updated Call to Action */}
              <div className="mt-8 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left lg:mx-0">
                <Button
                  asChild // Use asChild to make the Button act as a Link wrapper
                  className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full text-lg px-8 py-4 inline-flex items-center justify-center"
                >
                  <a href="/sign-up">
                    Começar Agora
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </a>
                </Button>
              </div>
            </div>
            {/* Terminal Component (Kept from template for visual effect, can be replaced) */}
            <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
              <Terminal />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-3 lg:gap-8">
            {/* Feature 1: Daily Content */}
            <div>
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary text-primary-foreground">
                {/* Replace with a relevant icon e.g., BookOpen */}
                <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current">
                  <path d="M19 2H5C3.9 2 3 2.9 3 4V20C3 21.1 3.9 22 5 22H19C20.1 22 21 21.1 21 20V4C21 2.9 20.1 2 19 2ZM9 4H12V12L10.5 11.25L9 12V4ZM19 20H5V4H7V14L10.5 12.75L14 14V4H19V20Z" />
                </svg>
              </div>
              <div className="mt-5">
                <h2 className="text-lg font-medium text-gray-900">
                  Devocional Diário
                </h2>
                <p className="mt-2 text-base text-gray-500">
                  Receba um versículo e uma reflexão inspiradora todos os dias,
                  com opção de ouvir em áudio.
                </p>
              </div>
            </div>

            {/* Feature 2: Reading Plans */}
            <div className="mt-10 lg:mt-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary text-primary-foreground">
                <Database className="h-6 w-6" />{' '}
                {/* Keep or change icon */}
              </div>
              <div className="mt-5">
                <h2 className="text-lg font-medium text-gray-900">
                  Planos de Leitura
                </h2>
                <p className="mt-2 text-base text-gray-500">
                  Siga planos de leitura bíblica temáticos (Fé, Perdão, etc.)
                  para aprofundar seu estudo.
                </p>
              </div>
            </div>

            {/* Feature 3: Premium */}
            <div className="mt-10 lg:mt-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary text-primary-foreground">
                <CreditCard className="h-6 w-6" />{' '}
                {/* Keep or change icon */}
              </div>
              <div className="mt-5">
                <h2 className="text-lg font-medium text-gray-900">
                  Plano Premium (com Teste)
                </h2>
                <p className="mt-2 text-base text-gray-500">
                  Acesse áudios com voz realista, modo offline, temas e mais.
                  Experimente grátis por 7 dias.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final Call to Action Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                Pronto para começar sua jornada?
              </h2>
              <p className="mt-3 max-w-3xl text-lg text-gray-500">
                Junte-se à comunidade Palavra Viva e fortaleça sua fé
                diariamente com conteúdo inspirador e interações edificantes.
              </p>
            </div>
            <div className="mt-8 lg:mt-0 flex justify-center lg:justify-end">
              <Button
                asChild
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full text-xl px-12 py-6 inline-flex items-center justify-center"
              >
                <a href="/sign-up">
                  Criar Conta Gratuita
                  <ArrowRight className="ml-3 h-6 w-6" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}