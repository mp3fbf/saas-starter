import fs from 'fs/promises'; // Node.js module for file system operations (async version)
import path from 'path'; // Node.js module for working with file paths
import { fileURLToPath } from 'url'; // Import necessary function
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { serial, text, varchar, integer, timestamp, pgTable, uniqueIndex } from 'drizzle-orm/pg-core';
import dotenv from 'dotenv';

// --- Helper to get current directory in ES Modules ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') }); // Now __dirname is correctly defined

// --- Drizzle Schema Definition ---
// Define tables matching the SQL migration we applied

const books = pgTable('books', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  abbreviation: varchar('abbreviation', { length: 10 }).notNull(),
  testament: varchar('testament', { length: 2 }).notNull(), // Assuming 'VT' or 'NT'
  version: varchar('version', { length: 10 }).notNull(), // e.g., 'nvi'
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => {
  return {
    abbreviationVersionUnq: uniqueIndex('books_abbreviation_version_unique_idx').on(table.abbreviation, table.version), // Matches UNIQUE constraint
  };
});

const chapters = pgTable('chapters', {
  id: serial('id').primaryKey(),
  bookId: integer('book_id').notNull().references(() => books.id, { onDelete: 'cascade' }),
  chapterNumber: integer('chapter_number').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => {
    return {
      bookChapterUnq: uniqueIndex('chapters_book_id_chapter_number_unique_idx').on(table.bookId, table.chapterNumber), // Matches UNIQUE constraint
    };
});

const verses = pgTable('verses', {
  id: serial('id').primaryKey(),
  chapterId: integer('chapter_id').notNull().references(() => chapters.id, { onDelete: 'cascade' }),
  verseNumber: integer('verse_number').notNull(),
  text: text('text').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => {
    return {
      chapterVerseUnq: uniqueIndex('verses_chapter_id_verse_number_unique_idx').on(table.chapterId, table.verseNumber), // Matches UNIQUE constraint
    };
});


// --- Database Connection ---

// Check if the database URL is set
if (!process.env.POSTGRES_URL) {
  throw new Error('POSTGRES_URL environment variable is not set.');
}

// Configure the PostgreSQL client
const sql = postgres(process.env.POSTGRES_URL, { max: 1 }); // max: 1 is recommended for migrations/scripts

// Initialize Drizzle ORM
const db = drizzle(sql);

// --- Data Structure from JSON ---
// Define the structure of the data we expect from the JSON file
interface BibleBook {
  abbrev: string;
  name: string;
  chapters: string[][]; // Array of chapters, each chapter is an array of verse strings
}

// --- Main Import Function ---
async function importBibleData() {
  console.log('Starting Bible data import...');

  const bibleVersion = 'nvi'; // Define the version being imported (e.g., 'nvi')
  const jsonFilePath = path.resolve(__dirname, '../data/pt_nvi.json'); // Now __dirname is correctly defined

  try {
    // 1. Read the JSON file
    console.log(`Reading JSON file from: ${jsonFilePath}`);
    let jsonData = await fs.readFile(jsonFilePath, 'utf-8');
    console.log('Successfully read file content.');

    // Clean the JSON string (remove BOM and trim whitespace)
    if (jsonData.charCodeAt(0) === 0xFEFF) { // Check for BOM (Byte Order Mark)
        console.log('BOM detected, removing it.');
        jsonData = jsonData.slice(1);
    }
    jsonData = jsonData.trim(); // Remove leading/trailing whitespace

    // Now parse the cleaned JSON data
    const bibleData: BibleBook[] = JSON.parse(jsonData);
    console.log(`Successfully parsed JSON. Found ${bibleData.length} books.`);

    // 2. Iterate and Insert Data (using Drizzle)
    console.log('Starting database insertion...');

    for (const bookData of bibleData) {
      // Determine Testament (simple heuristic - needs refinement if using other versions/books)
      // This is a basic guess, might need a more robust mapping
      const testament = bookData.abbrev === 'gn' || bookData.abbrev === 'ex' || bookData.abbrev === 'lv' || bookData.abbrev === 'nm' || bookData.abbrev === 'dt' || bookData.abbrev === 'js' || bookData.abbrev === 'jz' || bookData.abbrev === 'rt' || bookData.abbrev === '1sm' || bookData.abbrev === '2sm' || bookData.abbrev === '1rs' || bookData.abbrev === '2rs' || bookData.abbrev === '1cr' || bookData.abbrev === '2cr' || bookData.abbrev === 'ed' || bookData.abbrev === 'ne' || bookData.abbrev === 'et' || bookData.abbrev === 'job' || bookData.abbrev === 'sl' || bookData.abbrev === 'pv' || bookData.abbrev === 'ec' || bookData.abbrev === 'ct' || bookData.abbrev === 'is' || bookData.abbrev === 'jr' || bookData.abbrev === 'lm' || bookData.abbrev === 'ez' || bookData.abbrev === 'dn' || bookData.abbrev === 'os' || bookData.abbrev === 'jl' || bookData.abbrev === 'am' || bookData.abbrev === 'ob' || bookData.abbrev === 'jn' || bookData.abbrev === 'mq' || bookData.abbrev === 'na' || bookData.abbrev === 'hc' || bookData.abbrev === 'sf' || bookData.abbrev === 'ag' || bookData.abbrev === 'zc' || bookData.abbrev === 'ml' ? 'VT' : 'NT';

      console.log(`Processing Book: ${bookData.name} (${bookData.abbrev}) - ${testament}`);

      // Insert Book and get its ID
      const insertedBook = await db.insert(books).values({
        name: bookData.name,
        abbreviation: bookData.abbrev,
        testament: testament,
        version: bibleVersion,
      }).returning({ bookId: books.id });

      const bookId = insertedBook[0].bookId;

      // Iterate through chapters
      for (let i = 0; i < bookData.chapters.length; i++) {
        const chapterNumber = i + 1; // Chapter numbers are 1-based
        const chapterVerses = bookData.chapters[i];

        // Insert Chapter and get its ID
        const insertedChapter = await db.insert(chapters).values({
          bookId: bookId,
          chapterNumber: chapterNumber,
        }).returning({ chapterId: chapters.id });

        const chapterId = insertedChapter[0].chapterId;

        // Iterate through verses
        for (let j = 0; j < chapterVerses.length; j++) {
          const verseNumber = j + 1; // Verse numbers are 1-based
          const verseText = chapterVerses[j];

          // Insert Verse
          await db.insert(verses).values({
            chapterId: chapterId,
            verseNumber: verseNumber,
            text: verseText,
          });
        }
        console.log(`  - Imported Chapter ${chapterNumber} (${chapterVerses.length} verses)`);
      }
    }

    console.log('Bible data import completed successfully!');

  } catch (error) {
    console.error('Error during Bible data import:', error);
    // Consider adding more specific error handling if needed
  } finally {
    // Important: Close the database connection when done
    await sql.end();
    console.log('Database connection closed.');
  }
}

// --- Execute the Import ---
importBibleData(); 