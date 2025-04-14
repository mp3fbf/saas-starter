/**
 * @description
 * Database seed script for the Palavra Viva application.
 * Populates the database with initial data for:
 * - A default test user and their associated account/team record.
 * - Sample Bible reading plans and their daily content.
 * - Stripe products and prices (if running locally for testing).
 *
 * @dependencies
 * - @/lib/payments/stripe (stripe): Stripe client for product creation.
 * - @/lib/db/drizzle (db): Drizzle database instance.
 * - @/lib/db/schema: Database table schemas (users, teams, teamMembers, reading_plans, reading_plan_days).
 * - @/lib/auth/session (hashPassword): For hashing the test user's password.
 *
 * @usage
 * Run using `pnpm db:seed`. Requires database connection URL and Stripe keys in `.env`.
 *
 * @notes
 * - This script will fail if the database schema doesn't match (run migrations first).
 * - Stripe product creation might fail if products/prices with the same names already exist.
 * - Ensure verse text in `samplePlanDays` matches the intended meaning and is reasonably short.
 */
import { stripe } from '../payments/stripe';
import { db } from './drizzle';
import { eq } from 'drizzle-orm';
import {
  users,
  teams,
  teamMembers,
  reading_plans, // Import reading plan schema
  reading_plan_days, // Import reading plan days schema
  NewReadingPlan, // Import type for new reading plan
  NewReadingPlanDay, // Import type for new reading plan day
} from './schema';
import { hashPassword } from '@/lib/auth/session';

// --- Sample Reading Plan Data ---

const samplePlans: Omit<NewReadingPlan, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    title: 'Fundamentos da Fé',
    description: 'Explore os pilares essenciais da fé cristã em 7 dias.',
    duration_days: 7,
    theme: 'Fé',
    is_premium: false,
  },
  {
    title: 'Perdão e Graça',
    description: 'Uma jornada de 7 dias sobre o poder transformador do perdão.',
    duration_days: 7,
    theme: 'Perdão',
    is_premium: false,
  },
  {
    title: 'Paz em Meio à Tempestade',
    description:
      'Encontre a paz de Deus que excede todo entendimento em 5 dias.',
    duration_days: 5,
    theme: 'Paz',
    is_premium: false,
  },
];

// Sample daily readings (Plan Title is used to link days to plans during seeding)
const samplePlanDays: (Omit<
  NewReadingPlanDay,
  'id' | 'planId' | 'createdAt' | 'updatedAt'
> & { planTitle: string })[] = [
  // Fundamentos da Fé
  {
    planTitle: 'Fundamentos da Fé',
    dayNumber: 1,
    verseRef: 'Hebreus 11:1',
    verseText:
      'Ora, a fé é a certeza daquilo que esperamos e a prova das coisas que não vemos.',
    content: 'Reflita sobre a definição bíblica de fé.',
  },
  {
    planTitle: 'Fundamentos da Fé',
    dayNumber: 2,
    verseRef: 'Romanos 10:17',
    verseText:
      'Consequentemente, a fé vem por se ouvir a mensagem, e a mensagem é ouvida mediante a palavra de Cristo.',
    content: 'Como a Palavra de Deus fortalece nossa fé?',
  },
  {
    planTitle: 'Fundamentos da Fé',
    dayNumber: 3,
    verseRef: 'Efésios 2:8',
    verseText:
      'Pois vocês são salvos pela graça, por meio da fé, e isto não vem de vocês, é dom de Deus;',
    content: 'Entenda a relação entre graça, fé e salvação.',
  },
  {
    planTitle: 'Fundamentos da Fé',
    dayNumber: 4,
    verseRef: 'Tiago 2:17',
    verseText: 'Assim também a fé, por si só, se não for acompanhada de obras, está morta.',
    content: 'A fé genuína se manifesta em ações.',
  },
  {
    planTitle: 'Fundamentos da Fé',
    dayNumber: 5,
    verseRef: '1 Pedro 1:7',
    verseText:
      'Assim, a fé que vocês têm, muito mais valiosa do que o ouro que perece, mesmo que refinado pelo fogo, provará que é genuína e resultará em louvor, glória e honra, quando Jesus Cristo for revelado.',
    content: 'As provações podem refinar e comprovar nossa fé.',
  },
  {
    planTitle: 'Fundamentos da Fé',
    dayNumber: 6,
    verseRef: 'Gálatas 5:22',
    verseText: 'Mas o fruto do Espírito é amor, alegria, paz, paciência, amabilidade, bondade, fidelidade,',
    content: 'A fidelidade (fé) como fruto do Espírito Santo.',
  },
  {
    planTitle: 'Fundamentos da Fé',
    dayNumber: 7,
    verseRef: 'Marcos 11:24',
    verseText:
      'Portanto, eu lhes digo: tudo o que vocês pedirem em oração, creiam que já o receberam, e assim lhes sucederá.',
    content: 'A importância da fé na oração.',
  },
  // Perdão e Graça
  {
    planTitle: 'Perdão e Graça',
    dayNumber: 1,
    verseRef: 'Efésios 4:32',
    verseText:
      'Sejam bondosos e compassivos uns para com os outros, perdoando-se mutuamente, assim como Deus os perdoou em Cristo.',
    content: 'O chamado para perdoar como fomos perdoados.',
  },
  {
    planTitle: 'Perdão e Graça',
    dayNumber: 2,
    verseRef: 'Colossenses 3:13',
    verseText:
      'Suportem-se uns aos outros e perdoem as queixas que tiverem uns contra os outros. Perdoem como o Senhor lhes perdoou.',
    content: 'A prática do perdão na comunidade cristã.',
  },
  {
    planTitle: 'Perdão e Graça',
    dayNumber: 3,
    verseRef: 'Mateus 6:14',
    verseText:
      'Pois, se perdoarem as ofensas uns dos outros, o Pai celestial também lhes perdoará.',
    content: 'A conexão entre perdoar os outros e receber o perdão de Deus.',
  },
  {
    planTitle: 'Perdão e Graça',
    dayNumber: 4,
    verseRef: '1 João 1:9',
    verseText:
      'Se confessarmos os nossos pecados, ele é fiel e justo para perdoar os nossos pecados e nos purificar de toda injustiça.',
    content: 'A promessa do perdão divino mediante a confissão.',
  },
  {
    planTitle: 'Perdão e Graça',
    dayNumber: 5,
    verseRef: 'Lucas 6:37',
    verseText:
      'Não julguem, e vocês não serão julgados. Não condenem, e não serão condenados. Perdoem, e serão perdoados.',
    content: 'A instrução de Jesus sobre perdão e julgamento.',
  },
  {
    planTitle: 'Perdão e Graça',
    dayNumber: 6,
    verseRef: 'Salmos 103:12',
    verseText:
      'Como um pai tem compaixão de seus filhos, assim o Senhor tem compaixão dos que o temem; pois ele sabe do que somos formados; lembra-se de que somos pó.', // Salmos 103:13-14, adjusted ref for simplicity
    content: 'A extensão do perdão de Deus.',
  },
  {
    planTitle: 'Perdão e Graça',
    dayNumber: 7,
    verseRef: 'Romanos 5:8',
    verseText:
      'Mas Deus demonstra seu amor por nós: Cristo morreu em nosso favor quando ainda éramos pecadores.',
    content: 'A maior demonstração da graça e do perdão de Deus.',
  },
  // Paz em Meio à Tempestade
  {
    planTitle: 'Paz em Meio à Tempestade',
    dayNumber: 1,
    verseRef: 'Filipenses 4:6-7',
    verseText:
      'Não andem ansiosos por coisa alguma, mas em tudo, pela oração e súplicas, e com ação de graças, apresentem seus pedidos a Deus. E a paz de Deus, que excede todo o entendimento, guardará os seus corações e as suas mentes em Cristo Jesus.',
    content: 'Encontre a paz através da oração e da gratidão.',
  },
  {
    planTitle: 'Paz em Meio à Tempestade',
    dayNumber: 2,
    verseRef: 'João 14:27',
    verseText:
      'Deixo-lhes a paz; a minha paz lhes dou. Não a dou como o mundo a dá. Não se perturbem os seus corações, nem tenham medo.',
    content: 'Receba a paz que só Jesus pode dar.',
  },
  {
    planTitle: 'Paz em Meio à Tempestade',
    dayNumber: 3,
    verseRef: 'Isaías 26:3',
    verseText:
      'Tu guardarás em perfeita paz aquele cujo propósito está firme, porque em ti confia.',
    content: 'A paz que vem da confiança firme em Deus.',
  },
  {
    planTitle: 'Paz em Meio à Tempestade',
    dayNumber: 4,
    verseRef: 'Salmos 4:8',
    verseText: 'Em paz me deito e logo adormeço, pois só tu, Senhor, me fazes viver em segurança.',
    content: 'Descanse seguro na paz do Senhor.',
  },
  {
    planTitle: 'Paz em Meio à Tempestade',
    dayNumber: 5,
    verseRef: 'Romanos 15:13',
    verseText:
      'Que o Deus da esperança os encha de toda alegria e paz, por sua confiança nele, para que vocês transbordem de esperança, pelo poder do Espírito Santo.',
    content: 'Alegria e paz que vêm através do Espírito Santo.',
  },
];

// --- Function to Seed Reading Plans ---

async function seedReadingPlans() {
  console.log('Seeding reading plans...');

  for (const planData of samplePlans) {
    try {
      // Insert the plan
      const [insertedPlan] = await db
        .insert(reading_plans)
        .values(planData)
        .returning({ planId: reading_plans.id, title: reading_plans.title });

      console.log(`  Inserted Plan: ${insertedPlan.title} (ID: ${insertedPlan.planId})`);

      // Find and prepare the days for this plan
      const daysForThisPlan = samplePlanDays
        .filter((day) => day.planTitle === insertedPlan.title)
        .map((day) => ({
          planId: insertedPlan.planId,
          dayNumber: day.dayNumber,
          verseRef: day.verseRef,
          verseText: day.verseText,
          content: day.content,
        }));

      if (daysForThisPlan.length > 0) {
        // Insert the days for this plan
        await db.insert(reading_plan_days).values(daysForThisPlan);
        console.log(`    -> Inserted ${daysForThisPlan.length} days for plan ${insertedPlan.title}`);
      } else {
        console.warn(`    -> No days found for plan ${insertedPlan.title} in sample data.`);
      }
    } catch (error) {
      console.error(`Error seeding plan "${planData.title}":`, error);
      // Decide whether to continue or stop on error
    }
  }

  console.log('Reading plan seeding finished.');
}

// --- Function to Create Stripe Products (Keep from template for testing) ---

async function createStripeProducts() {
  console.log('Creating Stripe products and prices...');

  // Check if products already exist to avoid errors during re-seeding
  const existingProducts = await stripe.products.list({ limit: 10 }); // Adjust limit as needed
  const baseExists = existingProducts.data.some((p) => p.name === 'Base');
  const plusExists = existingProducts.data.some((p) => p.name === 'Plus');

  if (!baseExists) {
    const baseProduct = await stripe.products.create({
      name: 'Base',
      description: 'Base subscription plan',
    });

    await stripe.prices.create({
      product: baseProduct.id,
      unit_amount: 800, // $8 in cents
      currency: 'usd',
      recurring: {
        interval: 'month',
        trial_period_days: 7, // Keep 7-day trial as per Palavra Viva spec
      },
    });
    console.log('  Created Base product and price.');
  } else {
    console.log('  Base product already exists, skipping creation.');
  }

  if (!plusExists) {
    const plusProduct = await stripe.products.create({
      name: 'Plus',
      description: 'Plus subscription plan',
    });

    await stripe.prices.create({
      product: plusProduct.id,
      unit_amount: 1200, // $12 in cents
      currency: 'usd',
      recurring: {
        interval: 'month',
        trial_period_days: 7, // Keep 7-day trial as per Palavra Viva spec
      },
    });
    console.log('  Created Plus product and price.');
  } else {
    console.log('  Plus product already exists, skipping creation.');
  }

  console.log('Stripe product and price check/creation complete.');
}

// --- Main Seed Function ---

async function seed() {
  const email = process.env.SEED_EMAIL || 'test@test.com'; // Allow overriding via env
  const password = process.env.SEED_PASSWORD || 'admin123';
  console.log(`Attempting to seed user: ${email}`);
  const passwordHash = await hashPassword(password);

  // Check if user already exists
  const existingUser = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  let seededUser: { id: number };
  let seededTeam: { id: number };

  if (existingUser.length > 0) {
    console.log('Test user already exists.');
    seededUser = existingUser[0];
    // Find existing team for this user
    const existingTeam = await db
      .select({ id: teams.id })
      .from(teams)
      .where(eq(teams.userId, seededUser.id))
      .limit(1);
    if (existingTeam.length > 0) {
      seededTeam = existingTeam[0];
      console.log(`Found existing team (ID: ${seededTeam.id}) for user.`);
    } else {
      // Should not happen if signup logic is correct, but handle defensively
      console.error(
        `Error: User ${email} exists but has no associated team record.`,
      );
      return; // Stop seeding if inconsistent state
    }
  } else {
    // Create user
    [seededUser] = await db
      .insert(users)
      .values([
        {
          email: email,
          passwordHash: passwordHash,
          role: 'owner', // Make seed user owner by default
          name: 'Test User', // Add a name
          trial_end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Set trial for seeded user
        },
      ])
      .returning({ id: users.id });
    console.log('Initial user created.');

    // Create associated team/account record
    [seededTeam] = await db
      .insert(teams)
      .values({
        name: `${email}'s Account`,
        userId: seededUser.id, // Link team to user
        planName: 'free', // Start as free/trialing
        subscriptionStatus: 'trialing', // Set initial status
      })
      .returning({ id: teams.id });
    console.log('Associated team/account record created.');

    // Create team member link
    await db.insert(teamMembers).values({
      teamId: seededTeam.id,
      userId: seededUser.id,
      role: 'owner',
    });
    console.log('Team member link created.');
  }

  // Seed Reading Plans (New)
  await seedReadingPlans();

  // Create Stripe Products (Keep from template)
  try {
    await createStripeProducts();
  } catch (error) {
    console.error(
      'Error creating Stripe products (might already exist):',
      error,
    );
    // Continue seeding even if Stripe products fail (e.g., if already seeded)
  }
}

// --- Run Seed ---

seed()
  .catch((error) => {
    console.error('Seed process failed:', error);
    process.exit(1);
  })
  .finally(() => {
    console.log('Seed process finished. Exiting...');
    process.exit(0);
  });