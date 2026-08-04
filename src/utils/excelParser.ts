import * as XLSX from 'xlsx';
import type { Question } from '../store/useQuizStore';

export const parseExcelData = async (file: File | ArrayBuffer): Promise<Question[]> => {
  return new Promise((resolve, reject) => {
    try {
      let data: any;
      if (file instanceof File) {
        const reader = new FileReader();
        reader.onload = (e) => {
          data = e.target?.result;
          resolve(processWorkbook(data, 'binary'));
        };
        reader.onerror = (err) => reject(err);
        reader.readAsBinaryString(file);
      } else {
        // It's an ArrayBuffer
        resolve(processWorkbook(file, 'array'));
      }
    } catch (err) {
      reject(err);
    }
  });
};

const processWorkbook = (data: any, type: 'binary' | 'array'): Question[] => {
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

    const options: string[] = [
      String(row['Answer']).trim(),
      String(row['2']).trim(),
      String(row['3']).trim(),
      String(row['4']).trim()
    ].filter(Boolean); // Remove empty options

    // Shuffle options (basic Fisher-Yates or sort by random)
    const shuffledOptions = options.sort(() => Math.random() - 0.5);

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

export const fetchExcelData = async (url: string): Promise<Question[]> => {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  return parseExcelData(arrayBuffer);
};
