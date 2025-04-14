/**
 * @description
 * This module provides functionality for retrieving Bible verse text by querying
 * the application's database. It assumes the database has been populated with
 * Bible data (e.g., using the `scripts/import-bible.ts` script).
 *
 * Key functions:
 * - getVerseText: Fetches the text for a given Bible verse reference from the database.
 *
 * @dependencies
 * - @/lib/db/drizzle (db): Drizzle database instance.
 * - drizzle-orm (eq, and): Drizzle query operators.
 * - @/lib/db/schema (books, chapters, verses): Database table schemas.
 *
 * @notes
 * - This implementation queries the `books`, `chapters`, and `verses` tables.
 * - It currently assumes the Bible version 'nvi' (matching the initial data source).
 *   This could be parameterized if multiple versions are supported later.
 * - The `verseRef` parsing assumes a format like "gn 1:1", "jo 3:16", "1co 13:4".
 *   More robust parsing might be needed for other formats (e.g., "1 Coríntios 13:4").
 */
import { db } from '@/lib/db/drizzle';
import { eq, and } from 'drizzle-orm';
import { books, chapters, verses } from '@/lib/db/schema'; // Imports from the main schema file

/**
 * @description Parses a Bible verse reference string into its components.
 * @param {string} verseRef - The reference string (e.g., "gn 1:1", "jo 3:16", "1co 13:4").
 * @returns {{ bookAbbrev: string; chapterNum: number; verseNum: number } | null} An object with parsed components or null if parsing fails.
 */
function parseVerseRef(
  verseRef: string,
): { bookAbbrev: string; chapterNum: number; verseNum: number } | null {
  if (!verseRef) return null;

  const normalizedRef = verseRef.trim().toLowerCase();
  // Handle book names that might contain numbers (e.g., "1co", "2sm")
  // Find the last space before the chapter:verse part
  const match = normalizedRef.match(/^(.*)\s+(\d+):(\d+)$/);

  if (!match) {
    console.error(`Invalid verseRef format: ${verseRef}`);
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, bookAbbrev, chapterStr, verseStr] = match;

  // const lastSpaceIndex = normalizedRef.lastIndexOf(' ');

  // if (lastSpaceIndex === -1 || lastSpaceIndex === normalizedRef.length - 1) {
  //   console.error(`Invalid verseRef format (no space): ${verseRef}`);
  //   return null;
  // }

  // const bookAbbrev = normalizedRef.substring(0, lastSpaceIndex);
  // const chapterVersePart = normalizedRef.substring(lastSpaceIndex + 1);

  // const parts = chapterVersePart.split(':');
  // if (parts.length !== 2) {
  //   console.error(`Invalid verseRef format (no colon): ${verseRef}`);
  //   return null;
  // }

  const chapterNum = parseInt(chapterStr, 10);
  const verseNum = parseInt(verseStr, 10);

  if (isNaN(chapterNum) || isNaN(verseNum) || chapterNum < 1 || verseNum < 1) {
    console.error(`Invalid chapter/verse number in ref: ${verseRef}`);
    return null;
  }

  // Return the parsed book abbreviation (which might include numbers like '1co')
  return { bookAbbrev: bookAbbrev.trim(), chapterNum, verseNum };
}

/**
 * @description Retrieves the text content for a given Bible verse reference
 * by querying the database.
 *
 * @param {string} verseRef - The Bible verse reference (e.g., "gn 1:1", "jo 3:16", "1co 13:4").
 *                           It's recommended to use the abbreviations stored in the database (e.g., 'gn', 'jo', '1co').
 * @returns {Promise<string | null>} A promise that resolves to the verse text if found, otherwise null.
 */
export async function getVerseText(verseRef: string): Promise<string | null> {
  const parsedRef = parseVerseRef(verseRef);

  if (!parsedRef) {
    return null; // Parsing failed
  }

  const { bookAbbrev, chapterNum, verseNum } = parsedRef;
  const bibleVersion = 'nvi'; // Hardcoded version based on the imported data

  // DEBUG LOG: Log parsed values before querying DB
  console.log(
    `[DEBUG] getVerseText: Parsed ref '${verseRef}' to: book=${bookAbbrev}, ch=${chapterNum}, v=${verseNum}, version=${bibleVersion}`,
  );

  try {
    // Query using joins to find the specific verse text
    const result = await db
      .select({ text: verses.text })
      .from(verses)
      .innerJoin(chapters, eq(verses.chapterId, chapters.id))
      .innerJoin(books, eq(chapters.bookId, books.id))
      .where(
        and(
          eq(books.abbreviation, bookAbbrev),
          eq(books.version, bibleVersion),
          eq(chapters.chapterNumber, chapterNum),
          eq(verses.verseNumber, verseNum),
        ),
      )
      .limit(1); // Expect only one verse

    if (result.length > 0) {
      return result[0].text; // Return the verse text
    } else {
      console.warn(
        `Verse not found in DB for ref: ${verseRef} (Parsed: ${bookAbbrev} ${chapterNum}:${verseNum}, Version: ${bibleVersion})`,
      );
      return null; // Verse not found
    }
  } catch (error) {
    console.error(`Database error fetching verse ${verseRef}:`, error);
    return null; // Return null on database error
  }
}