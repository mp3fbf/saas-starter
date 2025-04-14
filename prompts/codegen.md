Codegen Result

Codegen Prompt
The codegen prompt for the o1 Pro Template System.

You are an AI code generator responsible for implementing a web application based on a provided technical specification and implementation plan.

Your task is to systematically implement each step of the plan, one at a time.

First, carefully review the following inputs:

<project_request>
# Project Name
Palavra Viva

## Project Description
“Palavra Viva” é um app devocional cristão voltado ao público evangélico brasileiro. Ele entrega uma experiência diária simples e inspiradora com versículos bíblicos, reflexões curtas, conteúdo em áudio e interações espirituais leves. O app é projetado para ser autoescalável, com conteúdo gerado via IA e manutenção mínima. A monetização será feita através de anúncios e plano premium com período de teste gratuito.

## Target Audience
Público evangélico/cristão brasileiro:
- Idade: 25 a 60 anos
- Interesse em devocionais, reflexões, orações e planos bíblicos
- Usuários não técnicos, acostumados com apps como “YouVersion” ou “Café com Deus Pai”

## Desired Features
### Core Experience
- [ ] Página inicial com conteúdo diário
    - [ ] Versículo do dia (auto-gerado)
    - [ ] Comentário/reflexão curta (IA)
    - [ ] Botão “Ouvir em áudio” (voz gerada via ElevenLabs)
- [ ] Notificação push diária
    - [ ] Enviada às 7h da manhã (ou configurável)
- [ ] Área pessoal de orações
    - [ ] Campo para escrever pedidos/agradecimentos
    - [ ] Armazenamento local (sem backend inicialmente)
- [ ] Plano de leitura bíblica
    - [ ] 7 dias / 30 dias com temas específicos (fé, perdão, etc.)
- [ ] Bênçãos Compartilháveis
    - [ ] Geração de imagem com versículo/reflexão e botão “Compartilhar”
    - [ ] Compatível com WhatsApp, Instagram, etc.
- [ ] Oração em Dupla (com segurança)
    - [ ] Conecta duas pessoas anonimamente para orarem uma pela outra
    - [ ] Envia notificação do tipo: “Alguém orou por você hoje”

### Monetização
- [ ] Plano gratuito com anúncios (AdMob)
- [ ] Plano Premium com período de testes obrigatório (ex: 7 dias)
    - [ ] Áudios com voz realista (ElevenLabs)
    - [ ] Reflexões premium
    - [ ] Modo offline
    - [ ] Temas visuais cristãos (personalização)
    - [ ] Após o período de teste, cobrança automática caso não haja cancelamento

### Admin/Conteúdo
- [ ] Geração automática de conteúdo via OpenAI API
    - [ ] Prompt calibrado para tom cristão/edificante
- [ ] Opção futura de revisão manual ou curadoria

## Design Requests
- [ ] Interface simples e acolhedora
    - [ ] Estilo minimalista com elementos cristãos suaves
    - [ ] Tipografia clara e acessível
    - [ ] Cores suaves: branco, dourado, azul claro, etc.
- [ ] Layout adaptado a leitura e escuta rápidas
    - [ ] Botões grandes e visíveis
    - [ ] Navegação intuitiva

## Other Notes
- App deve ser low maintenance
- Prioridade: tempo rápido até MVP (~1 semana)
- Deve rodar bem mesmo com conexões fracas (offline opcional para Premium)
- Futuras funcionalidades:
    - [ ] Usuário possa escolher temas que deseja receber (fé, cura, família, etc.)
    - [ ] Analytics básico para monitorar engajamento com conteúdos
    - [ ] Variações de notificações push (orações, versículos especiais, etc.)
    - [ ] 🎙️ Mini-podcast Diário Auto-gerado (3 min, com TTS + mixagem)
    - [ ] 📓 Jornada Espiritual Visual (linha do tempo estilo “retrospectiva espiritual”)
    - [ ] 🔥 Desafios de Fé (missões diárias de engajamento espiritual)
    - [ ] 🧠 IA como mentor espiritual personalizado (chat devocional com base bíblica)
    - [ ] 🧍‍♂️ Modo “Deus Falando Contigo” (reflexões em primeira pessoa)
    - [ ] 🧭 Direção Espiritual Aleatória (“Fala comigo, Deus”)</project_request>

<project_rules>
# Project Instructions

Use specification and guidelines as you build the app.

Write the complete code for every step. Do not get lazy.

Your goal is to completely finish whatever I ask for.

You will see <ai_context> tags in the code. These are context tags that you should use to help you understand the codebase.

## Overview

This is a Next.js SaaS starter template.

## Tech Stack

- Frontend: Next.js (App Router), Tailwind CSS, Shadcn/ui
- Backend: Postgres, Drizzle ORM, Server Actions
- Auth: Custom JWT-based authentication (using `jose`, `bcryptjs`, cookies)
- Payments: Stripe
- Deployment: Vercel (recommended)

## Project Structure

- `app/` - Next.js App Router containing route groups, pages, layouts, and API routes.
  - `(dashboard)/` - Route group for authenticated dashboard sections.
    - `dashboard/` - User settings and activity pages/layouts.
    - `pricing/` - Pricing page and related components.
    - `layout.tsx` - Main layout for authenticated areas (includes header).
    - `page.tsx` - Main landing/marketing page.
    - `terminal.tsx` - Animated terminal component for the landing page.
  - `(login)/` - Route group for authentication pages.
    - `sign-in/`, `sign-up/` - Pages for login/registration.
    - `actions.ts` - Server Actions related to authentication and user management.
    - `login.tsx` - Shared component for sign-in/sign-up forms.
  - `api/` - API routes (e.g., Stripe webhooks).
- `components/` - Shared React components.
  - `ui/` - UI components, likely generated by Shadcn/ui (Button, Card, Input, etc.).
- `lib/` - Core logic, utilities, and configurations.
  - `auth/` - Authentication logic (JWT, sessions, middleware helpers).
  - `db/` - Database configuration (Drizzle), schema, migrations, queries, and seeding.
  - `payments/` - Stripe integration logic (actions, client setup).
  - `utils.ts` - Utility functions (e.g., `cn` for class names).
- `public/` - Static assets (implicitly, contains `favicon.ico`).
- Configuration files (`.env.example`, `components.json`, `drizzle.config.ts`, `next.config.ts`, `package.json`, `postcss.config.mjs`, `tsconfig.json`).

## Rules

Follow these rules when building the app.

### General Rules

- Use `@` to import anything from the app unless otherwise specified (e.g., `@/components/ui/button`).
- Use kebab-case for all files and folders unless otherwise specified (e.g., `invite-team.tsx`).
- Don't update shadcn components directly in `components/ui/` unless otherwise specified. Modify them through extension or wrapping if needed.

#### Env Rules

- If you update environment variables, update the `.env.example` file.
- All environment variables should go in `.env`. *Note: The template uses `.env`, not `.env.local`, ensure consistency.*
- Do not expose sensitive environment variables to the frontend. Server-side variables (like `STRIPE_SECRET_KEY`, `POSTGRES_URL`, `AUTH_SECRET`) should only be accessed on the server (Server Components, Server Actions, API routes).
- You may import environment variables in server-side code (Server Actions, API routes, `lib` files used only on the server) by using `process.env.VARIABLE_NAME`.

#### Type Rules

Follow these rules when working with types.

- Types are often co-located with the modules they describe (e.g., DB types in `lib/db/schema.ts`, Action state types in `lib/auth/middleware.ts`). Create new type files in `lib/types/` if needed for broader types.
- If creating separate type files, name them like `example-types.ts`.
- Prefer interfaces over type aliases where appropriate, but use `type` for defining shapes like `ActionState`.
- If referring to DB types generated by Drizzle, import them directly from `@/lib/db/schema`, such as `User`, `NewUser`, `Team`.

An example of the `ActionState` type (defined in `lib/auth/middleware.ts`):

```ts
export type ActionState = {
  error?: string;
  success?: string;
  [key: string]: any; // Allows for additional return data if needed
};
```

### Frontend Rules

Follow these rules when working on the frontend.

It uses Next.js (App Router), Tailwind CSS, and Shadcn/ui components.

#### General Rules

- Use `lucide-react` for icons.
- Use the `useUser` hook from `@/lib/auth` within a `UserProvider` to access user state in client components.

#### Components

- Use standard HTML tags (div, section, button, etc.) as appropriate for semantics.
- Separate the main parts of a component's JSX with an extra blank line for visual spacing.
- Always tag a component file with either `"use server"` or `"use client"` at the top, including layouts and pages, depending on its needs.

##### Organization

- Name component files using kebab-case (e.g., `invite-team.tsx`).
- Put shared UI components (especially those from Shadcn/ui) in `/components/ui/`.
- Route-specific components can be placed directly within their respective route directories (e.g., `app/(dashboard)/dashboard/invite-team.tsx`). Consider using a `_components` subfolder within the route if the number of components grows.

##### Data Fetching & Mutation

- Prefer fetching initial data in Server Components (Pages or Layouts) and passing it down as props to Client Components. Use functions from `lib/db/queries.ts`.
- Use Server Actions (defined in files like `app/(login)/actions.ts` or `lib/payments/actions.ts`) to mutate data.
- Server Actions can be invoked from Client Components using the `action` prop on forms or hooks like `useActionState`.

##### Server Components

- Use `"use server"` at the top of the file if the component itself performs server-only operations (though often data fetching happens in Pages/Layouts which are Server Components by default).
- Implement Suspense for asynchronous data fetching in Pages/Layouts to show loading states (though the current examples don't heavily rely on Suspense boundaries, preferring direct data fetching in async Server Components/Pages).
- If no asynchronous data fetching is required for a given Server Component/Page, you do not need to wrap its children in `<Suspense>`. You can return the final UI directly.
- If asynchronous fetching *is* required (e.g., in an `async function` Page or Layout), data fetching should occur directly within that async function. Suspense can be used higher up the tree or around specific async parts if needed.
- Server components cannot be directly imported and used *within* client components' render logic. Pass Server Components as `children` props to Client Components if necessary.

Example of a Server Page (fetching data):

```tsx
// app/(dashboard)/dashboard/page.tsx
import { redirect } from 'next/navigation';
import { Settings } from './settings'; // This might be a client component
import { getTeamForUser, getUser } from '@/lib/db/queries';

export default async function SettingsPage() {
  const user = await getUser(); // Fetch data directly

  if (!user) {
    redirect('/sign-in');
  }

  const teamData = await getTeamForUser(user.id); // Fetch data directly

  if (!teamData) {
    // Handle error appropriately, maybe redirect or show an error message component
    throw new Error('Team not found');
  }

  // Pass fetched data to the client component
  return <Settings teamData={teamData} />;
}
```

##### Client Components

- Use `"use client"` at the top of the file.
- Use React hooks (`useState`, `useEffect`, `useActionState`, etc.) for interactivity and state management.
- Client components receive initial data as props from parent Server Components.
- Invoke Server Actions for mutations using the `action` prop on `<form>` elements or programmatically with hooks like `useActionState` (often wrapped in `startTransition`).

Example of a Client Component using a Server Action:

```tsx
// app/(dashboard)/dashboard/general/page.tsx
'use client';

import { startTransition, useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
// ... other imports
import { useUser } from '@/lib/auth';
import { updateAccount } from '@/app/(login)/actions'; // Import Server Action

type ActionState = { // Define or import ActionState type
  error?: string;
  success?: string;
};

export default function GeneralPage() {
  const { user } = useUser();
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    updateAccount, // Use the server action
    { error: '', success: '' }
  );

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    startTransition(() => {
      formAction(new FormData(event.currentTarget)); // Call the action
    });
  };

  return (
    <section>
      {/* ... form structure ... */}
      <form className="space-y-4" onSubmit={handleSubmit}>
        {/* ... inputs ... */}
        {state.error && <p className="text-red-500 text-sm">{state.error}</p>}
        {state.success && <p className="text-green-500 text-sm">{state.success}</p>}
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Saving...' : 'Save Changes'}
        </Button>
      </form>
    </section>
  );
}

```

### Backend Rules

Follow these rules when working on the backend.

It uses Postgres, Drizzle ORM, and Server Actions.

#### General Rules

- Use `pnpm db:generate` to create migration files after making changes to `lib/db/schema.ts`.
- Use `pnpm db:migrate` to apply pending migrations to your database.
- Review generated migration SQL files in `lib/db/migrations/` before applying, but generally avoid manual edits unless correcting a generation issue.

#### Organization

##### Schemas

- Define all database schemas in `lib/db/schema.ts`.
- Export table definitions and inferred types (e.g., `User`, `NewUser`) from `lib/db/schema.ts`.
- Use Drizzle relations API within `lib/db/schema.ts` to define relationships between tables.
- If using a `userId`, define it as `userId: integer('user_id').notNull().references(() => users.id)`. Adjust type (`integer`) based on the referenced primary key (`users.id` is `serial` which maps to `integer`).
- Always include `createdAt` and `updatedAt` timestamp columns in tables where tracking creation/modification time is relevant. Use `.defaultNow()` and potentially `.$onUpdate(() => new Date())` for `updatedAt`.
- Ensure foreign key constraints use appropriate `onDelete` behavior (e.g., `"cascade"`, `"set null"`).
- Use Drizzle's `pgEnum` for columns with a fixed set of string values, defining the enum separately and referencing it in the column definition. The target template uses `varchar` with string literals for `role` and `status`; stick to that pattern or refactor to use `pgEnum` if preferred.

Example Schema Snippet (from `lib/db/schema.ts`):

```ts
import { pgTable, serial, varchar, text, timestamp, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: varchar('role', { length: 20 }).notNull().default('member'), // Consider pgEnum here if desired
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(), // Add .$onUpdate(() => new Date()) if auto-update desired
  deletedAt: timestamp('deleted_at'),
});

// ... other tables ...

// Example Relation
export const usersRelations = relations(users, ({ many }) => ({
  teamMembers: many(teamMembers),
  // ... other relations
}));

// Export types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
// ... other types
```

##### Server Actions

- Place authentication and user/team management related Server Actions in `app/(login)/actions.ts`.
- Place payment-related Server Actions in `lib/payments/actions.ts`.
- For other domains, create new `actions.ts` files within relevant `lib/` subdirectories or `app/` route groups.
- Use the `validatedAction`, `validatedActionWithUser`, or `withTeam` wrappers from `lib/auth/middleware.ts` to handle validation (Zod) and user/team context retrieval.
- Actions wrapped with these helpers implicitly return a promise resolving to an `ActionState` object (`{ error?: string; success?: string; ... }`).
- Structure action logic clearly within the wrapper functions.
- **Date Handling:** When comparing or inserting date/timestamp values, ensure JavaScript `Date` objects are used or correctly formatted strings (like ISO strings via `.toISOString()`) are provided to Drizzle, matching the column type.

Example Action using `validatedActionWithUser`:

```ts
// app/(login)/actions.ts
'use server';

import { z } from 'zod';
import { db } from '@/lib/db/drizzle';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { validatedActionWithUser } from '@/lib/auth/middleware';
// ... other imports

const updateAccountSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address'),
});

export const updateAccount = validatedActionWithUser(
  updateAccountSchema,
  async (data, _, user) => { // data is validated, user is authenticated user object
    const { name, email } = data;
    // ... (logActivity logic) ...

    try {
      await db.update(users)
        .set({ name, email }) // Drizzle handles updatedAt via schema default/onUpdate
        .where(eq(users.id, user.id));

      // ... (log activity) ...

      return { success: 'Account updated successfully.' };
    } catch (error) {
      console.error("Error updating account:", error);
      return { error: 'Failed to update account.' };
    }
  },
);

```

### Auth Rules

Follow these rules when working on auth.

It uses a custom JWT-based system with `jose`, `bcryptjs`, and cookies.

#### General Rules

- Authentication state is managed via the `UserProvider` context (`lib/auth/index.tsx`) on the client-side. Use the `useUser()` hook to access the current user in Client Components.
- Server-side authentication checks (in Server Actions, API Routes, Server Components) use the `getUser()` function from `lib/db/queries.ts`, which verifies the session cookie.
- Use the `validatedActionWithUser` and `withTeam` helper functions (`lib/auth/middleware.ts`) for Server Actions requiring authenticated users or team context.
- Session management (creation, verification, update) logic is in `lib/auth/session.ts`.
- Password hashing uses `bcryptjs`.
- Middleware (`middleware.ts`) handles redirecting unauthenticated users from protected routes and refreshing the session cookie.

### Payments Rules

Follow these rules when working on payments.

It uses Stripe.

#### General Rules

- Stripe client and core functions are in `lib/payments/stripe.ts`.
- Server Actions related to payments (e.g., creating checkout sessions, customer portal) are in `lib/payments/actions.ts`.
- API Routes (`app/api/stripe/...`) handle callbacks (like checkout success) and webhooks.
- Use environment variables for Stripe keys (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`).

### Analytics Rules

- No specific analytics solution is integrated in this template. If adding one, create relevant rules here.

### Storage Rules

- No specific file storage solution (like Supabase Storage or S3) is integrated in this template. If adding one, create relevant rules here, potentially adapting the original Supabase Storage rules for the chosen provider.
</project_rules>

<technical_specification>
Spec Result

Okay, I have thoroughly reviewed the project request, the project rules, and the starter template. Here is the planning and the detailed technical specification for the "Palavra Viva" project.

<specification_planning>

**1. Core System Architecture and Key Workflows**

*   **Architecture:** Next.js web application (App Router) deployed on Vercel, utilizing Postgres (via Drizzle) for data, a custom JWT-based auth system, Stripe for payments, OpenAI for content generation, ElevenLabs for TTS, and AdMob for ads. It will be designed mobile-first and potentially function as a Progressive Web App (PWA) to align with the "app" feel while adhering to the Next.js template.
*   **Key Workflows:**
    *   **Daily Content Consumption:** User opens the app -> Sees daily verse, reflection -> Clicks "Listen" -> Plays audio (free/premium voice) -> Optionally shares content.
    *   **Content Generation (Backend):** Scheduled task (e.g., Vercel Cron) triggers a server action -> Calls OpenAI API for verse selection & reflection -> Calls ElevenLabs API for audio generation (free/premium voices) -> Stores content (text, verse ref, audio URLs) in the `daily_content` table.
    *   **Personal Prayers:** User navigates to Prayer Area -> Enters prayer request/thanksgiving -> Saves locally using `localStorage`.
    *   **Reading Plans:** User selects a plan -> Views daily reading -> Marks day as complete -> Progress saved in DB.
    *   **Prayer Pairing:** User requests pairing -> Server action finds another unpaired user (if available) -> Creates a pair record -> Notifies both users anonymously (initially just a simple message, later maybe push).
    *   **Monetization:**
        *   *Free:* User sees ads (AdMob). Uses standard TTS voice.
        *   *Premium:* User starts free trial (7 days) -> Accesses premium features (realistic voice, premium reflections, offline cache, themes) -> If not cancelled, Stripe auto-charges after trial -> Subscription status updated via webhook.
    *   **Authentication:** User signs up/in -> JWT session cookie set -> Middleware protects authenticated routes (`/app/*`) -> `useUser` hook provides user state on the client.

**2. Project Structure and Organization**

*   Follow the template structure (`app`, `components`, `lib`).
*   Create a new route group `app/(app)/` for the core authenticated application features, distinct from the marketing page (`app/(dashboard)/page.tsx` - which might be repurposed or removed) and existing dashboard settings (`app/(dashboard)/dashboard/*`).
*   Add specific folders/files within `app/(app)/`:
    *   `app/(app)/page.tsx`: Main daily content view (Homepage).
    *   `app/(app)/oracoes/page.tsx`: Personal Prayers section.
    *   `app/(app)/planos/page.tsx`: Reading Plans list.
    *   `app/(app)/planos/[planId]/page.tsx`: Specific reading plan view.
    *   `app/(app)/compartilhar/page.tsx`: (Potentially) page for creating shareable images, or handle within the main page component.
    *   `app/(app)/orar-dupla/page.tsx`: Prayer Pairing interface.
*   Add components specific to these features within `app/(app)/_components/` or co-located if simple.
*   New `lib` modules:
    *   `lib/content/`: For OpenAI/ElevenLabs integration logic and content generation actions.
    *   `lib/reading-plans/`: Queries and actions related to reading plans.
    *   `lib/prayers/`: Actions related to prayer pairing (local prayers don't need backend lib).
    *   `lib/ads/`: AdMob integration helpers (if needed beyond simple component embedding).
    *   `lib/types/`: Define app-specific types (e.g., `DailyContent`, `ReadingPlan`).

**3. Detailed Feature Specifications**

*   Break down each feature from the request into user stories, implementation steps (Client/Server components, Server Actions, DB interactions), and error handling.
*   **Challenge:** Reconciling "mobile app" features like native push notifications with the web app structure. Solution: Use Web Push API for MVP notifications. Local storage for prayers fits well. Offline mode requires PWA service workers for caching.
*   **Challenge:** Anonymous Prayer Pairing security/privacy. Solution: Ensure no direct user info is exchanged; use only internal IDs. Add rate limiting/cooldowns if necessary.

**4. Database Schema Design**

*   Adapt existing `users` table (add preferences like `notification_time`, `theme`, `trial_end_date`).
*   *Decision:* Repurpose `teams` table as `user_subscriptions` or similar to store subscription details per user (since it's individual, not team-based). Rename `teamMembers` accordingly or potentially remove if 1 user = 1 "team". For simplicity in MVP based on template, let's *keep* the `teams` structure but assume each user has their own `team` record created on signup, representing their individual account and subscription status. This minimizes changes to the existing auth/payment logic initially. `teamMembers` will mostly have one owner per team (the user).
*   Define new tables: `daily_content`, `reading_plans`, `reading_plan_days`, `user_reading_progress`, `prayer_pairs`.
*   Ensure correct types, constraints (`NOT NULL`, `UNIQUE`), foreign keys, and indexes. Add `createdAt`, `updatedAt`.

**5. Server Actions and Integrations**

*   Define new Server Actions for content generation, fetching daily content, managing reading plans, handling prayer pairing, and updating user settings (theme, notification time).
*   Use `validatedAction` and `validatedActionWithUser` wrappers.
*   Detail API calls to OpenAI (prompt engineering crucial), ElevenLabs (voice selection, API key), AdMob (requires client-side SDK setup more than server actions), Stripe (reuse template actions).
*   **Challenge:** Scheduling content generation. Solution: Use Vercel Cron Jobs to trigger the `generateDailyContent` server action daily.
*   **Challenge:** API Key Management. Solution: Store securely in environment variables (`OPENAI_API_KEY`, `ELEVENLABS_API_KEY`, etc.) accessed only server-side.

**6. Design System and Component Architecture**

*   Specify color palette based on request (e.g., White: `#FFFFFF`, Gold: `#FFD700`, Light Blue: `#ADD8E6`, Background: `#F8F9FA` or similar light grey/off-white).
*   Confirm Manrope font. Define sizes (e.g., Body: 16px, Heading: 24px).
*   Leverage Shadcn/ui components (`Card`, `Button`, `Input`, etc.). Create custom components as needed (e.g., `DailyContentViewer`, `AudioPlayer`).
*   Define layout structure (Header, Main Content, possibly a simple bottom Nav for mobile PWA feel).

**7. Authentication and Authorization Implementation**

*   Stick with the template's custom JWT implementation.
*   Modify `getUser` or related logic to also fetch/include subscription status (`planName`, `subscriptionStatus`, `trialEndDate` from the `teams` table associated with the user).
*   Protect `/app/*` routes via `middleware.ts`.
*   Use subscription status within components/actions to gate premium features. Check `trialEndDate` for trial access.

**8. Data Flow and State Management**

*   Server Components fetch initial data (e.g., daily content, reading plan list).
*   Client Components use `useUser` for auth/subscription state. `useState` for local UI state. `localStorage` for personal prayers.
*   Server Actions triggered by forms/buttons for mutations. `useActionState` for form feedback.

**9. Payment Implementation**

*   Reuse Stripe checkout (`createCheckoutSession`) and customer portal (`customerPortalAction`) from the template.
*   Modify checkout: Ensure `trial_period_days: 7` is set. The template already has this.
*   Modify signup/checkout flow: On signup, create the user *and* their associated `team` record. Store trial end date (now + 7 days) in the `users` or `teams` table.
*   Webhook (`handleSubscriptionChange`): Update `subscriptionStatus`, `planName`, `stripeProductId`, `stripeSubscriptionId` in the user's `teams` table. Clear `trialEndDate` when a subscription becomes active.
*   Premium Feature Gating: Check `user.team.subscriptionStatus === 'active' || (user.team.subscriptionStatus === 'trialing' && user.trialEndDate > now)`.

**10. Analytics Implementation**

*   Plan for PostHog (as per spec structure).
*   Identify key events: `view_daily_content`, `play_audio` (with properties: `isPremiumVoice`), `add_prayer`, `complete_reading_day` (properties: `planId`, `day`), `share_content`, `start_trial`, `activate_premium`, `cancel_subscription`.
*   Implement tracking calls within relevant client components or server actions.

**11. Testing Strategy**

*   **Unit Tests (Jest/Vitest):** Test utility functions, server action logic (mocking DB and external APIs), validation schemas.
*   **E2E Tests (Playwright):** Simulate user flows: Signup -> View Content -> Play Audio (Free) -> Start Trial -> Play Audio (Premium) -> Add Prayer -> Start Reading Plan -> Mark Day Complete -> Share Content -> Access Customer Portal -> Cancel Subscription.

**Potential Risks/Clarifications:**

*   **PWA vs. Native:** Explicitly state it's a PWA/Web App. Manage expectations regarding native features.
*   **Content Generation Cost/Reliability:** OpenAI/ElevenLabs calls cost money and can fail. Implement robust error handling, retries, and potentially caching/fallbacks. Monitor costs.
*   **Prompt Engineering:** Achieving the right "cristão/edificante" tone requires careful prompt design and testing for OpenAI.
*   **AdMob Integration:** Needs research for optimal integration within Next.js/React (likely using a third-party library or direct script loading). Placement needs design consideration.
*   **Offline Mode (Web App):** Service workers add complexity. MVP might defer full offline mode, perhaps just caching the current day's content for premium users.
*   **Prayer Pairing Logic:** Needs careful design for matching and anonymity. Initial MVP might be very basic (random pairing of users who opted-in within the last X hours).

</specification_planning>

---

# Palavra Viva Technical Specification

## 1. System Overview

*   **Core purpose and value proposition:** "Palavra Viva" is a Christian devotional web application (designed mobile-first, PWA-enabled) for the Brazilian evangelical audience. It provides a simple, daily inspiring experience featuring Bible verses, short AI-generated reflections, audio versions, personal prayer tracking, reading plans, and light spiritual interactions like anonymous prayer pairing. It aims for low maintenance through AI content generation and auto-scalability.
*   **Key workflows:**
    *   User authentication (Sign up/Sign in).
    *   Daily content consumption (Verse, Reflection, Audio).
    *   Content sharing (Image generation).
    *   Personal prayer management (Local storage).
    *   Reading plan discovery and progress tracking.
    *   Anonymous prayer pairing request and notification.
    *   Subscription management (Free trial, Premium upgrade via Stripe).
    *   Ad display (Free tier).
*   **System architecture:**
    *   **Frontend:** Next.js 15 (App Router), React 19, Tailwind CSS, Shadcn/ui. Mobile-first design, PWA enabled.
    *   **Backend:** Next.js Server Components & Server Actions, Postgres DB with Drizzle ORM.
    *   **Authentication:** Custom JWT-based system using `jose`, `bcryptjs`, and HTTP-only cookies (as per template).
    *   **Database:** Postgres managed via Vercel Postgres or similar.
    *   **Payments:** Stripe for premium subscriptions.
    *   **Content Generation:** OpenAI API (GPT-4 or similar) for text, ElevenLabs API for Text-to-Speech.
    *   **Ads:** Google AdMob (integrated via client-side SDK/components).
    *   **Deployment:** Vercel.
    *   **Scheduling:** Vercel Cron Jobs for daily content generation.

## 2. Project Structure

The project will adhere to the structure provided in the starter template and rules, with additions for Palavra Viva features:

```
/
├── app/
│   ├── (app)/                      # Core authenticated app routes
│   │   ├── _components/            # Shared components for the app section
│   │   │   ├── daily-content-viewer.tsx
│   │   │   ├── audio-player.tsx
│   │   │   ├── prayer-list.tsx
│   │   │   ├── reading-plan-card.tsx
│   │   │   ├── reading-plan-day.tsx
│   │   │   ├── shareable-image-generator.tsx
│   │   │   └── ad-banner.tsx
│   │   ├── oracoes/
│   │   │   └── page.tsx            # Personal Prayers page
│   │   ├── orar-dupla/
│   │   │   └── page.tsx            # Prayer Pairing page
│   │   ├── planos/
│   │   │   ├── [planId]/
│   │   │   │   └── page.tsx        # Specific Reading Plan view
│   │   │   └── page.tsx            # Reading Plans list page
│   │   ├── layout.tsx              # Layout for the core app (may include bottom nav)
│   │   └── page.tsx                # Main page (Daily Content / Homepage)
│   ├── (dashboard)/                # Existing dashboard routes (Settings, Pricing)
│   │   ├── dashboard/              # User settings, activity - Keep as is
│   │   ├── pricing/                # Pricing page - Keep as is
│   │   ├── layout.tsx              # Main layout for dashboard/marketing (includes Header) - Keep as is
│   │   └── page.tsx                # Marketing landing page - Keep as is or repurpose
│   ├── (login)/                    # Authentication routes - Keep as is
│   │   ├── sign-in/
│   │   ├── sign-up/
│   │   ├── actions.ts              # Adapt actions for Palavra Viva signup flow
│   │   └── login.tsx
│   ├── api/
│   │   ├── cron/
│   │   │   └── generate-daily-content/
│   │   │       └── route.ts        # Endpoint for Vercel Cron Job
│   │   └── stripe/                 # Stripe webhooks - Keep as is
│   ├── favicon.ico
│   ├── globals.css                 # Customize with Palavra Viva theme
│   ├── layout.tsx                  # Root layout (includes UserProvider)
│   └── not-found.tsx
├── components/
│   └── ui/                         # Shadcn UI components - Keep as is
├── lib/
│   ├── auth/                       # Auth logic - Adapt getUser/session for subscription status
│   ├── content/                    # NEW: OpenAI & ElevenLabs logic
│   │   ├── actions.ts              # Content generation/fetching actions
│   │   ├── openai.ts               # OpenAI client setup & functions
│   │   └── elevenlabs.ts           # ElevenLabs client setup & functions
│   ├── db/                         # Database logic
│   │   ├── migrations/
│   │   ├── queries.ts              # Adapt queries, add new ones
│   │   ├── schema.ts               # Adapt schema, add new tables
│   │   └── drizzle.ts
│   ├── payments/                   # Stripe logic - Adapt for trial logic if needed
│   ├── prayers/                    # NEW: Prayer pairing logic
│   │   └── actions.ts
│   ├── reading-plans/              # NEW: Reading plan logic
│   │   └── actions.ts
│   ├── ads/                        # NEW: AdMob helpers (if necessary)
│   ├── types/                      # NEW: App-specific types
│   │   └── palavra-viva-types.ts
│   └── utils.ts                    # Utility functions
├── public/                         # Static assets (e.g., theme images, PWA icons)
│   └── manifest.json               # PWA Manifest
│   └── sw.js                       # Service Worker (for PWA & offline caching)
├── .env
├── .env.example                    # Add OPENAI_API_KEY, ELEVENLABS_API_KEY, ADMOB_APP_ID etc.
├── middleware.ts                   # Adapt protected routes if needed (e.g., /app/*)
├── next.config.ts                  # Potentially add PWA plugin config
├── package.json
├── tsconfig.json
└── vercel.json                     # Define Cron Job schedule
```

## 3. Feature Specification

### 3.1 Daily Content Homepage (`app/(app)/page.tsx`)

*   **User Story:** As a user, I want to open the app and immediately see today's devotional content (verse and reflection) so I can start my day inspired.
*   **Requirements:**
    *   Display current date.
    *   Display Bible verse reference and text.
    *   Display short commentary/reflection.
    *   Display "Listen in Audio" button.
    *   Display share button.
    *   Content should be automatically fetched for the current day.
*   **Implementation Steps:**
    1.  **Server Component (`app/(app)/page.tsx`):**
        *   Use `async function Page()` to fetch data server-side.
        *   Call a server action `getDailyContent(date)` (from `lib/content/actions.ts`) to retrieve today's content from the `daily_content` table.
        *   Pass the fetched content (`verseRef`, `verseText`, `reflectionText`, `audioUrlFree`, `audioUrlPremium`) and user subscription status as props to a Client Component (`DailyContentViewer`).
        *   Handle cases where content might not be generated yet (show loading state via Suspense or a placeholder message).
    2.  **Client Component (`app/(app)/_components/daily-content-viewer.tsx`):**
        *   Use `"use client";`.
        *   Accept daily content and user subscription status (`isPremium`) as props.
        *   Display the verse, reflection, and date using Shadcn `Card` or similar components.
        *   Include the `AudioPlayer` component, passing the correct audio URL based on `isPremium`.
        *   Include a share button that triggers the `ShareableImageGenerator` logic (potentially a modal).
*   **Error Handling:**
    *   If `getDailyContent` fails or returns no data, display an error message (e.g., "Conteúdo de hoje ainda não disponível. Tente novamente mais tarde.").
    *   Handle potential loading states gracefully.

### 3.2 AI Content Generation (Backend)

*   **User Story:** As the app owner, I want devotional content (verse selection, reflection, audio) to be generated automatically each day to minimize manual effort.
*   **Requirements:**
    *   Select a relevant Bible verse daily.
    *   Generate a short, uplifting reflection based on the verse, suitable for the target audience.
    *   Generate audio versions using ElevenLabs (standard voice for free, realistic voice for premium).
    *   Store the generated content in the database.
    *   Process should run automatically daily (e.g., early morning Brazil time).
*   **Implementation Steps:**
    1.  **Server Action (`lib/content/actions.ts::generateDailyContent`):**
        *   `"use server";`
        *   Takes `date` as input (or defaults to tomorrow).
        *   Checks if content for the date already exists in `daily_content`. If yes, exit.
        *   **Verse Selection:** Call OpenAI API (`lib/content/openai.ts`) with a prompt to suggest a suitable verse reference for the day (consider themes, liturgical calendar eventually, but random/sequential for MVP).
        *   **Fetch Verse Text:** Use a Bible API or local data source (TBD - requires adding a Bible text source) to get the text for the selected reference (e.g., Almeida Corrigida Fiel translation). *Risk: Need a reliable/free Bible text source.*
        *   **Reflection Generation:** Call OpenAI API with a calibrated prompt (using the verse text) to generate a short reflection (~150 words) in Portuguese, with a Christian/uplifting tone. Prompt example: `"""Você é um assistente para um app devocional cristão evangélico brasileiro. Baseado no versículo "${verseText}" (${verseRef}), escreva uma reflexão curta (~150 palavras) e inspiradora com tom pastoral, encorajador e acessível para o dia a dia. Use linguagem simples e termine com uma nota de esperança ou um chamado à ação leve. NÃO inclua saudações como 'Bom dia' ou referências diretas à data."""`
        *   **Audio Generation (Free):** Call ElevenLabs API (`lib/content/elevenlabs.ts`) with the reflection text using a standard (lower cost/quality) voice ID. Get the audio URL.
        *   **Audio Generation (Premium):** Call ElevenLabs API with the reflection text using a premium (realistic, higher cost) voice ID. Get the audio URL.
        *   **Database Insert:** Insert `date`, `verseRef`, `verseText`, `reflectionText`, `audioUrlFree`, `audioUrlPremium` into the `daily_content` table.
    2.  **OpenAI Client (`lib/content/openai.ts`):**
        *   Initialize OpenAI client using `process.env.OPENAI_API_KEY`.
        *   Helper function to make API calls with specific prompts and parameters (model, temperature).
    3.  **ElevenLabs Client (`lib/content/elevenlabs.ts`):**
        *   Initialize ElevenLabs client using `process.env.ELEVENLABS_API_KEY`.
        *   Helper function to make TTS calls, specifying voice ID and model.
    4.  **Cron Job (`vercel.json` and `app/api/cron/generate-daily-content/route.ts`):**
        *   Define a cron schedule in `vercel.json` (e.g., `"0 3 * * *"` for 3 AM UTC, adjust for Brazil time).
        *   The `route.ts` will be a simple Next.js API route that calls the `generateDailyContent` server action for the next day. Secure this endpoint (e.g., check `request.headers.get('authorization')` for `Bearer ${process.env.CRON_SECRET}`).
*   **Error Handling:**
    *   Wrap API calls in `try...catch`. Log errors.
    *   If OpenAI fails, log error and stop. Consider retries.
    *   If ElevenLabs fails for one voice, log error but try to generate the other. Store `null` for failed audio URLs.
    *   If DB insert fails, log error.
    *   Implement basic timeout for API calls.

### 3.3 Audio Playback (`app/(app)/_components/audio-player.tsx`)

*   **User Story:** As a user, I want to tap a button to listen to the daily reflection. As a premium user, I want to hear a more realistic voice.
*   **Requirements:**
    *   Play/Pause functionality.
    *   Uses `audioUrlFree` for free users/trial expired.
    *   Uses `audioUrlPremium` for active premium subscribers or users within trial period.
    *   Clear visual indication of playback state (play/pause icon).
*   **Implementation Steps:**
    1.  **Client Component (`app/(app)/_components/audio-player.tsx`):**
        *   Use `"use client";`.
        *   Accept `audioUrlFree`, `audioUrlPremium`, `isPremium` as props.
        *   Use `useState` to manage playback state (`isPlaying`).
        *   Use `useRef` to hold the `HTMLAudioElement`.
        *   Determine the correct `audioUrl` based on `isPremium` and the provided URLs.
        *   Render a button (Shadcn `Button` with `variant="ghost"` or similar).
        *   Display `Play` or `Pause` icon (`lucide-react`) based on `isPlaying` state.
        *   `onClick` handler:
            *   If audio element doesn't exist or URL is missing, return.
            *   If `isPlaying`, call `audioRef.current.pause()`, set `isPlaying(false)`.
            *   If not `isPlaying`, call `audioRef.current.play()`, set `isPlaying(true)`.
            *   Handle audio `onEnded` event to set `isPlaying(false)`.
        *   Initialize `HTMLAudioElement` in `useEffect` when component mounts or `audioUrl` changes. Clean up on unmount.
*   **Error Handling:**
    *   If audio URLs are null/invalid, disable the button or show a message.
    *   Handle potential errors during audio loading/playback (e.g., network errors) using audio element's error events.

### 3.4 Push Notifications (Daily Reminder)

*   **User Story:** As a user, I want to receive a daily notification at a specific time (e.g., 7 AM) to remind me to read the devotional. I want to be able to configure this time.
*   **Requirements:**
    *   Send a push notification daily at user-configured time (default 7 AM Brazil Time).
    *   Notification should prompt user to open the app.
    *   User needs to grant permission for notifications.
    *   Allow configuration of notification time in settings.
*   **Implementation Steps:**
    1.  **PWA Setup:**
        *   Create `public/manifest.json` defining the app name, icons, etc.
        *   Create `public/sw.js` (Service Worker). Implement basic fetch handler and push event listener.
        *   Register the service worker in the main app layout (`app/layout.tsx` or a client component within).
    2.  **Permission & Subscription:**
        *   Add a setting/button (e.g., in `app/(dashboard)/dashboard/general/page.tsx`) for users to enable notifications.
        *   On enable: Check `Notification.permission`. If `default`, request permission (`Notification.requestPermission()`). If `denied`, show message. If `granted`, proceed.
        *   Subscribe to push service: `serviceWorkerRegistration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) })`.
        *   Send the resulting `PushSubscription` object to the backend via a server action (`savePushSubscription`).
    3.  **Backend Storage:**
        *   Add fields to `users` table: `push_subscription` (JSONB, nullable), `notification_time` (TIME, nullable, default '07:00:00'), `notification_tz` (VARCHAR, default 'America/Sao_Paulo').
    4.  **Server Action (`lib/auth/actions.ts::savePushSubscription`):**
        *   Saves the JSON stringified `PushSubscription` object to the `users` table for the logged-in user.
    5.  **Server Action (`lib/auth/actions.ts::updateNotificationSettings`):**
        *   Updates `notification_time` and `notification_tz` for the user.
    6.  **Triggering Notifications (Backend):**
        *   *Challenge:* Triggering at specific user times requires a more complex scheduler.
        *   *MVP Approach:* Use a single daily cron job (e.g., Vercel Cron running every hour or few hours).
        *   **Cron Job / Scheduled Task:**
            *   Fetches users whose `notification_time` matches the current hour (considering their `notification_tz`).
            *   For each user with a valid `push_subscription`, use a web-push library (e.g., `web-push`) on the backend to send a notification payload (title, body, icon, url) to their subscription endpoint. Requires VAPID keys (`process.env.VAPID_PUBLIC_KEY`, `process.env.VAPID_PRIVATE_KEY`).
*   **Error Handling:**
    *   Handle push subscription failures (expired, revoked). Remove invalid subscriptions from DB.
    *   Log errors during notification sending.
    *   Handle timezone conversions carefully.

### 3.5 Personal Prayers Area (`app/(app)/oracoes/page.tsx`)

*   **User Story:** As a user, I want a private space to write down my prayer requests and thanksgivings so I can keep track of them.
*   **Requirements:**
    *   Input field to add new prayer items.
    *   List display of saved prayer items.
    *   Ability to delete prayer items.
    *   Data stored locally on the device (no backend sync for MVP).
*   **Implementation Steps:**
    1.  **Client Component (`app/(app)/_components/prayer-list.tsx`):**
        *   Use `"use client";`.
        *   Use `useState` to hold the list of prayers `prayers`.
        *   Use `useEffect` on mount to load prayers from `localStorage.getItem('palavraVivaPrayers')`. Parse the JSON string or initialize as `[]`.
        *   Function `addPrayer(text)`: Creates new prayer object (e.g., `{ id: Date.now(), text: text, createdAt: new Date() }`), adds to state, updates `localStorage` with `JSON.stringify(updatedPrayers)`.
        *   Function `deletePrayer(id)`: Filters prayer from state, updates `localStorage`.
        *   Render an input field (Shadcn `Input`) and "Add" button (Shadcn `Button`) wired to `addPrayer`.
        *   Render the `prayers` list using Shadcn `Card`s or similar, each with a delete button calling `deletePrayer(id)`.
    2.  **Page Component (`app/(app)/oracoes/page.tsx`):**
        *   Use `"use client";` (or make it a Server Component just rendering the Client Component).
        *   Render the `PrayerList` component. Include appropriate titles/headings.
*   **Error Handling:**
    *   Handle potential `JSON.parse` errors when loading from `localStorage`.
    *   Consider `localStorage` size limits, though unlikely to be hit with text.

### 3.6 Reading Plans (`app/(app)/planos/*`)

*   **User Story:** As a user, I want to find and follow Bible reading plans on specific themes (like faith, forgiveness) to guide my study.
*   **Requirements:**
    *   List available reading plans (7 days / 30 days).
    *   Display plan details (title, description, duration).
    *   Allow users to start a plan.
    *   Track user progress through the plan day-by-day.
    *   Display daily content (verse reference/text, potentially short thought).
    *   Allow marking days as complete.
*   **Implementation Steps:**
    1.  **DB Schema:** (Defined in Section 4) `reading_plans`, `reading_plan_days`, `user_reading_progress`.
    2.  **Seed Plans:** Create a script or manual process to populate `reading_plans` and `reading_plan_days` with initial content (e.g., 2-3 plans for MVP).
    3.  **List Page (`app/(app)/planos/page.tsx`):**
        *   Server Component.
        *   Fetch all plans from `reading_plans` table using a server action/query (`lib/reading-plans/actions.ts::getAllReadingPlans`).
        *   Fetch user's current progress from `user_reading_progress` (`lib/reading-plans/actions.ts::getUserProgress`).
        *   Pass data to a Client Component (`ReadingPlanList`).
    4.  **Client Component (`app/(app)/_components/reading-plan-list.tsx`):**
        *   Use `"use client";`.
        *   Display plans using `ReadingPlanCard` component.
        *   Show progress indicators if user has started a plan.
        *   Link each card to `/app/planos/[planId]`.
    5.  **Plan Detail Page (`app/(app)/planos/[planId]/page.tsx`):**
        *   Server Component. Fetch plan details (`reading_plans`, `reading_plan_days`) and user progress (`user_reading_progress`) for the given `planId`.
        *   Pass data to a Client Component (`ReadingPlanViewer`).
    6.  **Client Component (`app/(app)/_components/reading-plan-viewer.tsx`):**
        *   Use `"use client";`.
        *   Display plan title/description.
        *   Display list of days. Highlight current day based on progress. Show checkmark for completed days.
        *   Display content for the current day (`ReadingPlanDay`).
        *   Include a "Mark as Complete" button.
    7.  **Client Component (`app/(app)/_components/reading-plan-day.tsx`):**
        *   Displays verse reference/text for the specific day.
    8.  **Server Action (`lib/reading-plans/actions.ts::updateReadingProgress`):**
        *   `validatedActionWithUser`. Takes `planId`, `dayNumber`.
        *   Updates or inserts record in `user_reading_progress` for the user/plan, setting `current_day` or marking plan complete.
*   **Error Handling:**
    *   Handle cases where plan ID is invalid.
    *   Handle DB errors during fetching/updating progress.

### 3.7 Shareable Blessings

*   **User Story:** As a user, I want to generate an image with the daily verse/reflection to easily share on social media (WhatsApp, Instagram).
*   **Requirements:**
    *   Generate an image (e.g., square format suitable for Instagram/WhatsApp Status).
    *   Image should contain the verse text or a snippet of the reflection.
    *   Include subtle branding/app name.
    *   Provide a "Share" button using the Web Share API.
*   **Implementation Steps:**
    1.  **Client Component (`app/(app)/_components/shareable-image-generator.tsx`):**
        *   Use `"use client";`. This component could be part of `DailyContentViewer` or triggered via a modal.
        *   Accept `verseText`, `reflectionText` as props.
        *   Use `useRef` for an HTML `<canvas>` element.
        *   On trigger (e.g., clicking share button):
            *   Get canvas context (`canvasRef.current.getContext('2d')`).
            *   Draw background (solid color or simple gradient from theme).
            *   Draw text (verse or reflection snippet) using `fillText`. Style font, size, color. Ensure text wrapping within canvas bounds.
            *   Draw small app logo/name at the bottom.
            *   Convert canvas to blob: `canvasRef.current.toBlob(async (blob) => { ... }, 'image/png')`.
            *   Inside the callback, check if `navigator.share` is available.
            *   If yes, create a `File` object from the blob and use `navigator.share({ files: [imageFile], title: 'Palavra Viva Devocional', text: 'Veja a reflexão de hoje!' })`.
            *   If `navigator.share` is not available, provide a fallback (e.g., button to download the image `canvasRef.current.toDataURL('image/png')`).
*   **Error Handling:**
    *   Handle cases where Canvas API is not supported (very unlikely).
    *   Handle errors during `navigator.share` (e.g., user cancels).
    *   Provide clear fallback if sharing fails.

### 3.8 Prayer Pairing (`app/(app)/orar-dupla/page.tsx`)

*   **User Story:** As a user, I want to be anonymously paired with another user so we can pray for each other, and receive a notification when someone has prayed for me.
*   **Requirements:**
    *   Button to request being paired for prayer.
    *   Mechanism to anonymously pair users.
    *   Display a message like "Alguém orou por você hoje" if paired and prayed for.
    *   Maintain user anonymity.
*   **Implementation Steps:**
    1.  **DB Schema:** `prayer_pairs` table (defined in Section 4). Add `user1_notified`, `user2_notified` (BOOLEAN, default false).
    2.  **Page Component (`app/(app)/orar-dupla/page.tsx`):**
        *   Server Component initially fetching user's pairing status.
        *   Call server action `getPrayerPairStatus` for the current user.
        *   Pass status to a Client Component (`PrayerPairingInterface`).
    3.  **Client Component (`app/(app)/_components/prayer-pairing-interface.tsx`):**
        *   Use `"use client";`.
        *   Display status: "Not paired", "Waiting for pair", "Paired with someone. Pray for them!", "Someone prayed for you today!".
        *   If not paired/waiting, show "Quero orar por alguém" button. `onClick` calls `requestPrayerPair` action.
        *   If paired, show "Orei pela pessoa" button. `onClick` calls `markPrayerAsDone` action.
    4.  **Server Action (`lib/prayers/actions.ts::requestPrayerPair`):**
        *   `validatedActionWithUser`.
        *   Check if user is already in a recent/active pair in `prayer_pairs`. If yes, return error/status.
        *   Find another user (`user2`) who also requested pairing recently (e.g., `requested_pairing_at` within last 24h, not currently paired).
        *   If found:
            *   Create a new record in `prayer_pairs` with `user1_id` (current user) and `user2_id`.
            *   Clear `requested_pairing_at` for both users (maybe add this field to `users` table or a separate `prayer_requests` table if scaling).
            *   Return success status: "Paired".
        *   If not found:
            *   Mark current user as requesting (`requested_pairing_at = now()`).
            *   Return status: "Waiting".
    5.  **Server Action (`lib/prayers/actions.ts::markPrayerAsDone`):**
        *   `validatedActionWithUser`.
        *   Find the active pair for the user in `prayer_pairs`.
        *   Identify the *other* user in the pair.
        *   Update the pair record: set `userX_notified = true` (where X corresponds to the *other* user).
        *   Return success status.
    6.  **Server Action (`lib/prayers/actions.ts::getPrayerPairStatus`):**
        *   Fetches the user's current status from `prayer_pairs` (and potentially `requested_pairing_at`). Checks `userX_notified` flag to see if they should see the "Someone prayed for you" message. Reset the flag after showing it once.
*   **Error Handling:**
    *   Handle race conditions during pairing. Use DB transactions if necessary.
    *   Handle cases where no users are available for pairing.
    *   Ensure anonymity is strictly maintained.

### 3.9 Monetization (Ads & Premium)

*   **User Story (Free):** As a free user, I understand I will see ads, but I can still access the core daily devotional content and features.
*   **User Story (Premium):** As a user, I want to upgrade to Premium via a free trial to access features like realistic audio, premium reflections (if added later), offline access, and themes, without ads.
*   **Requirements:**
    *   **Free:** Display AdMob ads non-intrusively. Use standard TTS voice. Access standard reflections.
    *   **Premium:** 7-day mandatory free trial. No ads. Realistic ElevenLabs voice. Access premium reflections (future). Offline caching (PWA service worker). Custom themes. Auto-charge after trial if not cancelled.
*   **Implementation Steps:**
    1.  **AdMob Integration:**
        *   Sign up for AdMob, get App ID and Ad Unit IDs. Store in `.env`.
        *   Integrate AdMob SDK (likely client-side). Use a library like `react-native-google-mobile-ads` if PWA target allows, or standard web SDKs.
        *   Create `AdBanner` client component (`app/(app)/_components/ad-banner.tsx`).
        *   Conditionally render `AdBanner` in layouts/pages based on user subscription status (`!isPremium`).
    2.  **Premium Subscription (Stripe):**
        *   Leverage existing template setup (`/pricing`, checkout action, customer portal action, webhooks).
        *   Ensure `trial_period_days: 7` is set in `createCheckoutSession`.
        *   **Signup Flow:** Modify `signUp` action (`app/(login)/actions.ts`) to create the associated `team` record for the user and set `trial_end_date = now() + 7 days` on the `users` table (or `teams` table if preferred).
        *   **Subscription Check:** Modify `getUser` (`lib/db/queries.ts`) or create a helper function that fetches the user and their associated `team` record (which holds subscription status) and `trial_end_date`.
        *   **Gating Logic:** Create a utility function `isUserPremium(user)` that checks `user.team.subscriptionStatus === 'active' || (user.team.subscriptionStatus === 'trialing' && user.trialEndDate > new Date())`. Use this in components and actions.
    3.  **Premium Features:**
        *   **Realistic Voice:** `AudioPlayer` component uses `isPremium` prop to select `audioUrlPremium`.
        *   **Premium Reflections:** (Future) Add `reflection_text_premium` to `daily_content`. `DailyContentViewer` displays based on `isPremium`.
        *   **Offline Mode:** Implement PWA service worker (`public/sw.js`). Add logic to cache daily content (text/audio URLs) and potentially reading plan data when user is premium and online. Service worker intercepts fetch requests and serves from cache when offline.
        *   **Themes:** Add `theme` preference (e.g., 'light', 'dark', 'gold') to `users` table. Create corresponding CSS themes (Tailwind variants/classes). Add setting in `app/(dashboard)/dashboard/general/page.tsx` to change theme (calls `updateUserSettings` action). Apply theme class to root layout (`app/layout.tsx`) based on fetched user preference.
        *   **No Ads:** Conditionally render `AdBanner` based on `!isPremium`.
    4.  **Webhook Handling (`handleSubscriptionChange`):** When a subscription becomes `active` (after trial or direct purchase), ensure `trial_end_date` is cleared or ignored in the `isUserPremium` check. When cancelled (`deleted` status in Stripe), update status in DB.
*   **Error Handling:**
    *   Handle AdMob SDK errors.
    *   Handle Stripe API errors during checkout/portal access.
    *   Gracefully handle missing premium content (e.g., if premium audio failed to generate).

## 4. Database Schema

*(Based on template + Palavra Viva needs. Assumes reusing `teams` for user-specific subscription data)*

### 4.1 Tables

*   **`users`** (Adapting template table)
    *   `id`: SERIAL PRIMARY KEY
    *   `name`: VARCHAR(100)
    *   `email`: VARCHAR(255) NOT NULL UNIQUE
    *   `password_hash`: TEXT NOT NULL
    *   `role`: VARCHAR(20) NOT NULL DEFAULT 'member' (Keep for potential future admin roles)
    *   `notification_time`: TIME NULLABLE DEFAULT '07:00:00' -- User preferred notification time
    *   `notification_tz`: VARCHAR(50) NOT NULL DEFAULT 'America/Sao_Paulo' -- User timezone
    *   `push_subscription`: JSONB NULLABLE -- Stores PushSubscription object
    *   `theme`: VARCHAR(50) NOT NULL DEFAULT 'light' -- User preferred theme
    *   `trial_end_date`: TIMESTAMP NULLABLE -- Tracks end of free trial
    *   `requested_pairing_at`: TIMESTAMP NULLABLE -- Tracks when user requested prayer pairing
    *   `created_at`: TIMESTAMP NOT NULL DEFAULT now()
    *   `updated_at`: TIMESTAMP NOT NULL DEFAULT now()
    *   `deleted_at`: TIMESTAMP NULLABLE
    *   *Indexes:* `email`, `deleted_at`

*   **`teams`** (Re-purposed for User Subscription/Account - 1 per user)
    *   `id`: SERIAL PRIMARY KEY
    *   `user_id`: INTEGER NOT NULL UNIQUE REFERENCES `users`(`id`) ON DELETE CASCADE -- Link to the single user
    *   `name`: VARCHAR(100) NOT NULL -- e.g., "{User Name}'s Account"
    *   `stripe_customer_id`: TEXT UNIQUE NULLABLE
    *   `stripe_subscription_id`: TEXT UNIQUE NULLABLE
    *   `stripe_product_id`: TEXT NULLABLE
    *   `plan_name`: VARCHAR(50) NULLABLE -- e.g., 'free', 'premium'
    *   `subscription_status`: VARCHAR(20) NULLABLE -- e.g., 'trialing', 'active', 'canceled', 'incomplete'
    *   `created_at`: TIMESTAMP NOT NULL DEFAULT now()
    *   `updated_at`: TIMESTAMP NOT NULL DEFAULT now()
    *   *Indexes:* `user_id`, `stripe_customer_id`, `stripe_subscription_id`

*   **`team_members`** (Mostly redundant if 1 user = 1 team, but kept for template compatibility initially)
    *   `id`: SERIAL PRIMARY KEY
    *   `user_id`: INTEGER NOT NULL REFERENCES `users`(`id`) ON DELETE CASCADE
    *   `team_id`: INTEGER NOT NULL REFERENCES `teams`(`id`) ON DELETE CASCADE
    *   `role`: VARCHAR(50) NOT NULL -- Usually 'owner'
    *   `joined_at`: TIMESTAMP NOT NULL DEFAULT now()
    *   *Indexes:* `user_id`, `team_id`, `(user_id, team_id)` UNIQUE

*   **`activity_logs`** (From template - useful)
    *   `id`: SERIAL PRIMARY KEY
    *   `team_id`: INTEGER NOT NULL REFERENCES `teams`(`id`) ON DELETE CASCADE
    *   `user_id`: INTEGER REFERENCES `users`(`id`) ON DELETE SET NULL
    *   `action`: TEXT NOT NULL -- Add Palavra Viva specific actions (e.g., `VIEW_DAILY_CONTENT`, `COMPLETE_READING_DAY`)
    *   `timestamp`: TIMESTAMP NOT NULL DEFAULT now()
    *   `ip_address`: VARCHAR(45)
    *   *Indexes:* `team_id`, `user_id`, `timestamp`

*   **`invitations`** (From template - likely unused for Palavra Viva MVP)
    *   *(Keep schema as is for template compatibility, but logic won't be used)*

*   **`daily_content`** (NEW)
    *   `id`: SERIAL PRIMARY KEY
    *   `content_date`: DATE NOT NULL UNIQUE -- Date the content is for
    *   `verse_ref`: VARCHAR(100) NOT NULL -- e.g., "João 3:16"
    *   `verse_text`: TEXT NOT NULL
    *   `reflection_text`: TEXT NOT NULL
    *   `audio_url_free`: TEXT NULLABLE -- URL for standard voice audio
    *   `audio_url_premium`: TEXT NULLABLE -- URL for premium voice audio
    *   `created_at`: TIMESTAMP NOT NULL DEFAULT now()
    *   `updated_at`: TIMESTAMP NOT NULL DEFAULT now()
    *   *Indexes:* `content_date`

*   **`reading_plans`** (NEW)
    *   `id`: SERIAL PRIMARY KEY
    *   `title`: VARCHAR(255) NOT NULL
    *   `description`: TEXT
    *   `duration_days`: INTEGER NOT NULL -- e.g., 7, 30
    *   `theme`: VARCHAR(100) NULLABLE -- e.g., 'Fé', 'Perdão'
    *   `is_premium`: BOOLEAN NOT NULL DEFAULT false -- For future premium plans
    *   `created_at`: TIMESTAMP NOT NULL DEFAULT now()
    *   `updated_at`: TIMESTAMP NOT NULL DEFAULT now()
    *   *Indexes:* `theme`, `is_premium`

*   **`reading_plan_days`** (NEW)
    *   `id`: SERIAL PRIMARY KEY
    *   `plan_id`: INTEGER NOT NULL REFERENCES `reading_plans`(`id`) ON DELETE CASCADE
    *   `day_number`: INTEGER NOT NULL -- 1-based index
    *   `verse_ref`: VARCHAR(100) NOT NULL
    *   `verse_text`: TEXT -- Store verse text here for offline/simplicity
    *   `content`: TEXT NULLABLE -- Optional short thought for the day
    *   `created_at`: TIMESTAMP NOT NULL DEFAULT now()
    *   `updated_at`: TIMESTAMP NOT NULL DEFAULT now()
    *   *Indexes:* `plan_id`, `(plan_id, day_number)` UNIQUE

*   **`user_reading_progress`** (NEW)
    *   `id`: SERIAL PRIMARY KEY
    *   `user_id`: INTEGER NOT NULL REFERENCES `users`(`id`) ON DELETE CASCADE
    *   `plan_id`: INTEGER NOT NULL REFERENCES `reading_plans`(`id`) ON DELETE CASCADE
    *   `current_day`: INTEGER NOT NULL DEFAULT 1 -- Last completed day + 1
    *   `completed_at`: TIMESTAMP NULLABLE -- Timestamp when the entire plan was finished
    *   `started_at`: TIMESTAMP NOT NULL DEFAULT now()
    *   `last_updated`: TIMESTAMP NOT NULL DEFAULT now()
    *   *Indexes:* `user_id`, `plan_id`, `(user_id, plan_id)` UNIQUE

*   **`prayer_pairs`** (NEW)
    *   `id`: SERIAL PRIMARY KEY
    *   `user1_id`: INTEGER NOT NULL REFERENCES `users`(`id`) ON DELETE CASCADE
    *   `user2_id`: INTEGER NOT NULL REFERENCES `users`(`id`) ON DELETE CASCADE
    *   `created_at`: TIMESTAMP NOT NULL DEFAULT now()
    *   `user1_last_prayed_at`: TIMESTAMP NULLABLE -- User 1 prayed for User 2
    *   `user2_last_prayed_at`: TIMESTAMP NULLABLE -- User 2 prayed for User 1
    *   `user1_notified_at`: TIMESTAMP NULLABLE -- User 1 was notified User 2 prayed
    *   `user2_notified_at`: TIMESTAMP NULLABLE -- User 2 was notified User 1 prayed
    *   `is_active`: BOOLEAN NOT NULL DEFAULT true
    *   *Indexes:* `user1_id`, `user2_id`, `created_at`, `is_active`
    *   *Constraint:* CHECK (`user1_id` < `user2_id`) -- Ensures unique pairs

## 5. Server Actions

### 5.1 Database Actions (`lib/.../actions.ts`, `lib/db/queries.ts`)

*   **`getUserWithSubscription(userId)`:** (Adaptation of `getUserWithTeam`) Fetches user data along with their associated `teams` record (containing subscription status, plan, trial end date).
*   **`generateDailyContent(date)`:** (lib/content/actions.ts)
    *   Checks DB for existing content for `date`.
    *   Calls OpenAI for verse ref + reflection.
    *   Fetches verse text (from source TBD).
    *   Calls ElevenLabs for free and premium audio URLs.
    *   Inserts data into `daily_content`. Returns success/failure.
*   **`getDailyContent(date)`:** (lib/content/actions.ts)
    *   Selects from `daily_content` where `content_date = date`. Returns content object or null.
*   **`getAllReadingPlans()`:** (lib/reading-plans/actions.ts)
    *   Selects all from `reading_plans`. Returns array of plans.
*   **`getReadingPlanDetails(planId)`:** (lib/reading-plans/actions.ts)
    *   Selects from `reading_plans` and joins `reading_plan_days` for the given `planId`. Returns plan details with days.
*   **`getUserProgress(userId)`:** (lib/reading-plans/actions.ts)
    *   Selects from `user_reading_progress` where `user_id = userId`. Returns array of progress records.
*   **`updateReadingProgress(userId, planId, dayNumber)`:** (lib/reading-plans/actions.ts)
    *   Uses `validatedActionWithUser`. Finds or creates progress record in `user_reading_progress`. Updates `current_day`. If `dayNumber` equals plan duration, sets `completed_at`. Returns success/failure state.
*   **`requestPrayerPair(userId)`:** (lib/prayers/actions.ts)
    *   Uses `validatedActionWithUser`. Checks existing pairs. Finds potential partner. Creates pair in `prayer_pairs` or marks user as waiting (`users.requested_pairing_at`). Returns status.
*   **`markPrayerAsDone(userId)`:** (lib/prayers/actions.ts)
    *   Uses `validatedActionWithUser`. Finds active pair for user. Updates `userX_last_prayed_at` for the current user and `userY_notified_at` for the partner (potentially). Returns success/failure.
*   **`getPrayerPairStatus(userId)`:** (lib/prayers/actions.ts)
    *   Fetches user's status from `prayer_pairs` and `users.requested_pairing_at`. Checks `notified_at` flags. Returns status object. Resets `notified_at` flag if returning "notified" status.
*   **`updateUserSettings(userId, settings)`:** (lib/auth/actions.ts)
    *   Uses `validatedActionWithUser`. Updates `notification_time`, `notification_tz`, `theme` in `users` table. Returns success/failure state.
*   **`savePushSubscription(userId, subscription)`:** (lib/auth/actions.ts)
    *   Uses `validatedActionWithUser`. Updates `push_subscription` in `users` table. Returns success/failure state.
*   **`signUp(data)`:** (app/(login)/actions.ts - Adapted)
    *   Creates user in `users`.
    *   Creates associated record in `teams` with `user_id`.
    *   Sets `users.trial_end_date` to `now() + 7 days`.
    *   Logs activity. Sets session. Redirects.
*   **`updateAccount`, `updatePassword`, `deleteAccount`, `signIn`, `signOut`:** Adapt from template as needed, ensuring they interact correctly with the user's `teams` record for activity logging.
*   **Payment Actions (`checkoutAction`, `customerPortalAction`):** Keep largely as is from template (`lib/payments/actions.ts`).

### 5.2 Other Actions

*   **OpenAI API Calls:** (`lib/content/openai.ts`)
    *   Endpoint: `https://api.openai.com/v1/chat/completions`
    *   Auth: Bearer Token (`process.env.OPENAI_API_KEY`)
    *   Data: JSON payload with model, messages (prompt), temperature, max_tokens.
*   **ElevenLabs API Calls:** (`lib/content/elevenlabs.ts`)
    *   Endpoint: `https://api.elevenlabs.io/v1/text-to-speech/{voice_id}`
    *   Auth: `xi-api-key` header (`process.env.ELEVENLABS_API_KEY`)
    *   Data: JSON payload with text, model_id, voice_settings. Returns audio stream or URL.
*   **Web Push Sending:** (`lib/notifications/actions.ts` or similar, triggered by cron)
    *   Use `web-push` library.
    *   Requires VAPID keys (`process.env.VAPID_PUBLIC_KEY`, `process.env.VAPID_PRIVATE_KEY`).
    *   Function `sendNotification(subscription, payload)`: Sends formatted payload to the `subscription.endpoint`.
*   **Bible Text Source:** (TBD) Need to integrate an API (e.g., bible-api.com, getbible.net) or load a local dataset (e.g., JSON/SQL file of ACF translation) to fetch verse text based on reference.

## 6. Design System

### 6.1 Visual Style

*   **Color Palette:**
    *   Primary Background: `#FFFFFF` (White)
    *   Secondary Background / Cards: `#F8F9FA` (Very Light Gray)
    *   Primary Text: `#212529` (Dark Gray)
    *   Secondary Text: `#6C757D` (Gray)
    *   Accent / Primary Action: `#FFD700` (Gold) - *Needs refinement for accessibility/contrast on white.* Maybe a slightly darker gold like `#EFAF00`.
    *   Accent Text (on Gold): `#343A40` (Dark Gray/Black)
    *   Highlight / Secondary Action: `#ADD8E6` (Light Blue)
    *   Highlight Text (on Light Blue): `#0056b3` (Darker Blue)
    *   Borders: `#DEE2E6` (Light Gray)
    *   Success: `#28A745` (Green)
    *   Error: `#DC3545` (Red)
*   **Typography:**
    *   Font Family: Manrope (body and headings)
    *   Base Size: 16px
    *   Scale: Minor Third (1.200) - e.g., 14px (small), 16px (body), 19px (h4), 23px (h3), 28px (h2), 33px (h1)
    *   Weights: Regular (400), Medium (500), SemiBold (600)
*   **Component Styling:** Leverage Shadcn/ui components, apply custom theme via `globals.css` variables. Minimalist, clean lines, soft shadows on cards.
*   **Spacing:** Use Tailwind's default spacing scale (multiples of 4px). Consistent padding within cards (e.g., `p-4` or `p-6`). Consistent margins between elements.

### 6.2 Core Components

*   **Layout Structure:**
    *   `app/layout.tsx`: Root layout with `UserProvider`.
    *   `app/(app)/layout.tsx`: Main app layout. Includes a header (minimal, maybe just logo/title) and potentially a simple Bottom Navigation component (Client Component) for mobile PWA feel (links to Home, Planos, Orações, Settings).
    *   `app/(dashboard)/layout.tsx`: Existing layout for marketing/settings pages.
*   **Navigation Patterns:**
    *   Primary: Bottom Navigation (if implemented) for core sections.
    *   Secondary: Links within content (e.g., Plan card -> Plan detail). Standard browser back button. Header dropdown for Settings/Logout (reuse from template).
*   **Shared Components (Props examples):**
    *   `DailyContentViewerProps`: `{ content: DailyContent | null; isPremium: boolean; }`
    *   `AudioPlayerProps`: `{ audioUrlFree: string | null; audioUrlPremium: string | null; isPremium: boolean; }`
    *   `PrayerListProps`: `{}` (manages state internally via localStorage)
    *   `ReadingPlanCardProps`: `{ plan: ReadingPlan; progress: UserReadingProgress | null; }`
    *   `AdBannerProps`: `{ adUnitId: string; }`
*   **Interactive States:** Use Shadcn defaults. Ensure sufficient visual feedback for hover/focus/active states, especially on touch targets. Disabled states should be clear (opacity, `not-allowed` cursor).

## 7. Component Architecture

### 7.1 Server Components

*   **Examples:** `app/(app)/page.tsx`, `app/(app)/planos/page.tsx`, `app/(app)/planos/[planId]/page.tsx`.
*   **Data fetching strategy:** Fetch data directly within `async function Page()` using server actions/queries (`getDailyContent`, `getAllReadingPlans`, etc.).
*   **Suspense boundaries:** Wrap data-fetching sections or components receiving fetched data in `<Suspense fallback={...}>` where appropriate to handle loading states, especially for initial page loads.
*   **Error handling:** Use `try...catch` within data fetching; pass error state or render specific error components if data fails to load. Use `notFound()` from `next/navigation` for invalid routes/data.
*   **Props interface:** Pass fetched data, user info (if needed, though client components often use `useUser`), and configuration down to Client Components.

```typescript
// Example: app/(app)/page.tsx
import { Suspense } from 'react';
import { getUserWithSubscription } from '@/lib/auth/queries'; // Assuming adaptation
import { getDailyContent } from '@/lib/content/actions';
import DailyContentViewer from './_components/daily-content-viewer';
import LoadingSpinner from '@/components/ui/loading-spinner'; // Assuming spinner component

export default async function HomePage() {
  const user = await getUserWithSubscription(); // Fetch user + subscription
  const isPremium = user ? isUserPremium(user) : false; // isUserPremium is a helper util

  // Fetch content within Suspense boundary if desired, or pass promise
  const contentPromise = getDailyContent(new Date());

  return (
    <div>
      <h1>Devocional Diário</h1>
      <Suspense fallback={<LoadingSpinner />}>
        {/* Async component to resolve promise */}
        <DailyContentLoader contentPromise={contentPromise} isPremium={isPremium} />
      </Suspense>
    </div>
  );
}

// Helper Async Component to resolve the promise inside Suspense
async function DailyContentLoader({ contentPromise, isPremium }: { contentPromise: Promise<DailyContent | null>; isPremium: boolean; }) {
  const content = await contentPromise;
  if (!content) {
    return <p>Conteúdo não disponível.</p>;
  }
  return <DailyContentViewer content={content} isPremium={isPremium} />;
}
```

### 7.2 Client Components

*   **Examples:** `DailyContentViewer`, `AudioPlayer`, `PrayerList`, `ReadingPlanTracker`, `ShareableImageGenerator`, `AdBanner`, `BottomNavigation`.
*   **State management approach:** Primarily `useState` for local component state. `useRef` for DOM elements (audio, canvas). `localStorage` for Personal Prayers. `useUser` (from `UserProvider`) for global auth/subscription state. `useActionState` for form submissions to Server Actions.
*   **Event handlers:** Standard React `onClick`, `onChange`, `onSubmit` handlers triggering state updates or Server Actions.
*   **UI interactions:** Manage `isPlaying`, form input values, modal visibility, etc.
*   **Props interface:** Clearly define props using TypeScript interfaces.

```typescript
// Example: app/(app)/_components/audio-player.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause } from 'lucide-react';
import { DailyContent } from '@/lib/types/palavra-viva-types'; // Assuming type definition

interface AudioPlayerProps {
  audioUrlFree: string | null;
  audioUrlPremium: string | null;
  isPremium: boolean;
}

export default function AudioPlayer({ audioUrlFree, audioUrlPremium, isPremium }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrl = isPremium ? audioUrlPremium : audioUrlFree;

  useEffect(() => {
    if (audioUrl) {
      audioRef.current = new Audio(audioUrl);
      audioRef.current.onended = () => setIsPlaying(false);
      // Add error handling: audioRef.current.onerror = ...
    }
    return () => { // Cleanup
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, [audioUrl]);

  const handlePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  if (!audioUrl) {
    return <Button disabled variant="ghost">Ouvir em Áudio Indisponível</Button>;
  }

  return (
    <Button onClick={handlePlayPause} variant="ghost">
      {isPlaying ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
      Ouvir em Áudio
    </Button>
  );
}
```

## 8. Authentication & Authorization

*   **Implementation:** Use the existing custom JWT system from the template (`lib/auth/`, `middleware.ts`).
    *   `jose` for JWT signing/verification.
    *   `bcryptjs` for password hashing.
    *   HTTP-only cookies (`session`) for storing JWT.
*   **Protected routes:** `middleware.ts` will protect the `app/(app)/` route group, redirecting unauthenticated users to `/sign-in`.
*   **Session Management:**
    *   Session created on successful sign-in/sign-up (`setSession`).
    *   Session verified on server-side requests (`getUser` uses `verifyToken`).
    *   Session refreshed automatically via middleware extending cookie expiry on activity.
    *   Session destroyed on sign-out (`cookies().delete('session')`).
*   **Subscription Status Integration:**
    *   The `getUserWithSubscription` query (or similar adaptation) will join `users` with `teams` to fetch subscription status (`planName`, `subscriptionStatus`) and `trial_end_date`.
    *   The `UserProvider` context (`lib/auth/index.tsx`) should be updated to include this subscription information alongside the basic user data.
    *   The `useUser()` hook will provide access to `{ user, planName, subscriptionStatus, trialEndDate, isPremium, setUser }` on the client-side. The `isPremium` flag will be derived based on status and trial date.

## 9. Data Flow

*   **Server -> Client:** Initial data is fetched in Server Components (Pages/Layouts) using server actions/queries. Data is passed down as props to Client Components. The authenticated user object (including subscription status) is provided globally via `UserProvider` initialized from a server-side promise (`getUserWithSubscription`).
*   **Client State:** Client Components manage local UI state using `useState`/`useRef`. Global user/auth state is accessed via `useUser`. `localStorage` is used for non-critical, device-specific data like personal prayers.
*   **Client -> Server (Mutations):** Client Components use HTML forms with the `action` prop pointing to a Server Action, or invoke Server Actions programmatically (e.g., via `onClick` wrapped in `startTransition`) using hooks like `useActionState`. Server Actions handle data validation (Zod via wrappers), database updates, and external API calls.

## 10. Stripe Integration

*   **Payment Flow Diagram:**
    1.  User visits `/pricing` page (Server Component fetching Stripe prices).
    2.  User clicks "Get Started" on a plan -> Triggers `checkoutAction` (Server Action).
    3.  `checkoutAction` calls `createCheckoutSession` (`lib/payments/stripe.ts`).
    4.  `createCheckoutSession` creates Stripe Checkout session (with `trial_period_days: 7`, `client_reference_id: userId`), redirects user to Stripe.
    5.  User completes checkout on Stripe.
    6.  Stripe redirects user to `success_url` (`/api/stripe/checkout?session_id=...`).
    7.  `GET /api/stripe/checkout`: Retrieves session, finds user (`client_reference_id`), finds/updates user's `teams` record with Stripe IDs and `subscriptionStatus: 'trialing'` or `'active'`, sets user session, redirects to `/app`.
    8.  **Webhook (`POST /api/stripe/webhook`):** Handles events like `customer.subscription.updated`, `customer.subscription.deleted`. Calls `handleSubscriptionChange` (`lib/payments/stripe.ts`).
    9.  `handleSubscriptionChange`: Finds team by `customerId`, updates `teams` table with new status, plan details, etc.
*   **Webhook Handling:** The existing webhook route (`app/api/stripe/webhook/route.ts`) and handler (`handleSubscriptionChange`) in the template are suitable. Ensure `handleSubscriptionChange` correctly updates the `teams` table based on subscription status changes (e.g., 'trialing' -> 'active', 'active' -> 'canceled').
*   **Product/Price Configuration:**
    *   Stripe products ("Palavra Viva Premium") and prices (monthly/annual) need to be created in the Stripe Dashboard.
    *   The Price IDs must be configured in the application, likely fetched dynamically on the `/pricing` page as done in the template (`getStripePrices`).
    *   The `planName` stored in the `teams` table should correspond to the Stripe Product name.
*   **Trial Management:** The 7-day trial is configured in `createCheckoutSession`. The `users.trial_end_date` field (set during signup) is used alongside `teams.subscriptionStatus === 'trialing'` to grant premium access during the trial period. The `isUserPremium` utility function encapsulates this logic.

## 11. PostHog Analytics (Placeholder - Adapt if different tool chosen)

*   **Analytics Strategy:** Track key user engagement, conversion events, and feature usage to understand user behavior and inform development priorities.
*   **Event Tracking Implementation:**
    *   Use PostHog's React library (`posthog-js`). Initialize in a client-side entry point (e.g., root layout client component).
    *   Capture events using `posthog.capture('event_name', { property: value })`.
    *   Identify users using `posthog.identify(userId, { email: userEmail, plan: userPlan })` after login.
*   **Custom Property Definitions & Events:**
    *   **User Properties:** `plan` (free/premium), `trial_status` (active/expired/none).
    *   **Events:**
        *   `page_view` (Default PostHog event)
        *   `sign_up`
        *   `sign_in`
        *   `view_daily_content`
        *   `play_audio` { `is_premium_voice`: boolean }
        *   `share_content` { `method`: 'image' }
        *   `add_prayer`
        *   `delete_prayer`
        *   `view_reading_plans`
        *   `start_reading_plan` { `plan_id`: string, `plan_title`: string }
        *   `complete_reading_day` { `plan_id`: string, `day_number`: number }
        *   `complete_reading_plan` { `plan_id`: string }
        *   `request_prayer_pair`
        *   `mark_prayer_done`
        *   `view_pricing`
        *   `start_checkout` { `plan_id`: string }
        *   `complete_checkout` (Tracked via server webhook ideally, or client-side confirmation) -> update user properties
        *   `cancel_subscription` (Tracked via server webhook) -> update user properties
        *   `enable_notifications`
        *   `change_theme` { `new_theme`: string }

## 12. Testing

*   **Unit Tests (Jest/Vitest):**
    *   Test utility functions (`lib/utils.ts`, `lib/auth/helpers.ts`, `isUserPremium`).
    *   Test Server Action logic:
        *   Mock DB calls (Drizzle).
        *   Mock external API calls (OpenAI, ElevenLabs).
        *   Test validation logic (Zod schemas).
        *   Verify correct data transformations and return values.
        *   Example: Test `generateDailyContent` action, mocking API responses and verifying DB insert payload.
        *   Example: Test `isUserPremium` logic with various combinations of status and trial dates.
*   **E2E Tests (Playwright):**
    *   **Auth Flow:** Sign up, Sign in, Sign out.
    *   **Core Content Flow:** View daily content, play free audio.
    *   **Premium Flow:** Sign up -> Start Trial (via Pricing page) -> View daily content -> Play premium audio.
    *   **Prayer Flow:** Add a prayer, delete a prayer.
    *   **Reading Plan Flow:** View plans, start a plan, view plan detail, mark first day complete.
    *   **Sharing Flow:** Click share button, verify share dialog (or download fallback).
    *   **Settings Flow:** Change notification time, change theme.
    *   **Payment Flow:** Go to pricing, initiate checkout, (mock Stripe completion if possible), verify premium access, access customer portal.

```</technical_specification>

<implementation_plan>
Plan Result


<brainstorming>
Okay, planning the implementation steps for "Palavra Viva".

**1. Project Setup & Configuration:**
    *   Rename the project in relevant files (`package.json`, `README.md`, Metadata in `app/layout.tsx`).
    *   Update `.env.example` with required keys: `OPENAI_API_KEY`, `ELEVENLABS_API_KEY`, `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `CRON_SECRET`, `ADMOB_APP_ID` (if needed client-side), maybe `BIBLE_API_KEY` (if using one). User needs to populate `.env`.
    *   Basic theme setup in `globals.css` based on the design spec color palette.
    *   Set up basic PWA files: `public/manifest.json` and an empty `public/sw.js`. Configure `next.config.ts` if a PWA plugin is used (e.g., `next-pwa`), although the spec doesn't explicitly require a plugin, manual setup is possible.

**2. Database Schema Modifications & Setup:**
    *   **Step 2.1:** Adapt `users` table: Add `notification_time`, `notification_tz`, `push_subscription`, `theme`, `trial_end_date`, `requested_pairing_at`. Modify `drizzle.config.ts` if needed.
    *   **Step 2.2:** Adapt `teams` table: Add `user_id` UNIQUE FK reference to `users`, ensure other fields are suitable for storing individual subscription data. Remove fields if not needed (like `name` if it's just derived). *Decision: Keep `teams` structure as per spec, 1 team per user.* Modify `signUp` logic later.
    *   **Step 2.3:** Modify `team_members`: Ensure FKs are correct, maybe simplify if always 1:1 user:team. *Decision: Keep as is for template compatibility initially.*
    *   **Step 2.4:** Modify `activity_logs`: Add Palavra Viva specific `ActivityType` enum values.
    *   **Step 2.5:** Create `daily_content` table schema.
    *   **Step 2.6:** Create `reading_plans` table schema.
    *   **Step 2.7:** Create `reading_plan_days` table schema.
    *   **Step 2.8:** Create `user_reading_progress` table schema.
    *   **Step 2.9:** Create `prayer_pairs` table schema.
    *   **Step 2.10:** Generate DB migration (`pnpm db:generate`).
    *   **Step 2.11:** Apply DB migration (`pnpm db:migrate`).

**3. Authentication & User Context:**
    *   **Step 3.1:** Modify `signUp` action (`app/(login)/actions.ts`): Create user, create associated `team`, set `users.trial_end_date`. Ensure FK `teams.user_id` is set.
    *   **Step 3.2:** Create `getUserWithSubscription` query (`lib/db/queries.ts`): Fetch user, join with `teams` via `user_id`, include relevant subscription fields and `users.trial_end_date`.
    *   **Step 3.3:** Update `UserProvider` (`lib/auth/index.tsx`): Use `getUserWithSubscription` for `userPromise`. Add subscription state (`planName`, `status`, `trialEndDate`, derived `isPremium`) to the context and `useUser` hook return value.
    *   **Step 3.4:** Update `middleware.ts`: Protect `app/(app)/*` routes instead of `/dashboard`.

**4. Core Application Structure & Layout:**
    *   **Step 4.1:** Create `app/(app)` route group and a basic `app/(app)/page.tsx` (Homepage placeholder).
    *   **Step 4.2:** Create `app/(app)/layout.tsx`: Include basic structure, maybe a placeholder for header/bottom nav. Wrap children.
    *   **Step 4.3:** Implement a simple `BottomNavigation` client component (`app/(app)/_components/bottom-navigation.tsx`) with links to Home, Planos, Orações, Orar Dupla, Settings.
    *   **Step 4.4:** Integrate `BottomNavigation` into `app/(app)/layout.tsx`.

**5. Daily Content Feature:**
    *   **Step 5.1 (Backend Setup):** Create `lib/content/openai.ts` and `lib/content/elevenlabs.ts` with client initialization logic (using env vars).
    *   **Step 5.2 (Bible Source - Placeholder):** Create `lib/content/bible.ts` with a placeholder function `getVerseText(verseRef: string)` that returns mock text (user needs to replace this later with a real API/data source).
    *   **Step 5.3 (Backend Action):** Implement `generateDailyContent` server action in `lib/content/actions.ts`. Include calls to OpenAI, ElevenLabs, `getVerseText`, and DB insert into `daily_content`. Add robust error handling.
    *   **Step 5.4 (Cron Job):** Create API route `app/api/cron/generate-daily-content/route.ts` to trigger the action. Secure it with `CRON_SECRET`. Add Vercel cron config to `vercel.json`.
    *   **Step 5.5 (Backend Query):** Implement `getDailyContent(date)` query/action in `lib/content/actions.ts`.
    *   **Step 5.6 (Frontend Component - Audio):** Create `AudioPlayer` client component (`app/(app)/_components/audio-player.tsx`) handling free/premium URLs and playback state.
    *   **Step 5.7 (Frontend Component - Viewer):** Create `DailyContentViewer` client component (`app/(app)/_components/daily-content-viewer.tsx`) to display content and integrate `AudioPlayer`.
    *   **Step 5.8 (Frontend Page):** Implement `app/(app)/page.tsx` (Homepage). Fetch data using `getDailyContent`, pass to `DailyContentViewer`, handle loading/error states (using Suspense helper pattern from spec).

**6. Personal Prayers Feature:**
    *   **Step 6.1 (Component):** Create `PrayerList` client component (`app/(app)/_components/prayer-list.tsx`) using `localStorage` for state management (add, list, delete). Use Shadcn components (`Input`, `Button`, `Card`).
    *   **Step 6.2 (Page):** Create `app/(app)/oracoes/page.tsx` to render the `PrayerList` component with appropriate titles.

**7. Reading Plans Feature:**
    *   **Step 7.1 (Seed Data):** Create a seed script modification (`lib/db/seed.ts`) or a separate script to populate `reading_plans` and `reading_plan_days` with 2-3 sample plans. User instruction to run seed.
    *   **Step 7.2 (Backend Actions):** Implement actions/queries in `lib/reading-plans/actions.ts`: `getAllReadingPlans`, `getReadingPlanDetails(planId)`, `getUserProgress(userId)`, `updateReadingProgress(userId, planId, dayNumber)`.
    *   **Step 7.3 (Frontend Components):** Create `ReadingPlanCard`, `ReadingPlanList`, `ReadingPlanDay`, `ReadingPlanViewer` (`app/(app)/_components/`).
    *   **Step 7.4 (List Page):** Implement `app/(app)/planos/page.tsx`. Fetch plans and user progress, pass to `ReadingPlanList`.
    *   **Step 7.5 (Detail Page):** Implement `app/(app)/planos/[planId]/page.tsx`. Fetch plan details and progress, pass to `ReadingPlanViewer`. Handle marking days complete via `updateReadingProgress` action.

**8. Shareable Blessings Feature:**
    *   **Step 8.1 (Component):** Create `ShareableImageGenerator` client component (`app/(app)/_components/shareable-image-generator.tsx`). Use Canvas API to draw text on background, use Web Share API (`navigator.share`) or fallback download.
    *   **Step 8.2 (Integration):** Add a share button to `DailyContentViewer` that triggers the image generation (e.g., opens it in a modal or directly calls the share function).

**9. Prayer Pairing Feature:**
    *   **Step 9.1 (Backend Actions):** Implement actions in `lib/prayers/actions.ts`: `requestPrayerPair`, `markPrayerAsDone`, `getPrayerPairStatus`. Update `users` table for `requested_pairing_at`. Handle pairing logic and notifications (DB flags initially).
    *   **Step 9.2 (Frontend Component):** Create `PrayerPairingInterface` client component (`app/(app)/_components/prayer-pairing-interface.tsx`) to display status and buttons, calling server actions.
    *   **Step 9.3 (Page):** Implement `app/(app)/orar-dupla/page.tsx`. Fetch initial status, render the interface component.

**10. Monetization & Premium Features:**
    *   **Step 10.1 (Util):** Create `isUserPremium` utility function in `lib/utils.ts` or `lib/auth/helpers.ts` based on user context data.
    *   **Step 10.2 (Stripe Check):** Verify checkout flow (`createCheckoutSession`), webhook (`handleSubscriptionChange`) correctly update `teams` and `users` (trial date) tables as per spec. Adapt if needed.
    *   **Step 10.3 (Feature Gate - Audio):** Ensure `AudioPlayer` uses `isPremium` correctly (already done in Step 5.6).
    *   **Step 10.4 (Feature - Themes - Backend):** Add setting UI in `app/(dashboard)/dashboard/general/page.tsx` (or a new settings page in `app/(app)`) to select theme. Create `updateUserSettings` action in `lib/auth/actions.ts` to save theme preference to `users.theme`.
    *   **Step 10.5 (Feature - Themes - Frontend):** Modify root layout (`app/layout.tsx`) or app layout (`app/(app)/layout.tsx`) to fetch user theme preference and apply corresponding CSS class (e.g., `theme-light`, `theme-gold`) to the `<body>` or main wrapper. Define theme styles in `globals.css`.
    *   **Step 10.6 (Ads - Component):** Create basic `AdBanner` client component (`app/(app)/_components/ad-banner.tsx`). *Initially, this might just be a placeholder div.* User instruction needed for AdMob SDK integration later.
    *   **Step 10.7 (Ads - Integration):** Conditionally render `AdBanner` in `app/(app)/layout.tsx` or specific pages based on `!isPremium` from user context.
    *   **Step 10.8 (Feature - Offline - Basic PWA):** Enhance `public/sw.js` to cache static assets. Add basic fetch handler. Register service worker in `app/layout.tsx` (client component wrapper needed). *Full offline content caching is complex and deferred per spec.*

**11. Push Notifications:**
    *   **Step 11.1 (Backend):** Add VAPID keys to env. Implement `savePushSubscription` action (`lib/auth/actions.ts`). Install `web-push` library.
    *   **Step 11.2 (Frontend):** Add UI in settings (`app/(dashboard)/dashboard/general/page.tsx` or new page) to request notification permission and subscribe, calling `savePushSubscription`.
    *   **Step 11.3 (Backend - Sending):** Create `lib/notifications/actions.ts` with `sendNotification` logic using `web-push`.
    *   **Step 11.4 (Backend - Cron):** Create a cron job route (`app/api/cron/send-reminders/route.ts`) and Vercel config. *This job needs logic to query users based on `notification_time`/`tz` and call `sendNotification`. Start with a simpler daily broadcast if needed.*

**12. Settings & Cleanup:**
    *   **Step 12.1:** Review/adapt existing dashboard pages (`app/(dashboard)/dashboard/*`). Rename "Team Settings" to "Account Settings" or similar. Remove invitation/team member features if not needed for MVP. Ensure subscription management links work.
    *   **Step 12.2:** Adapt Marketing Page (`app/(dashboard)/page.tsx`) to reflect Palavra Viva, or simplify/remove if `/app` is the main entry.
    *   **Step 12.3:** Adapt Pricing Page (`app/(dashboard)/pricing/page.tsx`). Update text, features listed. Ensure correct Stripe Price IDs are fetched/used. *Needs Stripe Product setup by user*.

**13. Testing:**
    *   **Step 13.1 (Unit Tests):** Add unit tests for key server actions (e.g., `generateDailyContent`, `updateReadingProgress`, `isUserPremium`) mocking dependencies.
    *   **Step 13.2 (E2E Tests):** Set up Playwright (if not already) and write E2E tests covering main user flows (auth, view content, start plan, add prayer, start trial).

**Final Review:** Check dependencies between steps. Ensure file modification limits are respected. Add clear user instructions. Looks feasible.
</brainstorming>

# Implementation Plan

## Phase 1: Project Setup & Configuration

-   [x] Step 1.1: Initialize Project & Basic Naming
    -   **Task**: Update project name in `package.json`, `README.md`, and metadata title/description in `app/layout.tsx` to "Palavra Viva". Add a brief description about the app in the README.
    -   **Files**:
        -   `package.json`: Modify `name` field (if applicable, often derived from folder name) and potentially description.
        -   `README.md`: Update title and introductory paragraph.
        -   `app/layout.tsx`: Update `metadata.title` and `metadata.description`.
    -   **Step Dependencies**: None
    -   **User Instructions**: None

-   [x] Step 1.2: Configure Environment Variables
    -   **Task**: Add necessary environment variables for Palavra Viva features to `.env.example`. Explain what each variable is for.
    -   **Files**:
        -   `.env.example`: Add `OPENAI_API_KEY`, `ELEVENLABS_API_KEY`, `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `CRON_SECRET`, `ADMOB_APP_ID` (optional, if needed client-side), `BIBLE_API_URL` (optional, depends on Bible source choice). Add comments explaining each.
    -   **Step Dependencies**: Step 1.1
    -   **User Instructions**:
        -   Copy `.env.example` to `.env`.
        -   Obtain API keys/secrets from OpenAI, ElevenLabs, AdMob (if using).
        -   Generate VAPID keys (e.g., using `npx web-push generate-vapid-keys`).
        -   Generate a secure `CRON_SECRET` (e.g., using `openssl rand -hex 32`).
        -   Fill in the values in your local `.env` file.
        -   Choose and configure a Bible text source (API or local file) and set `BIBLE_API_URL` or path if needed.

-   [x] Step 1.3: Basic Theme Customization
    -   **Task**: Update `globals.css` with the primary color palette defined in the technical specification (white, gold, light blue accents). Define CSS variables for the Palavra Viva theme colors. Update Tailwind config if necessary to extend colors.
    -   **Files**:
        -   `app/globals.css`: Update color variables in `:root` and `.dark` selectors based on spec (e.g., `--primary: hsl(...)` for gold, `--secondary` for light blue). Remove unused chart/sidebar variables if desired. Ensure Manrope font is correctly applied.
        -   `tailwind.config.ts` (Optional): Extend `theme.colors` if using custom color names directly in Tailwind classes.
    -   **Step Dependencies**: Step 1.1
    -   **User Instructions**: None

-   [x] Step 1.4: Basic PWA Setup
    -   **Task**: Create a basic `manifest.json` file for PWA installation and an empty service worker file `sw.js`.
    -   **Files**:
        -   `public/manifest.json`: Create file with basic properties: `name`, `short_name`, `start_url`, `display`, `background_color`, `theme_color`, basic `icons` array (user will need to provide actual icon files later).
        -   `public/sw.js`: Create an empty file (initial registration).
        -   `app/layout.tsx`: Add `<link rel="manifest" href="/manifest.json" />` to the `<head>`. Add basic service worker registration logic inside a `useEffect` within a client component wrapper (or modify `UserProvider` if suitable).
    -   **Step Dependencies**: Step 1.1
    -   **User Instructions**: Create app icon files (various sizes) and place them in `public/icons/`, updating the `icons` array in `manifest.json` accordingly.

## Phase 2: Database Schema & Setup

-   [x] Step 2.1: Adapt `users` Table Schema
    -   **Task**: Add Palavra Viva specific fields to the `users` table schema in Drizzle.
    -   **Files**:
        -   `lib/db/schema.ts`: Add `notification_time` (TIME, nullable, default), `notification_tz` (VARCHAR, not null, default), `push_subscription` (JSONB, nullable), `theme` (VARCHAR, not null, default 'light'), `trial_end_date` (TIMESTAMP, nullable), `requested_pairing_at` (TIMESTAMP, nullable) to the `users` table definition. Update exported `User` type if needed (usually automatic).
    -   **Step Dependencies**: Step 1.1
    -   **User Instructions**: None

-   [x] Step 2.2: Adapt `teams` Table Schema
    -   **Task**: Ensure the `teams` table schema is suitable for representing individual user subscriptions/accounts, including adding a unique FK to the user.
    -   **Files**:
        -   `lib/db/schema.ts`: Add `user_id` (INTEGER NOT NULL UNIQUE REFERENCES `users`(`id`) ON DELETE CASCADE) to the `teams` table. Review existing fields (`name`, `stripe_*`, `plan_name`, `subscription_status`) and confirm they align with the spec's use case (1 team per user). Update relations (`teamsRelations`, `usersRelations`) if necessary (e.g., `users` should have a `one` relation to `teams`). Update exported types.
    -   **Step Dependencies**: Step 2.1
    -   **User Instructions**: None

-   [x] Step 2.3: Adapt `team_members` Table Schema (Minor)
    -   **Task**: Ensure `team_members` FK constraints point to the updated `users` and `teams` tables correctly. *No structural changes needed if kept 1:1 as per spec decision.*
    -   **Files**:
        -   `lib/db/schema.ts`: Verify `userId` references `users(id)` and `teamId` references `teams(id)`. Ensure `ON DELETE CASCADE` is appropriate (likely yes for `teamId`, maybe `SET NULL` or `CASCADE` for `userId` depending on desired behavior if user is deleted). Update relations.
    -   **Step Dependencies**: Step 2.2
    -   **User Instructions**: None

-   [x] Step 2.4: Update `ActivityType` Enum
    -   **Task**: Add new activity types specific to Palavra Viva in the `ActivityType` enum.
    -   **Files**:
        -   `lib/db/schema.ts`: Add new enum values to `ActivityType`: `VIEW_DAILY_CONTENT`, `PLAY_AUDIO`, `SHARE_CONTENT`, `ADD_PRAYER`, `DELETE_PRAYER`, `START_READING_PLAN`, `COMPLETE_READING_DAY`, `COMPLETE_READING_PLAN`, `REQUEST_PRAYER_PAIR`, `MARK_PRAYER_DONE`, `ENABLE_NOTIFICATIONS`, `CHANGE_THEME`.
    -   **Step Dependencies**: Step 2.1
    -   **User Instructions**: None

-   [x] Step 2.5: Create `daily_content` Table Schema
    -   **Task**: Define the Drizzle schema for the `daily_content` table.
    -   **Files**:
        -   `lib/db/schema.ts`: Define and export `daily_content` table with columns: `id` (SERIAL PK), `content_date` (DATE NOT NULL UNIQUE), `verse_ref` (VARCHAR NOT NULL), `verse_text` (TEXT NOT NULL), `reflection_text` (TEXT NOT NULL), `audio_url_free` (TEXT NULLABLE), `audio_url_premium` (TEXT NULLABLE), `created_at`, `updated_at`. Add relevant indexes (e.g., on `content_date`). Export types `DailyContent`, `NewDailyContent`.
    -   **Step Dependencies**: Step 2.1
    -   **User Instructions**: None

-   [x] Step 2.6: Create `reading_plans` Table Schema
    -   **Task**: Define the Drizzle schema for the `reading_plans` table.
    -   **Files**:
        -   `lib/db/schema.ts`: Define and export `reading_plans` table with columns: `id` (SERIAL PK), `title` (VARCHAR NOT NULL), `description` (TEXT), `duration_days` (INTEGER NOT NULL), `theme` (VARCHAR NULLABLE), `is_premium` (BOOLEAN NOT NULL DEFAULT false), `created_at`, `updated_at`. Add indexes. Export types `ReadingPlan`, `NewReadingPlan`.
    -   **Step Dependencies**: Step 2.1
    -   **User Instructions**: None

-   [x] Step 2.7: Create `reading_plan_days` Table Schema
    -   **Task**: Define the Drizzle schema for the `reading_plan_days` table.
    -   **Files**:
        -   `lib/db/schema.ts`: Define and export `reading_plan_days` table with columns: `id` (SERIAL PK), `plan_id` (INTEGER NOT NULL REFERENCES `reading_plans`(`id`) ON DELETE CASCADE), `day_number` (INTEGER NOT NULL), `verse_ref` (VARCHAR NOT NULL), `verse_text` (TEXT NOT NULL), `content` (TEXT NULLABLE), `created_at`, `updated_at`. Add unique constraint on `(plan_id, day_number)`. Add indexes. Define relations to `reading_plans`. Export types `ReadingPlanDay`, `NewReadingPlanDay`.
    -   **Step Dependencies**: Step 2.6
    -   **User Instructions**: None

-   [x] Step 2.8: Create `user_reading_progress` Table Schema
    -   **Task**: Define the Drizzle schema for the `user_reading_progress` table.
    -   **Files**:
        -   `lib/db/schema.ts`: Define and export `user_reading_progress` table with columns: `id` (SERIAL PK), `user_id` (INTEGER NOT NULL REFERENCES `users`(`id`) ON DELETE CASCADE), `plan_id` (INTEGER NOT NULL REFERENCES `reading_plans`(`id`) ON DELETE CASCADE), `current_day` (INTEGER NOT NULL DEFAULT 1), `completed_at` (TIMESTAMP NULLABLE), `started_at` (TIMESTAMP NOT NULL DEFAULT now()), `last_updated` (TIMESTAMP NOT NULL DEFAULT now()). Add unique constraint on `(user_id, plan_id)`. Add indexes. Define relations to `users` and `reading_plans`. Export types `UserReadingProgress`, `NewUserReadingProgress`.
    -   **Step Dependencies**: Step 2.7, Step 2.1
    -   **User Instructions**: None

-   [x] Step 2.9: Create `prayer_pairs` Table Schema
    -   **Task**: Define the Drizzle schema for the `prayer_pairs` table.
    -   **Files**:
        -   `lib/db/schema.ts`: Define and export `prayer_pairs` table with columns: `id` (SERIAL PK), `user1_id` (INTEGER NOT NULL REFERENCES `users`(`id`) ON DELETE CASCADE), `user2_id` (INTEGER NOT NULL REFERENCES `users`(`id`) ON DELETE CASCADE), `created_at` (TIMESTAMP NOT NULL DEFAULT now()), `user1_last_prayed_at` (TIMESTAMP NULLABLE), `user2_last_prayed_at` (TIMESTAMP NULLABLE), `user1_notified_at` (TIMESTAMP NULLABLE), `user2_notified_at` (TIMESTAMP NULLABLE), `is_active` (BOOLEAN NOT NULL DEFAULT true). Add CHECK constraint `user1_id < user2_id`. Add indexes on user IDs and `is_active`. Define relations to `users`. Export types `PrayerPair`, `NewPrayerPair`.
    -   **Step Dependencies**: Step 2.1
    -   **User Instructions**: None

-   [x] Step 2.10: Generate Database Migration
    -   **Task**: Run the Drizzle Kit command to generate the SQL migration file based on schema changes.
    -   **Files**:
        -   `lib/db/migrations/*`: A new SQL migration file will be generated.
        -   `lib/db/migrations/meta/_journal.json`: Updated by Drizzle Kit.
    -   **Step Dependencies**: Steps 2.1-2.9
    -   **User Instructions**: Run `pnpm db:generate` in the terminal. Review the generated SQL file for correctness.

-   [x] Step 2.11: Apply Database Migration
    -   **Task**: Apply the generated migration to the database.
    -   **Files**: None (Database state changes)
    -   **Step Dependencies**: Step 2.10
    -   **User Instructions**: Ensure your database connection in `.env` is correct. Run `pnpm db:migrate` in the terminal.

## Phase 3: Authentication & User Context Updates

-   [x] Step 3.1: Adapt `signUp` Server Action
    -   **Task**: Modify the `signUp` action to create an associated `team` record for the new user (treating it as their individual account/subscription record) and set the `trial_end_date` on the user record.
    -   **Files**:
        -   `app/(login)/actions.ts`: In `signUp`, after creating the `user`, create a `team` record with `name` (e.g., `"${user.email}'s Account"`) and `user_id: user.id`. Update the `user` record to set `trial_end_date` (e.g., `new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)`). Ensure the correct `teamId` is used for `logActivity` and `teamMembers` insertion. Adjust logic for handling invited users if `inviteId` is present (associate with existing team, don't set trial).
    -   **Step Dependencies**: Step 2.2, Step 2.1
    -   **User Instructions**: None

-   [x] Step 3.2: Create `getUserWithSubscription` Query
    -   **Task**: Implement a query function to fetch the authenticated user along with their subscription details from the associated `teams` record and their trial end date.
    -   **Files**:
        -   `lib/db/queries.ts`: Create `getUserWithSubscription` function. It should first call `getUser` (or replicate its session checking logic). If a user is found, query the `teams` table `WHERE user_id = user.id` and join/include the user data (specifically `users.trial_end_date`). Return an object containing the user data and the associated team/subscription data, or null if no user/team found.
    -   **Step Dependencies**: Step 2.2, Step 2.1
    -   **User Instructions**: None

-   [x] Step 3.3: Update `UserProvider` and `useUser` Hook
    -   **Task**: Modify the `UserProvider` to fetch user data using `getUserWithSubscription`, calculate the `isPremium` status, and provide the user, subscription details, and `isPremium` flag via the `useUser` hook.
    -   **Files**:
        -   `lib/auth/index.tsx`: Update `UserProvider` to use `getUserWithSubscription` for `userPromise`. Define a new context type `UserContextType` that includes `user: User | null`, `team: Team | null`, `isPremium: boolean`, and `setUser`. Calculate `isPremium` inside the provider based on `team.subscriptionStatus` ('active', 'trialing') and `user.trial_end_date`. Update the value passed to `UserContext.Provider`. Update `useUser` hook to return this new context type.
        -   `lib/utils.ts` (Optional): Define the `isUserPremium(user, team)` helper function here if preferred.
    -   **Step Dependencies**: Step 3.2
    -   **User Instructions**: None

-   [x] Step 3.4: Update Middleware Protected Routes
    -   **Task**: Change the middleware to protect the core application routes (`/app/*`) instead of the dashboard routes (`/dashboard/*`).
    -   **Files**:
        -   `middleware.ts`: Change the `protectedRoutes` variable or the logic within the middleware function to match `/app` instead of `/dashboard`. Ensure redirects point to `/sign-in`.
    -   **Step Dependencies**: None
    -   **User Instructions**: None

## Phase 4: Core Application Structure & Layout

-   [x] Step 4.1: Create Core App Route Group & Placeholder Page
    -   **Task**: Set up the main authenticated route group `(app)` and create a placeholder homepage.
    -   **Files**:
        -   `app/(app)/page.tsx`: Create a simple Server Component displaying "Palavra Viva - Home". Mark with `"use server";`.
    -   **Step Dependencies**: Step 3.4
    -   **User Instructions**: None

-   [x] Step 4.2: Create Core App Layout
    -   **Task**: Create the layout file for the `(app)` route group.
    -   **Files**:
        -   `app/(app)/layout.tsx`: Create a Server Component layout that wraps `{children}`. Include basic structure (e.g., `<main>`). Mark with `"use server";`.
    -   **Step Dependencies**: Step 4.1
    -   **User Instructions**: None

-   [x] Step 4.3: Implement Bottom Navigation Component
    -   **Task**: Create a client component for bottom navigation suitable for mobile PWA feel.
    -   **Files**:
        -   `app/(app)/_components/bottom-navigation.tsx`: Create a Client Component (`"use client";`). Use `Link` from `next/link` and `usePathname` hook. Include links (with icons from `lucide-react`) for "Início" (`/app`), "Planos" (`/app/planos`), "Orações" (`/app/oracoes`), "Orar Dupla" (`/app/orar-dupla`), "Ajustes" (`/dashboard`). Style it fixed to the bottom for mobile views (e.g., using Tailwind classes `fixed bottom-0 left-0 right-0 lg:hidden`). Highlight the active link based on `pathname`.
    -   **Step Dependencies**: Step 4.1
    -   **User Instructions**: None

-   [x] Step 4.4: Integrate Bottom Navigation into Layout
    -   **Task**: Add the `BottomNavigation` component to the core app layout.
    -   **Files**:
        -   `app/(app)/layout.tsx`: Import and render the `BottomNavigation` component within the layout structure (likely after the main content area). Adjust padding on the main content area if needed to avoid overlap with the fixed bottom nav.
    -   **Step Dependencies**: Step 4.2, Step 4.3
    -   **User Instructions**: None

-   [x] Step 4.5: Create Placeholder Pages for App Sections
    -   **Task**: Create placeholder pages for the other main sections linked from the bottom navigation.
    -   **Files**:
        -   `app/(app)/planos/page.tsx`: Create server component displaying "Planos de Leitura".
        -   `app/(app)/oracoes/page.tsx`: Create server component displaying "Orações Pessoais".
        -   `app/(app)/orar-dupla/page.tsx`: Create server component displaying "Oração em Dupla".
        -   `app/(app)/planos/[planId]/page.tsx`: Create server component displaying "Detalhe do Plano [planId]".
    -   **Step Dependencies**: Step 4.1
    -   **User Instructions**: None

## Phase 5: Daily Content Feature Implementation

-   [x] Step 5.1: Setup OpenAI & ElevenLabs Clients
    -   **Task**: Create service clients for OpenAI and ElevenLabs APIs.
    -   **Files**:
        -   `lib/content/openai.ts`: Create file. Initialize OpenAI client (e.g., using `openai` library) with `process.env.OPENAI_API_KEY`. Export helper functions for specific chat completion calls (e.g., `getVerseSuggestion`, `generateReflection`).
        -   `lib/content/elevenlabs.ts`: Create file. Initialize ElevenLabs client (e.g., using `elevenlabs` library or direct fetch) with `process.env.ELEVENLABS_API_KEY`. Export helper function `generateAudio(text, voiceId)` that returns the audio URL or buffer.
    -   **Step Dependencies**: Step 1.2
    -   **User Instructions**: Run `pnpm install openai elevenlabs` (or relevant libraries).

-   [x] Step 5.2: Implement Bible Text Source (Mock)
    -   **Task**: Create a placeholder function to retrieve Bible verse text.
    -   **Files**:
        -   `lib/content/bible.ts`: Create file. Implement `async function getVerseText(verseRef: string): Promise<string>` that returns a hardcoded string like `"Mock text for ${verseRef}"`.
    -   **Step Dependencies**: None
    -   **User Instructions**: Later, replace the mock implementation with a real Bible API client or local data lookup based on the chosen source.

-   [x] Step 5.3: Implement `generateDailyContent` Server Action
    -   **Task**: Create the server action responsible for generating the daily verse, reflection, and audio, and storing it in the database.
    -   **Files**:
        -   `lib/content/actions.ts`: Create file. Implement `generateDailyContent(date)` server action (`"use server";`). Logic: Check if content exists for `date`. Call `getVerseSuggestion` (OpenAI). Call `getVerseText` (Bible Source). Call `generateReflection` (OpenAI). Call `generateAudio` (ElevenLabs) twice (free/premium voice IDs - store these IDs in constants or env). Insert results into `daily_content` table using Drizzle. Include `try...catch` blocks for API calls and DB operations, logging errors.
    -   **Step Dependencies**: Step 5.1, Step 5.2, Step 2.5
    -   **User Instructions**: Define appropriate voice IDs for free/premium tiers in `lib/content/elevenlabs.ts` or `.env`. Ensure OpenAI prompt engineering aligns with the spec's requirements.

-   [x] Step 5.4: Implement Cron Job Trigger
    -   **Task**: Create the API route endpoint triggered by Vercel Cron and configure the schedule.
    -   **Files**:
        -   `app/api/cron/generate-daily-content/route.ts`: Create POST route handler. Check `Authorization` header against `process.env.CRON_SECRET`. If valid, call `generateDailyContent(tomorrow)`. Return success/error response.
        -   `vercel.json`: Create or update file. Add a `crons` entry to schedule the API route daily (e.g., `"schedule": "0 3 * * *"` for 3 AM UTC).
    -   **Step Dependencies**: Step 5.3, Step 1.2
    -   **User Instructions**: Deploy the project to Vercel for the cron job to function. Configure the Cron Secret in Vercel environment variables.

-   [x] Step 5.5: Implement `getDailyContent` Query/Action
    -   **Task**: Create the function to fetch daily content for the frontend.
    -   **Files**:
        -   `lib/content/actions.ts`: Add `async function getDailyContent(date: Date): Promise<DailyContent | null>` (can be a simple query function or a server action). Query the `daily_content` table for the given date.
    -   **Step Dependencies**: Step 2.5
    -   **User Instructions**: None

-   [x] Step 5.6: Create `AudioPlayer` Component
    -   **Task**: Implement the client component for playing audio.
    -   **Files**:
        -   `app/(app)/_components/audio-player.tsx`: Create client component (`"use client";`). Accept `audioUrlFree`, `audioUrlPremium`, `isPremium` props. Use `useState` for `isPlaying`. Use `useRef` for `HTMLAudioElement`. Select correct URL based on `isPremium`. Render Play/Pause button (Shadcn `Button`, `lucide-react` icons). Implement play/pause logic and handle audio `ended` event. Handle cases where URLs are null.
    -   **Step Dependencies**: Step 3.3
    -   **User Instructions**: None

-   [x] Step 5.7: Create `DailyContentViewer` Component
    -   **Task**: Implement the client component to display the daily content.
    -   **Files**:
        -   `app/(app)/_components/daily-content-viewer.tsx`: Create client component (`"use client";`). Accept `content: DailyContent` and `isPremium: boolean` props. Display date, verse reference, verse text, reflection text using Shadcn `Card` components. Integrate the `AudioPlayer` component, passing appropriate props. Add a placeholder button for "Compartilhar".
    -   **Step Dependencies**: Step 5.6, Step 2.5 (Types)
    -   **User Instructions**: None

-   [x] Step 5.8: Implement Daily Content Homepage
    -   **Task**: Implement the main homepage to fetch and display the daily content.
    -   **Files**:
        -   `app/(app)/page.tsx`: Modify the placeholder page. Make it an `async function Page()` server component. Fetch user subscription status (`isPremium`) using `getUserWithSubscription` or `useUser` context setup. Fetch daily content using `getDailyContent(new Date())`. Use the Suspense helper pattern: wrap an async data-loading component call in `<Suspense>`. Pass fetched content and `isPremium` to `DailyContentViewer`. Handle loading/error states (e.g., "Conteúdo não disponível").
    -   **Step Dependencies**: Step 5.5, Step 5.7, Step 3.2/3.3
    -   **User Instructions**: None

## Phase 6: Personal Prayers Feature Implementation

-   [x] Step 6.1: Implement `PrayerList` Component
    -   **Task**: Create the client component for managing personal prayers using local storage.
    -   **Files**:
        -   `app/(app)/_components/prayer-list.tsx`: Create client component (`"use client";`). Use `useState` for `prayers` array. Use `useEffect` to load/save prayers from/to `localStorage` (`JSON.stringify`/`parse`). Implement functions `addPrayer(text)` and `deletePrayer(id)`. Render an `Input` and "Add" `Button` for adding prayers. Render the list of prayers (e.g., using `Card`), each with a delete `Button`.
    -   **Step Dependencies**: None
    -   **User Instructions**: None

-   [x] Step 6.2: Implement Personal Prayers Page
    -   **Task**: Create the page to display the `PrayerList` component.
    -   **Files**:
        -   `app/(app)/oracoes/page.tsx`: Modify the placeholder page. Render the `PrayerList` component. Add a title like "Meus Pedidos e Agradecimentos". Can remain a Server Component simply rendering the Client Component.
    -   **Step Dependencies**: Step 6.1
    -   **User Instructions**: None

## Phase 7: Reading Plans Feature Implementation

-   [x] Step 7.1: Seed Reading Plan Data
    -   **Task**: Add logic to the seed script to populate initial reading plan data.
    -   **Files**:
        -   `lib/db/seed.ts`: Add code to insert 2-3 sample plans into `reading_plans` and their corresponding daily readings into `reading_plan_days`. Define plan details (title, description, duration) and daily verses (ref + text).
    -   **Step Dependencies**: Step 2.6, Step 2.7
    -   **User Instructions**: Run `pnpm db:seed` (or follow instructions if seeding is separate). Ensure Bible verse text is included directly in `reading_plan_days` or fetched during seeding if `verse_text` isn't directly stored.

-   [x] Step 7.2: Implement Reading Plan Server Actions/Queries
    -   **Task**: Create backend functions for fetching plan data and managing user progress.
    -   **Files**:
        -   `lib/reading-plans/actions.ts`: Create file. Implement `getAllReadingPlans()` (query `reading_plans`). Implement `getReadingPlanDetails(planId)` (query `reading_plans` join `reading_plan_days`). Implement `getUserProgress(userId)` (query `user_reading_progress`). Implement `updateReadingProgress(userId, planId, dayNumber)` server action (use `validatedActionWithUser`, upsert `user_reading_progress`, update `current_day`, set `completed_at` if last day).
    -   **Step Dependencies**: Step 2.6, Step 2.7, Step 2.8
    -   **User Instructions**: None

-   [x] Step 7.3: Create Reading Plan Frontend Components
    -   **Task**: Create the necessary client components for displaying reading plans and progress.
    -   **Files**:
        -   `app/(app)/_components/reading-plan-card.tsx`: Client component (`"use client";`) to display a single plan summary (title, duration, theme). Props: `{ plan: ReadingPlan }`. Use Shadcn `Card`.
        -   `app/(app)/_components/reading-plan-list.tsx`: Client component (`"use client";`) to display a list of `ReadingPlanCard`s. Props: `{ plans: ReadingPlan[], userProgress: UserReadingProgress[] }`. Show progress indicators on cards if user has started. Link cards to `/app/planos/[planId]`.
        -   `app/(app)/_components/reading-plan-day.tsx`: Client component (`"use client";`) to display the content for a single day (verse ref, verse text). Props: `{ day: ReadingPlanDay }`.
        -   `app/(app)/_components/reading-plan-viewer.tsx`: Client component (`"use client";`) to display the details of a specific plan. Props: `{ plan: ReadingPlanWithDays, progress: UserReadingProgress | null }`. Show plan title/desc. List days, indicating completed/current day. Display current day's content using `ReadingPlanDay`. Include "Mark as Complete" button triggering `updateReadingProgress` action.
    -   **Step Dependencies**: Step 7.2 (Types)
    -   **User Instructions**: None

-   [x] Step 7.4: Implement Reading Plan List Page
    -   **Task**: Create the page to display the list of available reading plans.
    -   **Files**:
        -   `app/(app)/planos/page.tsx`: Modify placeholder. Make it an `async function Page()`. Fetch all plans using `getAllReadingPlans`. Fetch user progress using `getUserProgress`. Pass data to `ReadingPlanList` component. Use Suspense for loading states.
    -   **Step Dependencies**: Step 7.2, Step 7.3
    -   **User Instructions**: None

-   [x] Step 7.5: Implement Reading Plan Detail Page
    -   **Task**: Create the page to display the details and daily content of a specific reading plan.
    -   **Files**:
        -   `app/(app)/planos/[planId]/page.tsx`: Modify placeholder. Make it an `async function Page({ params })`. Get `planId` from `params`. Fetch plan details using `getReadingPlanDetails(planId)`. Fetch user progress for this specific plan. Pass data to `ReadingPlanViewer`. Handle invalid `planId` (e.g., `notFound()`). Use Suspense for loading states.
    -   **Step Dependencies**: Step 7.2, Step 7.3
    -   **User Instructions**: None

## Phase 8: Shareable Blessings Feature

-   [x] Step 8.1: Implement `ShareableImageGenerator` Component
    -   **Task**: Create the client component that generates and shares an image using Canvas and Web Share API.
    -   **Files**:
        -   `app/(app)/_components/shareable-image-generator.tsx`: Create client component (`"use client";`). Accept `verseText`, `reflectionText` props. Use `useRef` for `<canvas>`. Implement function `generateAndShare()`: draw background/text/branding on canvas, convert to blob (`toBlob`), use `navigator.share` with the blob converted to a `File`. Provide download fallback (`toDataURL`) if `navigator.share` is unavailable or fails.
    -   **Step Dependencies**: None
    -   **User Instructions**: Consider adding a simple app logo image to `public/` and loading it onto the canvas.

-   [x] Step 8.2: Integrate Sharing into Daily Content Viewer
    -   **Task**: Add the share functionality to the daily content view.
    -   **Files**:
        -   `app/(app)/_components/daily-content-viewer.tsx`: Import `ShareableImageGenerator` (or its trigger function/modal logic). Replace the placeholder "Compartilhar" button with a real button. `onClick`, call the `generateAndShare` function from the generator component, passing the relevant text. Consider triggering a modal containing the generator if more options are needed.
    -   **Step Dependencies**: Step 8.1, Step 5.7
    -   **User Instructions**: None

## Phase 9: Prayer Pairing Feature

-   [ ] Step 9.1: Implement Prayer Pairing Server Actions
    -   **Task**: Create backend actions for managing prayer pairing requests and status.
    -   **Files**:
        -   `lib/prayers/actions.ts`: Create file. Implement `requestPrayerPair` (`validatedActionWithUser`): Check existing pairs, find partner (query `users` where `requested_pairing_at` is recent and not self, not already paired), create `prayer_pairs` record, update `users.requested_pairing_at`. Implement `markPrayerAsDone` (`validatedActionWithUser`): Find active pair, update `userX_last_prayed_at` and `userY_notified_at` in `prayer_pairs`. Implement `getPrayerPairStatus(userId)`: Query `prayer_pairs` and `users.requested_pairing_at`, check `notified_at` flags, return status object (e.g., `{ status: 'paired' | 'waiting' | 'not_started', notified: boolean }`). Reset `notified_at` flag in DB after fetching if returning notified status.
    -   **Step Dependencies**: Step 2.9, Step 2.1
    -   **User Instructions**: None

-   [ ] Step 9.2: Implement Prayer Pairing Interface Component
    -   **Task**: Create the frontend component for users to interact with the prayer pairing feature.
    -   **Files**:
        -   `app/(app)/_components/prayer-pairing-interface.tsx`: Create client component (`"use client";`). Props: `{ initialStatus: PrayerPairStatus }`. Use `useState` to manage current status, potentially refreshing periodically or after actions. Display messages based on status ("Você está orando por alguém", "Alguém está orando por você", "Buscando alguém para orar...", etc.). Show "Quero orar por alguém" button (calls `requestPrayerPair` action) or "Orei pela pessoa" button (calls `markPrayerAsDone` action) based on state. Use `useActionState` for feedback.
    -   **Step Dependencies**: Step 9.1 (Types)
    -   **User Instructions**: None

-   [ ] Step 9.3: Implement Prayer Pairing Page
    -   **Task**: Create the page for the prayer pairing feature.
    -   **Files**:
        -   `app/(app)/orar-dupla/page.tsx`: Modify placeholder. Make it an `async function Page()`. Fetch the user's initial prayer pair status using `getPrayerPairStatus`. Pass the status to the `PrayerPairingInterface` component. Add explanatory text.
    -   **Step Dependencies**: Step 9.1, Step 9.2
    -   **User Instructions**: None

## Phase 10: Monetization & Premium Features

-   [ ] Step 10.1: Implement `isUserPremium` Utility
    -   **Task**: Create a helper function to determine if a user has premium access (active subscription or trial).
    -   **Files**:
        -   `lib/auth/helpers.ts` (or `lib/utils.ts`): Create file if it doesn't exist. Add function `isUserPremium(user: User | null, team: Team | null): boolean`. Logic should check if `team?.subscriptionStatus === 'active'` OR (`team?.subscriptionStatus === 'trialing'` AND `user?.trialEndDate` exists AND `user.trialEndDate > new Date()`).
    -   **Step Dependencies**: Step 3.3 (Context needs user/team data)
    -   **User Instructions**: None

-   [ ] Step 10.2: Verify Stripe Integration & Trial Logic
    -   **Task**: Review and confirm the Stripe checkout action, webhook handler, and signup action correctly manage subscription status and trial dates as per the specification. Make minor adjustments if necessary.
    -   **Files**:
        -   `lib/payments/actions.ts`: Review `checkoutAction`.
        -   `lib/payments/stripe.ts`: Review `createCheckoutSession` (ensure `trial_period_days: 7`), `handleSubscriptionChange` (ensure it updates `teams` status correctly).
        -   `app/(login)/actions.ts`: Review `signUp` action's trial date setting.
        -   `app/api/stripe/checkout/route.ts`: Review session handling on success.
        -   `app/api/stripe/webhook/route.ts`: Review webhook route.
    -   **Step Dependencies**: Step 3.1, Step 2.2, Step 2.1
    -   **User Instructions**: Set up Stripe products ("Palavra Viva Premium" - monthly/annual) and prices (with 7-day trial) in the Stripe Dashboard. Add Price IDs to `.env` if not fetched dynamically. Test the checkout flow locally with Stripe CLI listening.

-   [ ] Step 10.3: Implement Theme Switching (Backend & Settings UI)
    -   **Task**: Add theme preference to user settings and create the action to update it.
    -   **Files**:
        -   `lib/auth/actions.ts`: Create `updateUserSettings` server action (`validatedActionWithUser`). Schema should accept `theme: z.enum(['light', 'dark', 'gold'])`. Action updates `users.theme` field.
        -   `app/(dashboard)/dashboard/general/page.tsx` (or create `app/(app)/settings/page.tsx`): Add a section with radio buttons (Shadcn `RadioGroup`) for theme selection ('Claro', 'Escuro', 'Dourado'). Use a form that calls the `updateUserSettings` action.
    -   **Step Dependencies**: Step 2.1
    -   **User Instructions**: None

-   [ ] Step 10.4: Implement Theme Switching (Frontend Application)
    -   **Task**: Apply the selected theme dynamically to the application layout. Define theme CSS.
    -   **Files**:
        -   `app/layout.tsx` (or `app/(app)/layout.tsx`): Wrap the layout contents in a Client Component (`ThemeApplier`). This component uses `useUser` to get the user's theme preference (or default). In a `useEffect`, it updates a class on the `<html>` or `<body>` tag (e.g., `document.documentElement.className = theme;`).
        -   `app/globals.css`: Define CSS rules for `.light`, `.dark`, `.gold` themes using the color variables defined earlier. Ensure Tailwind variants for dark mode (`dark:`) work alongside these theme classes if necessary.
    -   **Step Dependencies**: Step 10.3, Step 3.3
    -   **User Instructions**: Ensure CSS properly overrides defaults for each theme.

-   [ ] Step 10.5: Create AdBanner Component (Placeholder)
    -   **Task**: Create a basic placeholder component for AdMob ads.
    -   **Files**:
        -   `app/(app)/_components/ad-banner.tsx`: Create client component (`"use client";`). For now, render a simple styled `div` with text "Ad Placeholder". Accept props like `adUnitId` if needed later.
    -   **Step Dependencies**: None
    -   **User Instructions**: Sign up for AdMob and get an App ID / Ad Unit IDs. Later, integrate the AdMob SDK (e.g., `react-google-mobile-ads` wrapper or web SDK script) into this component.

-   [ ] Step 10.6: Integrate AdBanner Component
    -   **Task**: Conditionally render the `AdBanner` based on the user's premium status.
    -   **Files**:
        -   `app/(app)/layout.tsx`: Import `AdBanner`. Use the `useUser` hook (within a client component part of the layout if layout is server component) to get `isPremium`. Render `<AdBanner />` (e.g., at the bottom or top) only if `!isPremium`.
    -   **Step Dependencies**: Step 10.5, Step 3.3, Step 10.1
    -   **User Instructions**: None

-   [ ] Step 10.7: Implement Basic PWA Service Worker Caching
    -   **Task**: Add basic caching for static assets in the service worker.
    -   **Files**:
        -   `public/sw.js`: Add basic install/activate/fetch event listeners. In 'install', cache static assets (CSS, JS, fonts, manifest). In 'fetch', implement a cache-first or network-first strategy for assets.
        -   `app/layout.tsx` (or client wrapper within): Ensure service worker registration logic exists and handles updates.
    -   **Step Dependencies**: Step 1.4
    -   **User Instructions**: Test PWA installation and basic offline functionality (static asset loading). Full content caching deferred.

## Phase 11: Push Notifications

-   [ ] Step 11.1: Implement Push Subscription Backend
    -   **Task**: Create the action to save push subscriptions and install the web-push library.
    -   **Files**:
        -   `lib/auth/actions.ts`: Add `savePushSubscription(subscription: PushSubscription)` server action (`validatedActionWithUser`). Save the stringified subscription JSON to `users.push_subscription`.
        -   `package.json`: Add `web-push` dependency.
    -   **Step Dependencies**: Step 2.1
    -   **User Instructions**: Run `pnpm install web-push @types/web-push`. Ensure VAPID keys are in `.env`.

-   [ ] Step 11.2: Implement Push Notification Frontend UI
    -   **Task**: Add UI elements in settings for enabling/disabling notifications and setting the time.
    -   **Files**:
        -   `app/(dashboard)/dashboard/general/page.tsx` (or new settings page): Add a section "Notificações". Include a button "Ativar Notificações Diárias". On click: check `Notification.permission`, request if needed (`Notification.requestPermission()`), then get SW registration (`navigator.serviceWorker.ready`), subscribe (`reg.pushManager.subscribe`), and send subscription to `savePushSubscription` action. Add an input (type="time") for `notification_time` and potentially a select for `notification_tz`, linked to the `updateUserSettings` action (modify action to accept these).
    -   **Step Dependencies**: Step 11.1, Step 10.3
    -   **User Instructions**: Browser support for Push API varies. Test in compatible browsers.

-   [ ] Step 11.3: Implement Notification Sending Logic
    -   **Task**: Create the backend logic to send push notifications using `web-push`.
    -   **Files**:
        -   `lib/notifications/actions.ts` (or similar): Create file. Initialize `web-push` with VAPID keys. Create function `sendReminderNotification(subscription: PushSubscription, payload?: object)`. Use `webpush.sendNotification`. Handle errors (e.g., 410 Gone for expired subscriptions, remove from DB).
    -   **Step Dependencies**: Step 11.1
    -   **User Instructions**: None

-   [ ] Step 11.4: Implement Notification Cron Job
    -   **Task**: Create the cron job to trigger sending notifications daily based on user preferences.
    -   **Files**:
        -   `app/api/cron/send-reminders/route.ts`: Create POST route handler. Secure with `CRON_SECRET`. Logic: Query `users` who have a `push_subscription` and whose `notification_time` (adjusted for `notification_tz`) matches the current hour. Loop through users and call `sendReminderNotification` from `lib/notifications/actions.ts`.
        -   `vercel.json`: Add cron entry to run hourly (e.g., `"schedule": "0 * * * *"`).
    -   **Step Dependencies**: Step 11.3, Step 2.1
    -   **User Instructions**: Deploy to Vercel. Timezone handling can be complex; initial version might ignore timezone and send based on server time matching `notification_time`.

## Phase 12: Settings & Cleanup

-   [ ] Step 12.1: Adapt Dashboard/Settings Pages
    -   **Task**: Review and adapt the existing `/dashboard` pages to fit the Palavra Viva context (single user focus). Rename "Team" references to "Account" or "Subscription".
    -   **Files**:
        -   `app/(dashboard)/dashboard/layout.tsx`: Update nav item labels (e.g., "Team" -> "Subscription").
        -   `app/(dashboard)/dashboard/page.tsx`: Rename component/file if desired (e.g., `subscription/page.tsx`). Update content to show subscription status, link to manage subscription (customer portal). Remove team member list/invite UI or repurpose if single-user admin functions are ever needed.
        -   `app/(dashboard)/dashboard/settings.tsx`: Adapt component name/content. Remove team-related logic/UI (`InviteTeamMember`, member list removal).
        -   `app/(dashboard)/dashboard/general/page.tsx`: Ensure account info update works. Add theme/notification settings UI (partially done in Phase 10/11).
        -   `app/(dashboard)/dashboard/activity/page.tsx`: Update `formatAction` function for new `ActivityType` enums.
        -   `app/(login)/actions.ts`: Review `removeTeamMember`, `inviteTeamMember` actions - mark as deprecated or remove if unused.
    -   **Step Dependencies**: Phase 10, Phase 11
    -   **User Instructions**: Decide if `/dashboard` route group should be renamed/merged into `/app/settings` or kept separate.

-   [ ] Step 12.2: Adapt Marketing Page
    -   **Task**: Update the content of the main marketing page (`/`) to describe Palavra Viva.
    -   **Files**:
        -   `app/(dashboard)/page.tsx`: Update headings, text, features listed to match Palavra Viva's description and value proposition. Remove or update the animated terminal component (`app/(dashboard)/terminal.tsx`) if desired.
    -   **Step Dependencies**: Step 1.1
    -   **User Instructions**: None

-   [ ] Step 12.3: Adapt Pricing Page
    -   **Task**: Update the pricing page content and ensure it uses the correct Stripe Price IDs.
    -   **Files**:
        -   `app/(dashboard)/pricing/page.tsx`: Update page title, plan names ("Premium"), features listed, price display (ensure currency/locale match target audience if needed - BRL?). Ensure `checkoutAction` uses the correct Price ID(s) configured by the user. Remove multi-plan display if only one premium tier exists.
        -   `lib/payments/stripe.ts`: Review `getStripePrices` if fetching dynamically, ensure it fetches the correct prices set up by the user.
    -   **Step Dependencies**: Step 10.2
    -   **User Instructions**: User must have configured Stripe Products/Prices corresponding to the IDs used/fetched here.

## Phase 13: Testing

-   [ ] Step 13.1: Add Unit Tests
    -   **Task**: Write unit tests for key utility functions and server actions using Vitest/Jest.
    -   **Files**:
        -   `lib/content/actions.test.ts`: Test `generateDailyContent` (mock APIs, DB).
        -   `lib/reading-plans/actions.test.ts`: Test `updateReadingProgress`.
        -   `lib/auth/helpers.test.ts`: Test `isUserPremium`.
        -   (Add other test files as needed for critical logic)
    -   **Step Dependencies**: Corresponding feature implementation steps.
    -   **User Instructions**: Run `pnpm test` (configure test script in `package.json` if needed, install testing libraries like `vitest`, `@vitest/ui`, `msw`).

-   [ ] Step 13.2: Add E2E Tests
    -   **Task**: Write end-to-end tests for major user flows using Playwright.
    -   **Files**:
        -   `e2e/auth.spec.ts`: Test signup, signin, signout.
        -   `e2e/daily-content.spec.ts`: Test viewing content, playing audio (free/premium after trial).
        -   `e2e/reading-plans.spec.ts`: Test viewing plans, starting plan, marking day complete.
        -   `e2e/prayers.spec.ts`: Test adding/deleting personal prayers.
        -   `e2e/payments.spec.ts`: Test navigating to pricing, starting checkout (mock Stripe interaction if possible), verifying premium access.
        -   (Add other spec files as needed)
    -   **Step Dependencies**: Corresponding feature implementation steps.
    -   **User Instructions**: Install Playwright (`pnpm dlx playwright install`). Run `pnpm test:e2e` (configure script in `package.json`). Ensure base URL and test user credentials are configured for Playwright.

# Summary

This plan breaks down the "Palavra Viva" application development into logical phases and steps, starting from basic setup and database configuration, moving through core feature implementation (daily content, prayers, reading plans, sharing, pairing), integrating authentication and monetization, and finally adding push notifications and testing.

Key considerations:
*   **Dependencies**: Steps are ordered to handle dependencies (DB schema -> actions -> UI).
*   **Atomicity**: Each step focuses on a specific, manageable task, suitable for iterative AI code generation.
*   **User Instructions**: Explicit instructions are included for tasks requiring manual intervention (API keys, DB commands, external service setup, library installation).
*   **Bible Source**: The plan uses a mock Bible text source; the user needs to implement a real solution.
*   **AdMob/PWA**: AdMob integration and full PWA offline caching are complex and represented by initial setup/placeholder steps, requiring further development or user implementation based on specific library choices.
*   **Error Handling**: While mentioned, the AI implementing each step should be reminded to include robust error handling (try/catch, user feedback) as per the project rules and good practice.
*   **Testing**: Testing steps are included, but thorough testing should be ongoing throughout development.

This plan provides a structured roadmap for building the Palavra Viva application using the provided starter template and adhering to the technical specification.</implementation_plan>

<existing_code>


</existing_code>

Your task is to:
1. Identify the next incomplete step from the implementation plan (marked with `- [ ]`)
2. Generate the necessary code for all files specified in that step
3. Return the generated code

The implementation plan is just a suggestion meant to provide a high-level overview of the objective. Use it to guide you, but you do not have to adhere to it strictly. Make sure to follow the given rules as you work along the lines of the plan.

For EVERY file you modify or create, you MUST provide the COMPLETE file contents in the format above.

Each file should be wrapped in a code block with its file path above it and a "Here's what I did and why":

Here's what I did and why: [text here...]
Filepath: src/components/Example.tsx
```
/**
 * @description 
 * This component handles [specific functionality].
 * It is responsible for [specific responsibilities].
 * 
 * Key features:
 * - Feature 1: Description
 * - Feature 2: Description
 * 
 * @dependencies
 * - DependencyA: Used for X
 * - DependencyB: Used for Y
 * 
 * @notes
 * - Important implementation detail 1
 * - Important implementation detail 2
 */

BEGIN WRITING FILE CODE
// Complete implementation with extensive inline comments & documentation...
```

Documentation requirements:
- File-level documentation explaining the purpose and scope
- Component/function-level documentation detailing inputs, outputs, and behavior
- Inline comments explaining complex logic or business rules
- Type documentation for all interfaces and types
- Notes about edge cases and error handling
- Any assumptions or limitations

Guidelines:
- Implement exactly one step at a time
- Ensure all code follows the project rules and technical specification
- Include ALL necessary imports and dependencies
- Write clean, well-documented code with appropriate error handling
- Always provide COMPLETE file contents - never use ellipsis (...) or placeholder comments
- Never skip any sections of any file - provide the entire file every time
- Handle edge cases and add input validation where appropriate
- Follow TypeScript best practices and ensure type safety
- Include necessary tests as specified in the testing strategy

Begin by identifying the next incomplete step from the plan, then generate the required code (with complete file contents and documentation).

Above each file, include a "Here's what I did and why" explanation of what you did for that file.

Then end with "STEP X COMPLETE. Here's what I did and why:" followed by an explanation of what you did and then a "USER INSTRUCTIONS: Please do the following:" followed by manual instructions for the user for things you can't do like installing libraries, updating configurations on services, etc.

You also have permission to update the implementation plan if needed. If you update the implementation plan, include each modified step in full and return them as markdown code blocks at the end of the user instructions. No need to mark the current step as complete - that is implied.