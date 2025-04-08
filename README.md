# Palavra Viva - Devocional Cristão

“Palavra Viva” é um app devocional cristão voltado ao público evangélico brasileiro. Ele entrega uma experiência diária simples e inspiradora com versículos bíblicos, reflexões curtas, conteúdo em áudio e interações espirituais leves. O app é projetado para ser autoescalável, com conteúdo gerado via IA e manutenção mínima. A monetização será feita através de anúncios e plano premium com período de teste gratuito.

This project uses a starter template for building a SaaS application using **Next.js** with support for authentication, Stripe integration for payments, and a dashboard for logged-in users.

## Features (Based on Template - Will be adapted for Palavra Viva)

- Marketing landing page (`/`)
- Pricing page (`/pricing`) connecting to Stripe Checkout
- Dashboard pages for user settings (General, Activity, Security)
- Subscription management with Stripe Customer Portal
- Email/password authentication with JWTs stored to cookies
- Global middleware to protect logged-in routes
- Local middleware to protect Server Actions or validate Zod schemas
- Activity logging system

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Database**: [Postgres](https://www.postgresql.org/)
- **ORM**: [Drizzle](https://orm.drizzle.team/)
- **Payments**: [Stripe](https://stripe.com/)
- **UI Library**: [shadcn/ui](https://ui.shadcn.com/)
- **Content Generation**: OpenAI API, ElevenLabs API (Planned)
- **Ads**: AdMob (Planned)

## Getting Started

```bash
# Clone the repository (or use the code provided by the AI)
# cd palavra-viva # Or your project directory
pnpm install

Running Locally
Use the included setup script to create your .env file (or manually create one based on .env.example):

pnpm db:setup

Then, run the database migrations and seed the database with initial data (this seed script might be adapted for Palavra Viva):

pnpm db:migrate
pnpm db:seed

This template's seed script creates the following user and team:

User: test@test.com
Password: admin123
You can, of course, create new users as well through /sign-up.

Finally, run the Next.js development server:

pnpm dev

Open http://localhost:3000 in your browser to see the app in action.

Optionally, you can listen for Stripe webhooks locally through their CLI to handle subscription change events:

stripe listen --forward-to localhost:3000/api/stripe/webhook

Testing Payments
To test Stripe payments, use the following test card details:

Card Number: 4242 4242 4242 4242
Expiration: Any future date
CVC: Any 3-digit number
Going to Production
When you're ready to deploy your SaaS application to production, follow these steps:

Set up a production Stripe webhook
Go to the Stripe Dashboard and create a new webhook for your production environment.
Set the endpoint URL to your production API route (e.g., https://yourdomain.com/api/stripe/webhook).
Select the events you want to listen for (e.g., checkout.session.completed, customer.subscription.updated, customer.subscription.deleted).
Deploy to Vercel
Push your code to a Git repository (GitHub, GitLab, Bitbucket).
Connect your repository to Vercel and deploy it.
Follow the Vercel deployment process, which will guide you through setting up your project.
Add environment variables
In your Vercel project settings (or during deployment), add all the necessary environment variables defined in .env.example. Make sure to update the values for the production environment, including:

BASE_URL: Set this to your production domain.
STRIPE_SECRET_KEY: Use your Stripe secret key for the production environment.
STRIPE_WEBHOOK_SECRET: Use the webhook secret from the production webhook you created in step 1.
POSTGRES_URL: Set this to your production database URL.
AUTH_SECRET: Set this to a secure random string (e.g., openssl rand -hex 32).
OPENAI_API_KEY, ELEVENLABS_API_KEY: Add production keys.
VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY: Add production VAPID keys for push notifications.
CRON_SECRET: Add the secret used to secure cron job endpoints.