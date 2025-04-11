/**
 * @description
 * Script to import Bible data from a JSON file into the Postgres database
 * using Drizzle ORM. It reads the JSON, iterates through books, chapters,
 * and verses, and inserts them into the corresponding tables defined in the
 * main application schema.
 *
 * @dependencies
 * - fs/promises: For reading the JSON file asynchronously.
 * - path: For resolving file paths.
 * - url (fileURLToPath): To get the current directory path in ES Modules.
 * - drizzle-orm/postgres-js: Drizzle Postgres driver.
 * - postgres: Node.js Postgres client.
 * - @/lib/db/drizzle (db): Drizzle database instance.
 * - @/lib/db/schema (books, chapters, verses): Drizzle table schemas imported
 *   from the main schema file.
 * - dotenv: To load environment variables (like POSTGRES_URL).
 *
 * @usage
 * Run this script from the project root using: `npx tsx scripts/import-bible.ts`
 * Ensure the database tables (`books`, `chapters`, `verses`) exist (run migrations first)
 * and the `POSTGRES_URL` environment variable is set in `.env`.
 * Also ensure the `data/pt_nvi.json` file exists.
 *
 * @notes
 * - This script assumes the JSON structure provided in `data/pt_nvi.json`.
 * - It uses the 'nvi' version identifier when inserting book data.
 * - Includes basic logging and error handling.
 */
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
// Import table schemas from the main schema file
import { books, chapters, verses } from '@/lib/db/schema';
import dotenv from 'dotenv';

// --- Helper to get current directory in ES Modules ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file located in the parent directory
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// --- Database Connection ---
if (!process.env.POSTGRES_URL) {
  throw new Error('POSTGRES_URL environment variable is not set.');
}
const sql = postgres(process.env.POSTGRES_URL, { max: 1 });
const db = drizzle(sql);

// --- Data Structure from JSON ---
interface BibleBook {
  abbrev: string;
  name: string;
  chapters: string[][]; // Array of chapters, each chapter is an array of verse strings
}

// --- Main Import Function ---
async function importBibleData() {
  console.log('Starting Bible data import...');

  const bibleVersion = 'nvi'; // Define the version being imported
  const jsonFilePath = path.resolve(__dirname, '../data/pt_nvi.json');

  try {
    // 1. Read the JSON file
    console.log(`Reading JSON file from: ${jsonFilePath}`);
    let jsonData = await fs.readFile(jsonFilePath, 'utf-8');
    console.log('Successfully read file content.');

    // Clean the JSON string (remove BOM and trim whitespace)
    if (jsonData.charCodeAt(0) === 0xfeff) {
      // Check for BOM (Byte Order Mark)
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
      // Determine Testament (simple heuristic)
      const testament =
        bookData.abbrev === 'gn' ||
        bookData.abbrev === 'ex' ||
        bookData.abbrev === 'lv' ||
        bookData.abbrev === 'nm' ||
        bookData.abbrev === 'dt' ||
        bookData.abbrev === 'js' ||
        bookData.abbrev === 'jz' ||
        bookData.abbrev === 'rt' ||
        bookData.abbrev === '1sm' ||
        bookData.abbrev === '2sm' ||
        bookData.abbrev === '1rs' ||
        bookData.abbrev === '2rs' ||
        bookData.abbrev === '1cr' ||
        bookData.abbrev === '2cr' ||
        bookData.abbrev === 'ed' ||
        bookData.abbrev === 'ne' ||
        bookData.abbrev === 'et' ||
        bookData.abbrev === 'job' ||
        bookData.abbrev === 'sl' ||
        bookData.abbrev === 'pv' ||
        bookData.abbrev === 'ec' ||
        bookData.abbrev === 'ct' ||
        bookData.abbrev === 'is' ||
        bookData.abbrev === 'jr' ||
        bookData.abbrev === 'lm' ||
        bookData.abbrev === 'ez' ||
        bookData.abbrev === 'dn' ||
        bookData.abbrev === 'os' ||
        bookData.abbrev === 'jl' ||
        bookData.abbrev === 'am' ||
        bookData.abbrev === 'ob' ||
        bookData.abbrev === 'jn' ||
        bookData.abbrev === 'mq' ||
        bookData.abbrev === 'na' ||
        bookData.abbrev === 'hc' ||
        bookData.abbrev === 'sf' ||
        bookData.abbrev === 'ag' ||
        bookData.abbrev === 'zc' ||
        bookData.abbrev === 'ml'
          ? 'VT'
          : 'NT';

      console.log(
        `Processing Book: ${bookData.name} (${bookData.abbrev}) - ${testament}`,
      );

      // Insert Book and get its ID
      // Using the imported 'books' schema object
      const insertedBook = await db
        .insert(books)
        .values({
          name: bookData.name,
          abbreviation: bookData.abbrev,
          testament: testament,
          version: bibleVersion,
        })
        .returning({ bookId: books.id });

      const bookId = insertedBook[0].bookId;

      // Iterate through chapters
      for (let i = 0; i < bookData.chapters.length; i++) {
        const chapterNumber = i + 1; // Chapter numbers are 1-based
        const chapterVerses = bookData.chapters[i];

        // Insert Chapter and get its ID
        // Using the imported 'chapters' schema object
        const insertedChapter = await db
          .insert(chapters)
          .values({
            bookId: bookId,
            chapterNumber: chapterNumber,
          })
          .returning({ chapterId: chapters.id });

        const chapterId = insertedChapter[0].chapterId;

        // Iterate through verses
        for (let j = 0; j < chapterVerses.length; j++) {
          const verseNumber = j + 1; // Verse numbers are 1-based
          const verseText = chapterVerses[j];

          // Insert Verse
          // Using the imported 'verses' schema object
          await db.insert(verses).values({
            chapterId: chapterId,
            verseNumber: verseNumber,
            text: verseText,
          });
        }
        console.log(
          `  - Imported Chapter ${chapterNumber} (${chapterVerses.length} verses)`,
        );
      }
    }

    console.log('Bible data import completed successfully!');
  } catch (error) {
    console.error('Error during Bible data import:', error);
  } finally {
    await sql.end();
    console.log('Database connection closed.');
  }
}

// --- Execute the Import ---
importBibleData();