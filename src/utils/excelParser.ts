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

export type AuditIssueType = 'error' | 'warning';

export type AuditCategory = 
  | 'MISSING_QUESTION' 
  | 'MISSING_ANSWER' 
  | 'INSUFFICIENT_OPTIONS' 
  | 'DUPLICATE_OPTIONS' 
  | 'DUPLICATE_QUESTION' 
  | 'INVALID_SCORE' 
  | 'MISSING_ROUND_CODE';

export interface AuditIssue {
  rowIndex: number;
  questionSnippet: string;
  type: AuditIssueType;
  category: AuditCategory;
  message: string;
}

export interface AuditResult {
  totalRows: number;
  validCount: number;
  errorCount: number;
  warningCount: number;
  issues: AuditIssue[];
  cleanQuestions: Question[];
}

/**
 * Performs a comprehensive pre-flight audit on an uploaded Excel file or ArrayBuffer.
 * Validates row data for missing fields, duplicate options, non-numeric score values, and duplicate questions.
 * 
 * @param file - The raw File or ArrayBuffer spreadsheet data.
 * @param seed - Optional randomization seed string or number.
 * @returns A Promise resolving to an `AuditResult` containing summary metrics, issue list, and clean questions.
 */
export const auditExcelData = async (
  file: File | ArrayBuffer,
  seed: string | number = '12342026'
): Promise<AuditResult> => {
  return new Promise((resolve, reject) => {
    try {
      if (file instanceof File) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const data = e.target?.result;
          resolve(processAuditWorkbook(data, 'binary', seed));
        };
        reader.onerror = (err) => reject(err);
        reader.readAsBinaryString(file);
      } else {
        resolve(processAuditWorkbook(file, 'array', seed));
      }
    } catch (err) {
      reject(err);
    }
  });
};

/**
 * Internal helper to audit workbook rows, track issues, and generate clean Question objects.
 */
const processAuditWorkbook = (
  data: any,
  type: 'binary' | 'array',
  seed: string | number = '12342026'
): AuditResult => {
  const workbook = XLSX.read(data, { type });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  
  const rawData = XLSX.utils.sheet_to_json<any>(worksheet, { range: 2, defval: '' });

  const issues: AuditIssue[] = [];
  const cleanQuestions: Question[] = [];
  const questionTextsSeen = new Map<string, number>(); // text -> rowIndex

  let totalRows = 0;

  rawData.forEach((row, idx) => {
    const excelRowIndex = idx + 4; // Header is row 3, 0-index row is row 4
    totalRows++;

    const rawQuestionText = String(row['Questions'] || '').trim();
    const rawAnswerText = String(row['Answer'] || '').trim();
    const rawOpt2 = String(row['2'] || '').trim();
    const rawOpt3 = String(row['3'] || '').trim();
    const rawOpt4 = String(row['4'] || '').trim();
    const rawRoundCode = String(row['Round Code'] || '').trim();
    const rawTopic = String(row['Topic'] || '').trim();
    const rawCost = row['Cost (Score)'];
    const snippet = rawQuestionText ? (rawQuestionText.length > 45 ? rawQuestionText.substring(0, 45) + '...' : rawQuestionText) : `Row ${excelRowIndex}`;

    // Check 1: Missing Question Text
    if (!rawQuestionText) {
      issues.push({
        rowIndex: excelRowIndex,
        questionSnippet: snippet,
        type: 'error',
        category: 'MISSING_QUESTION',
        message: 'Question text column is empty or missing.'
      });
    }

    // Check 2: Missing Correct Answer
    if (!rawAnswerText) {
      issues.push({
        rowIndex: excelRowIndex,
        questionSnippet: snippet,
        type: 'error',
        category: 'MISSING_ANSWER',
        message: 'Correct answer column is empty or missing.'
      });
    }

    // Options analysis
    const rawOptions = [rawAnswerText, rawOpt2, rawOpt3, rawOpt4].filter(Boolean);
    const uniqueOptions = Array.from(new Set(rawOptions.map(o => o.toLowerCase())));

    // Check 3: Insufficient Options
    if (rawOptions.length < 2) {
      issues.push({
        rowIndex: excelRowIndex,
        questionSnippet: snippet,
        type: 'error',
        category: 'INSUFFICIENT_OPTIONS',
        message: `Fewer than 2 options available (found ${rawOptions.length}). At least answer + 1 distractor required.`
      });
    }

    // Check 4: Duplicate Options within same question
    if (uniqueOptions.length < rawOptions.length) {
      const duplicates = rawOptions.filter((opt, i, arr) => 
        arr.findIndex(o => o.toLowerCase() === opt.toLowerCase()) !== i
      );
      issues.push({
        rowIndex: excelRowIndex,
        questionSnippet: snippet,
        type: 'error',
        category: 'DUPLICATE_OPTIONS',
        message: `Question contains duplicate options: "${duplicates.join('", "')}".`
      });
    }

    // Check 5: Duplicate Question Text across workbook
    if (rawQuestionText) {
      const lowerQ = rawQuestionText.toLowerCase();
      if (questionTextsSeen.has(lowerQ)) {
        const prevRow = questionTextsSeen.get(lowerQ);
        issues.push({
          rowIndex: excelRowIndex,
          questionSnippet: snippet,
          type: 'warning',
          category: 'DUPLICATE_QUESTION',
          message: `Duplicate question text found (previously seen at Row ${prevRow}).`
        });
      } else {
        questionTextsSeen.set(lowerQ, excelRowIndex);
      }
    }

    // Check 6: Score cost validity
    let numericScore = Number(rawCost);
    if (rawCost === '' || rawCost === null || rawCost === undefined || isNaN(numericScore) || numericScore <= 0) {
      numericScore = 10; // default fallback
      if (rawCost !== '' && rawCost !== undefined) {
        issues.push({
          rowIndex: excelRowIndex,
          questionSnippet: snippet,
          type: 'warning',
          category: 'INVALID_SCORE',
          message: `Invalid score cost "${rawCost}". Auto-defaulted score to 10 points.`
        });
      }
    }

    // Check 7: Round Code or Topic missing
    if (!rawRoundCode) {
      issues.push({
        rowIndex: excelRowIndex,
        questionSnippet: snippet,
        type: 'warning',
        category: 'MISSING_ROUND_CODE',
        message: 'Round Code is missing. Defaulted to General.'
      });
    }

    // Create remediated / clean question object if minimal viable fields exist
    if (rawQuestionText && rawAnswerText) {
      // Deduplicate options while preserving order
      const cleanOptionsList: string[] = [];
      [rawAnswerText, rawOpt2, rawOpt3, rawOpt4].forEach(opt => {
        if (opt && !cleanOptionsList.some(o => o.toLowerCase() === opt.toLowerCase())) {
          cleanOptionsList.push(opt);
        }
      });

      const shuffledOptions = shuffleOptionsWithSeed(cleanOptionsList, seed, cleanQuestions.length);

      cleanQuestions.push({
        index: cleanQuestions.length,
        roundCode: rawRoundCode || 'General',
        topic: rawTopic || 'General',
        used: String(row['Used'] || '').trim().toLowerCase() === 'yes',
        question: rawQuestionText,
        answer: rawAnswerText,
        options: shuffledOptions,
        scoreVal: numericScore,
      });
    }
  });

  const errorCount = issues.filter(i => i.type === 'error').length;
  const warningCount = issues.filter(i => i.type === 'warning').length;
  const validCount = cleanQuestions.length;

  return {
    totalRows,
    validCount,
    errorCount,
    warningCount,
    issues,
    cleanQuestions,
  };
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



