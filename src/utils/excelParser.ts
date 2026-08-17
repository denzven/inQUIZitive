import * as XLSX from 'xlsx';
import type { Question } from '../store/useQuizStore';
import { shuffleOptionsWithSeed } from './random';
import { extractExcelImages, injectImagesToWorkbookZip } from './excelImageExtractor';
import { preloadQuestionImages } from './imagePreloader';

/**
 * Helper to convert File or ArrayBuffer to ArrayBuffer reliably.
 */
const getArrayBufferFromFile = async (file: File | ArrayBuffer): Promise<ArrayBuffer> => {
  if (file instanceof ArrayBuffer) return file;
  return await file.arrayBuffer();
};

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
  const arrayBuffer = await getArrayBufferFromFile(file);
  const extracted = await extractExcelImages(arrayBuffer);
  const parsedQuestions = processWorkbook(arrayBuffer, 'array', seed, extracted.byRow);
  // Preload all question images (HTTP/HTTPS URLs & Data URLs) into browser cache
  preloadQuestionImages(parsedQuestions).catch(err => console.warn('Image preloader notice:', err));
  return parsedQuestions;
};

/**
 * Helper to safely convert cell values to trimmed strings.
 * Handles numeric values like 0 or false without coercing them to empty strings (via `val || ''`).
 */
const getCellValue = (val: any): string => {
  if (val === undefined || val === null) return '';
  return String(val).trim();
};

/**
 * Helper to detect unedited default template placeholders (e.g. "Question 255", "Answer 255", "Option 2 255", "Question 000").
 */
const isPlaceholderText = (text: string): boolean => {
  if (!text) return false;
  const trimmed = text.trim();
  const lower = trimmed.toLowerCase();
  
  // Matches "Question 255", "Question 1", "Question 000", "Question 01"
  if (/^question\s*\d+$/i.test(trimmed)) return true;
  // Matches "Answer 255", "Answer 1", "Answer 000", "Answer 01"
  if (/^answer\s*\d+$/i.test(trimmed)) return true;
  // Matches "Option 2 255", "Option 3 255", "Option 4 255", "Option 255"
  if (/^option\s*(\d+\s+)?\d+$/i.test(trimmed)) return true;
  
  // Legacy or generic placeholder matches
  if (/^0{3,}$/.test(trimmed)) return true; // "000", "0000"
  if (lower.includes('sample question') || lower.includes('insert question') || lower.includes('default question') || lower.includes('[insert')) return true;
  
  return false;
};

/**
 * Helper to resolve round code from Round Code column or descriptive Round column.
 */
const resolveRoundCode = (row: any): string => {
  const code = getCellValue(row['Round Code']) || getCellValue(row['RoundCode']);
  if (code) return code;
  const roundName = getCellValue(row['Round']) || getCellValue(row['Round Name']);
  if (!roundName) return 'RF';
  const lower = roundName.toLowerCase();
  if (lower.includes('rapid')) return 'RF';
  if (lower.includes('jeopardy') || lower.includes('spin')) return 'SWJ';
  if (lower.includes('buzzer')) return 'B';
  if (lower.includes('tic') || lower.includes('tac')) return 'TTT';
  return roundName;
};

/**
 * Detects the 0-based range offset (header row) of an Excel worksheet.
 * If Row 1 contains standard header keywords ('questions' or 'round code' or 'answer'), range is 0.
 * Otherwise, defaults to range 2 (skipping 2 title/instruction rows as in standard templates).
 */
const detectWorkbookHeaderRange = (worksheet: XLSX.WorkSheet): number => {
  try {
    const row1Json = XLSX.utils.sheet_to_json<any>(worksheet, { range: 0, header: 1 })[0] || [];
    const row1Text = JSON.stringify(row1Json).toLowerCase();
    if (row1Text.includes('question') || row1Text.includes('round') || row1Text.includes('answer')) {
      return 0;
    }
  } catch (err) {
    console.warn('Header detection notice:', err);
  }
  return 2;
};

/**
 * Internal helper to read an Excel workbook sheet and map raw row objects into normalized Question instances.
 * Dynamically detects header row position to support both standard templates and backup exports.
 * 
 * @param data - The raw binary string or ArrayBuffer data of the spreadsheet.
 * @param type - The XLSX parser reading format ('binary' | 'array').
 * @param seed - Randomization seed string or number.
 * @param imageMap - Optional map of openXml row indices to image Data URLs.
 * @returns An array of normalized `Question` objects with deterministically shuffled answer options.
 */
const processWorkbook = (
  data: any,
  type: 'binary' | 'array',
  seed: string | number = '12342026',
  imageMap: Map<number, string> = new Map()
): Question[] => {
  const workbook = XLSX.read(data, { type });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];

  const rangeOffset = detectWorkbookHeaderRange(worksheet);
  const rawData = XLSX.utils.sheet_to_json<any>(worksheet, { range: rangeOffset, defval: '' });

  const questions: Question[] = [];

  rawData.forEach((row, index) => {
    // Check if it has a Question column
    const questionText = getCellValue(row['Questions']);
    if (questionText === '') return;

    const rawAns = getCellValue(row['Answer']);
    const raw2 = getCellValue(row['2']);
    const raw3 = getCellValue(row['3']);
    const raw4 = getCellValue(row['4']);

    // Excel column 1 ("Answer") is the correct answer. Columns "2", "3", "4" are distractors.
    const rawOptions: string[] = [rawAns, raw2, raw3, raw4].filter(opt => opt !== '');

    // Shuffle options deterministically using global seed and question index
    const shuffledOptions = shuffleOptionsWithSeed(rawOptions, seed, index);

    // OpenXML row index calculation:
    // If rangeOffset === 0 (Row 1 header), data item 0 is at OpenXML row 1 (Excel row 2).
    // If rangeOffset === 2 (Row 3 header), data item 0 is at OpenXML row 3 (Excel row 4).
    const expectedOpenXmlRow = rangeOffset === 0 ? index + 1 : index + 3;
    const extractedImage = 
      imageMap.get(expectedOpenXmlRow) || 
      imageMap.get(index + 1) || 
      imageMap.get(index + 2) || 
      imageMap.get(index + 3) || 
      imageMap.get(index + 4);

    const textImage = getCellValue(row['Image']) || getCellValue(row['Image URL']) || getCellValue(row['Image Base64']);

    const q: Question = {
      index: index,
      roundCode: resolveRoundCode(row),
      topic: getCellValue(row['Topic']),
      used: getCellValue(row['Used']).toLowerCase() === 'yes',
      question: questionText,
      image: extractedImage || (textImage !== '' ? textImage : undefined),
      answer: rawAns,
      options: shuffledOptions,
      scoreVal: Number(row['Cost (Score)']) || Number(row['Cost']) || Number(row['Score']) || 10,
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

export type AuditIssueType = 'error' | 'placeholder' | 'warning';

export type AuditCategory = 
  | 'MISSING_QUESTION' 
  | 'MISSING_ANSWER' 
  | 'INSUFFICIENT_OPTIONS' 
  | 'DUPLICATE_OPTIONS' 
  | 'DUPLICATE_QUESTION' 
  | 'INVALID_SCORE' 
  | 'MISSING_ROUND_CODE'
  | 'UNEDITED_TEMPLATE_PLACEHOLDER';

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
  placeholderCount: number;
  warningCount: number;
  imageCount: number;
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
  const arrayBuffer = await getArrayBufferFromFile(file);
  const extracted = await extractExcelImages(arrayBuffer);
  return processAuditWorkbook(arrayBuffer, 'array', seed, extracted.byRow, extracted.totalExtracted);
};

/**
 * Internal helper to audit workbook rows, track issues, and generate clean Question objects.
 */
const processAuditWorkbook = (
  data: any,
  type: 'binary' | 'array',
  seed: string | number = '12342026',
  imageMap: Map<number, string> = new Map(),
  extractedImageCount: number = 0
): AuditResult => {
  const workbook = XLSX.read(data, { type });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  
  const rangeOffset = detectWorkbookHeaderRange(worksheet);
  const rawData = XLSX.utils.sheet_to_json<any>(worksheet, { range: rangeOffset, defval: '' });

  const issues: AuditIssue[] = [];
  const cleanQuestions: Question[] = [];
  const questionTextsSeen = new Map<string, number>(); // text -> rowIndex

  let totalRows = 0;

  rawData.forEach((row, idx) => {
    const excelRowIndex = rangeOffset === 0 ? idx + 2 : idx + 4;
    totalRows++;
    let rowHasFatalError = false;

    const rawQuestionText = getCellValue(row['Questions']);
    const rawAnswerText = getCellValue(row['Answer']);
    const rawOpt2 = getCellValue(row['2']);
    const rawOpt3 = getCellValue(row['3']);
    const rawOpt4 = getCellValue(row['4']);
    const rawRoundCode = getCellValue(row['Round Code']);
    const rawTopic = getCellValue(row['Topic']);
    const rawCost = row['Cost (Score)'];
    const snippet = rawQuestionText ? (rawQuestionText.length > 45 ? rawQuestionText.substring(0, 45) + '...' : rawQuestionText) : `Row ${excelRowIndex}`;

    const expectedOpenXmlRow = rangeOffset === 0 ? idx + 1 : idx + 3;
    const extractedImage = 
      imageMap.get(expectedOpenXmlRow) || 
      imageMap.get(idx + 1) || 
      imageMap.get(idx + 2) || 
      imageMap.get(idx + 3) || 
      imageMap.get(idx + 4);

    const textImage = getCellValue(row['Image']) || getCellValue(row['Image URL']) || getCellValue(row['Image Base64']);
    const questionImage = extractedImage || (textImage !== '' ? textImage : undefined);

    // Check 1: Missing Question Text
    if (rawQuestionText === '') {
      rowHasFatalError = true;
      issues.push({
        rowIndex: excelRowIndex,
        questionSnippet: snippet,
        type: 'error',
        category: 'MISSING_QUESTION',
        message: 'Question text column is empty or missing.'
      });
    }

    // Check 2: Missing Correct Answer
    if (rawAnswerText === '') {
      rowHasFatalError = true;
      issues.push({
        rowIndex: excelRowIndex,
        questionSnippet: snippet,
        type: 'error',
        category: 'MISSING_ANSWER',
        message: 'Correct answer column is empty or missing.'
      });
    }

    // Options analysis
    const rawOptions = [rawAnswerText, rawOpt2, rawOpt3, rawOpt4].filter(opt => opt !== '');
    const uniqueOptions = Array.from(new Set(rawOptions.map(o => o.toLowerCase())));

    // Check 3: Insufficient Options
    if (rawOptions.length < 2) {
      rowHasFatalError = true;
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
      rowHasFatalError = true;
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
    if (rawQuestionText !== '') {
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
      if (rawCost !== '' && rawCost !== undefined && rawCost !== null) {
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
    if (rawRoundCode === '') {
      issues.push({
        rowIndex: excelRowIndex,
        questionSnippet: snippet,
        type: 'warning',
        category: 'MISSING_ROUND_CODE',
        message: 'Round Code is missing. Defaulted to General.'
      });
    }

    // Check 8: Potential Unedited Template Placeholder
    const hasPlaceholderField = [rawQuestionText, rawAnswerText, rawOpt2, rawOpt3, rawOpt4].some(isPlaceholderText);
    if (hasPlaceholderField) {
      issues.push({
        rowIndex: excelRowIndex,
        questionSnippet: snippet,
        type: 'placeholder',
        category: 'UNEDITED_TEMPLATE_PLACEHOLDER',
        message: 'Contains unedited default template placeholder text (e.g. "Question 255" or "Answer 255"). Please verify before presentation.'
      });
    }

    // Create remediated / clean question object ONLY if row has NO fatal errors!
    if (!rowHasFatalError) {
      // Deduplicate options while preserving order
      const cleanOptionsList: string[] = [];
      [rawAnswerText, rawOpt2, rawOpt3, rawOpt4].forEach(opt => {
        if (opt !== '' && !cleanOptionsList.some(o => o.toLowerCase() === opt.toLowerCase())) {
          cleanOptionsList.push(opt);
        }
      });

      const shuffledOptions = shuffleOptionsWithSeed(cleanOptionsList, seed, cleanQuestions.length);

      cleanQuestions.push({
        index: cleanQuestions.length,
        roundCode: rawRoundCode || 'General',
        topic: rawTopic || 'General',
        used: getCellValue(row['Used']).toLowerCase() === 'yes',
        question: rawQuestionText,
        image: questionImage,
        answer: rawAnswerText,
        options: shuffledOptions,
        scoreVal: numericScore,
      });
    }
  });

  const errorCount = issues.filter(i => i.type === 'error').length;
  const placeholderCount = issues.filter(i => i.type === 'placeholder').length;
  const warningCount = issues.filter(i => i.type === 'warning').length;
  const validCount = cleanQuestions.length;
  const imageCount = cleanQuestions.filter(q => Boolean(q.image)).length || extractedImageCount;

  return {
    totalRows,
    validCount,
    errorCount,
    placeholderCount,
    warningCount,
    imageCount,
    issues,
    cleanQuestions,
  };
};

const getRoundLabel = (code: string): string => {
  switch (code?.toUpperCase()) {
    case 'RF': return 'Rapid Fire';
    case 'SWJ': return 'Spin Wheel Jeopardy';
    case 'B': return 'Buzzer';
    case 'TTT': return 'Tic-Tac-Toe';
    default: return code || 'General';
  }
};

/**
 * Exports current quiz progress (questions state and team leaderboards) into a downloadable `.xlsx` workbook.
 * Creates two sheets: "Questions_Progress" and "Teams_Progress".
 * 
 * @param questions - Current array of `Question` items including their `used` status.
 * @param teams - Current array of `Team` objects with updated scores.
 */
export const exportProgressToExcel = async (questions: Question[], teams: any[]) => {
  const questionRows = questions.map((q, idx) => {
    const incorrectOptions = q.options.filter(o => o !== q.answer);
    const textCellValue = q.image && !q.image.startsWith('data:image/') ? q.image : '';

    return {
      'SrNo.': idx + 1,
      'Used': q.used ? 'Yes' : 'No',
      'Topic': q.topic || '',
      'Questions': q.question,
      'Image': textCellValue,
      'Answer': q.answer,
      '2': incorrectOptions[0] || '',
      '3': incorrectOptions[1] || '',
      '4': incorrectOptions[2] || '',
      'Cost (Score)': q.scoreVal,
      'Round Code': q.roundCode || '',
      'Round': getRoundLabel(q.roundCode)
    };
  });

  const headerOrder = [
    'SrNo.',
    'Used',
    'Topic',
    'Questions',
    'Image',
    'Answer',
    '2',
    '3',
    '4',
    'Cost (Score)',
    'Round Code',
    'Round'
  ];

  const wsQuestions = XLSX.utils.json_to_sheet(questionRows, { header: headerOrder });

  // Set explicit column widths for readability in Excel
  wsQuestions['!cols'] = [
    { wch: 8 },   // A: SrNo.
    { wch: 8 },   // B: Used
    { wch: 18 },  // C: Topic
    { wch: 45 },  // D: Questions
    { wch: 25 },  // E: Image
    { wch: 22 },  // F: Answer
    { wch: 22 },  // G: 2
    { wch: 22 },  // H: 3
    { wch: 22 },  // I: 4
    { wch: 14 },  // J: Cost (Score)
    { wch: 14 },  // K: Round Code
    { wch: 20 },  // L: Round
  ];

  // Set explicit row heights so embedded pictures render large and clearly in Excel
  const rowHeights = [{ hpt: 28 }]; // Row 1 Header height (28pt)
  questions.forEach(q => {
    rowHeights.push({ hpt: q.image ? 65 : 24 });
  });
  wsQuestions['!rows'] = rowHeights;

  const wsTeams = XLSX.utils.json_to_sheet(teams.map(t => ({
    'Team ID': t.id,
    'Team Name': t.name,
    'Score': t.score
  })));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, wsQuestions, "Questions");
  XLSX.utils.book_append_sheet(wb, wsTeams, "Teams_Progress");

  try {
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = await injectImagesToWorkbookZip(wbout, questions.map((q, idx) => ({ image: q.image, index: idx })));
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `InQUIZitive_Progress_${new Date().toISOString().slice(0, 10)}.xlsx`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 200);
  } catch (err) {
    console.error("Export progress failed:", err);
    XLSX.writeFile(wb, "InQUIZitive_Progress.xlsx");
  }
};




