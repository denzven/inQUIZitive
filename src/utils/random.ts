/**
 * Pseudo-Random Number Generator (PRNG) and Seeded Shuffling Utility.
 * Supports deterministic seeded shuffling using 32-bit Mulberry32 PRNG
 * as well as a 'NOSHUFFLE' / 'NOSUFFLE' safeword to bypass randomization.
 */

/**
 * Checks whether a given seed string or number represents a safeword requesting no option/question shuffling.
 * Accepts "NOSHUFFLE", "NOSUFFLE", "NO_SHUFFLE", "NO SHUFFLE" (case-insensitive).
 * 
 * @param seed - Seed value string or number.
 * @returns True if safeword is active, false otherwise.
 */
export const isNoShuffle = (seed: string | number | undefined | null): boolean => {
  if (seed === undefined || seed === null) return false;
  const str = String(seed).trim().toUpperCase().replace(/[\s_-]/g, '');
  return str === 'NOSHUFFLE' || str === 'NOSUFFLE';
};

/**
 * Converts any numeric or string seed input into a deterministic 32-bit integer.
 * 
 * @param seed - Seed input value.
 * @returns A 32-bit integer seed value.
 */
export const numericSeed = (seed: string | number | undefined | null): number => {
  if (seed === undefined || seed === null) return 12342026;
  if (typeof seed === 'number') return Math.floor(seed) >>> 0;
  
  const str = String(seed).trim();
  const parsed = parseInt(str, 10);
  if (!isNaN(parsed)) return parsed >>> 0;
  
  // String hash algorithm (Fowler-Noll-Vo 1a hash) for text seeds
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

/**
 * Creates a 32-bit Mulberry32 seeded pseudo-random number generator function.
 * Produces deterministic pseudo-random floating point numbers in the range [0, 1).
 * 
 * @param seed - Seed input value (numeric or string hash).
 * @returns A function returning pseudo-random float in [0, 1).
 */
export const createPRNG = (seed: string | number): () => number => {
  let s = numericSeed(seed);
  return function () {
    let t = (s += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

/**
 * Shuffles an array using the Fisher-Yates algorithm and a seeded PRNG.
 * If safeword 'NOSHUFFLE' / 'NOSUFFLE' is passed as seed, returns the original array untouched.
 * 
 * @template T
 * @param array - Array of elements to shuffle.
 * @param seed - Seed value or PRNG function.
 * @returns A new shuffled array (or shallow copy if NOSHUFFLE is active).
 */
export const seededShuffle = <T>(
  array: T[],
  seed: string | number | (() => number)
): T[] => {
  if (typeof seed !== 'function' && isNoShuffle(seed)) {
    return [...array];
  }

  const prng = typeof seed === 'function' ? seed : createPRNG(seed);
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(prng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

/**
 * Deterministically shuffles a question's 4 multiple-choice options array based on global seed and question index.
 * In Excel spreadsheet import, Option 1 (index 0) is always the correct Answer.
 * In NOSHUFFLE mode, Option A remains Option 1 (Answer).
 * In Seeded mode, options are deterministically randomized across A, B, C, D.
 * 
 * @param options - The raw options array (where index 0 is correct answer).
 * @param seed - Global seed value.
 * @param questionIndex - Unique index/ID of the question to salt the seed.
 * @returns Shuffled options array.
 */
export const shuffleOptionsWithSeed = (
  options: string[],
  seed: string | number,
  questionIndex: number
): string[] => {
  if (isNoShuffle(seed)) {
    return [...options];
  }
  // Create deterministic PRNG specific to this question by salting with questionIndex
  const baseNum = numericSeed(seed);
  const qSeed = (baseNum + (questionIndex + 1) * 9973) >>> 0;
  const prng = createPRNG(qSeed);
  return seededShuffle(options, prng);
};
