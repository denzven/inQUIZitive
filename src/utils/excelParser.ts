import * as XLSX from 'xlsx';
import type { Question } from '../store/useQuizStore';
import { shuffleOptionsWithSeed } from './random';

/**
 * Asynchronously parses an uploaded Excel file or ArrayBuffer containing quiz questions.
 * 
 * @param file - The raw File object uploaded by the user or an ArrayBuffer containing workbook binary data.
 * @param seed - Optional randomization seed string or number (default '12342026'). Pass 'NOSHUFFLE' to disable randomization.
 * @returns A Promise resolving to an array of parsed `Question` objects.
 * @throws Will reject if file reading or workbook parsing fails.
 */
export const parseExcelData = async (
  file: File | ArrayBuffer,
  seed: string | number = '12342026'
): Promise<Question[]> => {
  return new Promise((resolve, reject) => {
    try {
      let data: any;
      if (file instanceof File) {
        const reader = new FileReader();
        reader.onload = (e) => {
          data = e.target?.result;
          resolve(processWorkbook(data, 'binary', seed));
        };
        reader.onerror = (err) => reject(err);
        reader.readAsBinaryString(file);
      } else {
        // It's an ArrayBuffer
        resolve(processWorkbook(file, 'array', seed));
      }
    } catch (err) {
      reject(err);
    }
  });
};

/**
 * Internal helper to read an Excel workbook sheet and map raw row objects into normalized Question instances.
 * Skips the first 2 header rows to align with spreadsheet specifications.
 * 
 * @param data - The raw binary string or ArrayBuffer data of the spreadsheet.
 * @param type - The XLSX parser reading format ('binary' | 'array').
 * @param seed - Randomization seed string or number.
 * @returns An array of normalized `Question` objects with deterministically shuffled answer options.
 */
const processWorkbook = (
  data: any,
  type: 'binary' | 'array',
  seed: string | number = '12342026'
): Question[] => {
  const workbook = XLSX.read(data, { type });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];

  // The python app ignored the first 2 rows. 
  // We can do this by passing range: 2 to sheet_to_json, which treats row 3 as the header.
  const rawData = XLSX.utils.sheet_to_json<any>(worksheet, { range: 2, defval: '' });

  const questions: Question[] = [];

  rawData.forEach((row, index) => {
    // Check if it has a Question column
    const questionText = row['Questions'];
    if (!questionText) return;

    // Excel column 1 ("Answer") is the correct answer. Columns "2", "3", "4" are distractors.
    const rawOptions: string[] = [
      String(row['Answer']).trim(),
      String(row['2']).trim(),
      String(row['3']).trim(),
      String(row['4']).trim()
    ].filter(Boolean); // Remove empty options

    // Shuffle options deterministically using global seed and question index
    const shuffledOptions = shuffleOptionsWithSeed(rawOptions, seed, index);

    const q: Question = {
      index: index,
      roundCode: String(row['Round Code'] || '').trim(),
      topic: String(row['Topic'] || '').trim(),
      used: String(row['Used']).trim().toLowerCase() === 'yes',
      question: String(questionText).trim(),
      answer: String(row['Answer']).trim(),
      options: shuffledOptions,
      scoreVal: Number(row['Cost (Score)']) || 10,
    };

    questions.push(q);
  });

  return questions;
};

/**
 * Re-shuffles the options of an array of Question objects based on a new seed.
 * 
 * @param questions - Current array of Question objects.
 * @param newSeed - The new seed string or number to apply.
 * @returns A new array of Question objects with re-shuffled options.
 */
export const reshuffleAllQuestions = (
  questions: Question[],
  newSeed: string | number
): Question[] => {
  return questions.map((q, idx) => {
    // Reconstruct raw options with q.answer at index 0
    const distractors = q.options.filter(o => o !== q.answer);
    const rawOptions = [q.answer, ...distractors];
    const shuffledOptions = shuffleOptionsWithSeed(rawOptions, newSeed, q.index >= 0 ? q.index : idx);
    return {
      ...q,
      options: shuffledOptions
    };
  });
};

/**
 * Fetches an Excel spreadsheet file from a network URL and parses its question contents.
 * 
 * @param url - The remote or bundled URL endpoint targeting the `.xlsx` file.
 * @param seed - Optional randomization seed string or number.
 * @returns A Promise resolving to an array of parsed `Question` objects.
 */
export const fetchExcelData = async (
  url: string,
  seed: string | number = '12342026'
): Promise<Question[]> => {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  return parseExcelData(arrayBuffer, seed);
};

/**
 * Exports current quiz progress (questions state and team leaderboards) into a downloadable `.xlsx` workbook.
 * Creates two sheets: "Questions_Progress" and "Teams_Progress".
 * 
 * @param questions - Current array of `Question` items including their `used` status.
 * @param teams - Current array of `Team` objects with updated scores.
 */
export const exportProgressToExcel = (questions: Question[], teams: any[]) => {
  const wsQuestions = XLSX.utils.json_to_sheet(questions.map(q => {
    const incorrectOptions = q.options.filter(o => o !== q.answer);
    return {
      'Round Code': q.roundCode,
      'Topic': q.topic,
      'Questions': q.question,
      'Answer': q.answer,
      '2': incorrectOptions[0] || '',
      '3': incorrectOptions[1] || '',
      '4': incorrectOptions[2] || '',
      'Cost (Score)': q.scoreVal,
      'Used': q.used ? 'Yes' : 'No'
    };
  }));

  const wsTeams = XLSX.utils.json_to_sheet(teams.map(t => ({
    'Team ID': t.id,
    'Team Name': t.name,
    'Score': t.score
  })));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, wsQuestions, "Questions_Progress");
  XLSX.utils.book_append_sheet(wb, wsTeams, "Teams_Progress");

  XLSX.writeFile(wb, "InQUIZitive_Progress.xlsx");
};


