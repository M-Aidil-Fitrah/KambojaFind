import { tfidfSearchAsync } from '../search/tfidf-search';
import { bm25SearchAsync } from '../search/bm25-search';
import { groundTruthData, QueryGroundTruth } from './ground-truth';

/**
 * Hasil evaluasi untuk satu query
 */
export interface QueryEvaluationResult {
  query: string;
  precision: number;
  recall: number;
  f1Score: number;
  averagePrecision: number;
  retrievedDocs: number[];
  relevantDocs: number[];
  relevantRetrieved: number[];
}

/**
 * Hasil evaluasi keseluruhan untuk satu algoritma
 */
export interface AlgorithmEvaluationResult {
  algorithm: 'TF-IDF' | 'BM25';
  precision: number;
  recall: number;
  f1Score: number;
  map: number; // Mean Average Precision
  queryResults: QueryEvaluationResult[];
}

/**
 * Hasil evaluasi komparasi kedua algoritma
 */
export interface EvaluationComparison {
  tfidf: AlgorithmEvaluationResult;
  bm25: AlgorithmEvaluationResult;
  timestamp: string;
  totalQueries: number;
}

/**
 * Menghitung Precision: TP / (TP + FP)
 * Proporsi dokumen yang diambil yang benar-benar relevan
 */
function calculatePrecision(retrieved: number[], relevant: number[]): number {
  if (retrieved.length === 0) return 0;
  
  const relevantRetrieved = retrieved.filter(doc => relevant.includes(doc));
  return relevantRetrieved.length / retrieved.length;
}

/**
 * Menghitung Recall: TP / (TP + FN)
 * Proporsi dokumen relevan yang berhasil diambil
 */
function calculateRecall(retrieved: number[], relevant: number[]): number {
  if (relevant.length === 0) return 0;
  
  const relevantRetrieved = retrieved.filter(doc => relevant.includes(doc));
  return relevantRetrieved.length / relevant.length;
}

/**
 * Menghitung F1 Score: 2 * (Precision * Recall) / (Precision + Recall)
 * Harmonic mean dari Precision dan Recall
 */
function calculateF1Score(precision: number, recall: number): number {
  if (precision + recall === 0) return 0;
  return (2 * precision * recall) / (precision + recall);
}

/**
 * Menghitung Average Precision untuk satu query
 * AP = (1/R) * Σ(P(k) * rel(k))
 * dimana R = jumlah dokumen relevan, P(k) = precision at k, rel(k) = 1 jika relevan
 */
function calculateAveragePrecision(retrieved: number[], relevant: number[]): number {
  if (relevant.length === 0) return 0;
  
  let sumPrecision = 0;
  let relevantCount = 0;
  
  for (let i = 0; i < retrieved.length; i++) {
    const doc = retrieved[i];
    if (relevant.includes(doc)) {
      relevantCount++;
      const precisionAtK = relevantCount / (i + 1);
      sumPrecision += precisionAtK;
    }
  }
  
  return sumPrecision / relevant.length;
}

/**
 * Evaluasi satu query dengan algoritma tertentu
 */
async function evaluateQuery(
  groundTruth: QueryGroundTruth,
  searchFunction: (query: string, topK: number) => Promise<any[]>,
  topK: number = 20
): Promise<QueryEvaluationResult> {
  try {
    // Ambil hasil pencarian
    const searchResults = await searchFunction(groundTruth.query, topK);
    
    // Extract doc_id from search results (handle both id and doc_id properties)
    const retrievedDocs = searchResults.map(result => {
      // Parse doc_id to number if it's a string like "123"
      const docIdStr = result.doc_id || result.id || '';
      const docIdNum = parseInt(docIdStr.toString().replace(/\D/g, ''), 10);
      return isNaN(docIdNum) ? 0 : docIdNum;
    }).filter(id => id > 0);
    
    const relevantDocs = groundTruth.relevantDocs;
    
    // Hitung dokumen relevan yang berhasil diambil
    const relevantRetrieved = retrievedDocs.filter(doc => relevantDocs.includes(doc));
    
    // Hitung metrics
    const precision = calculatePrecision(retrievedDocs, relevantDocs);
    const recall = calculateRecall(retrievedDocs, relevantDocs);
    const f1Score = calculateF1Score(precision, recall);
    const averagePrecision = calculateAveragePrecision(retrievedDocs, relevantDocs);
    
    return {
      query: groundTruth.query,
      precision,
      recall,
      f1Score,
      averagePrecision,
      retrievedDocs,
      relevantDocs,
      relevantRetrieved
    };
  } catch (error) {
    console.error(`Error evaluating query "${groundTruth.query}":`, error);
    return {
      query: groundTruth.query,
      precision: 0,
      recall: 0,
      f1Score: 0,
      averagePrecision: 0,
      retrievedDocs: [],
      relevantDocs: groundTruth.relevantDocs,
      relevantRetrieved: []
    };
  }
}

/**
 * Evaluasi semua query untuk satu algoritma
 */
async function evaluateAlgorithm(
  algorithm: 'TF-IDF' | 'BM25',
  searchFunction: (query: string, topK: number) => Promise<any[]>,
  topK: number = 20
): Promise<AlgorithmEvaluationResult> {
  const queryResults: QueryEvaluationResult[] = [];
  
  // Evaluasi setiap query
  for (const groundTruth of groundTruthData) {
    const result = await evaluateQuery(groundTruth, searchFunction, topK);
    queryResults.push(result);
  }
  
  // Hitung rata-rata metrics
  const avgPrecision = queryResults.reduce((sum, r) => sum + r.precision, 0) / queryResults.length;
  const avgRecall = queryResults.reduce((sum, r) => sum + r.recall, 0) / queryResults.length;
  const avgF1Score = queryResults.reduce((sum, r) => sum + r.f1Score, 0) / queryResults.length;
  const map = queryResults.reduce((sum, r) => sum + r.averagePrecision, 0) / queryResults.length;
  
  return {
    algorithm,
    precision: avgPrecision,
    recall: avgRecall,
    f1Score: avgF1Score,
    map,
    queryResults
  };
}

/**
 * Evaluasi dan bandingkan kedua algoritma
 */
export async function evaluateSearchEngines(topK: number = 20): Promise<EvaluationComparison> {
  console.log('Starting evaluation of search engines...');
  
  // Evaluasi TF-IDF
  console.log('Evaluating TF-IDF...');
  const tfidfResults = await evaluateAlgorithm('TF-IDF', tfidfSearchAsync, topK);
  
  // Evaluasi BM25
  console.log('Evaluating BM25...');
  const bm25Results = await evaluateAlgorithm('BM25', bm25SearchAsync, topK);
  
  console.log('Evaluation completed!');
  
  return {
    tfidf: tfidfResults,
    bm25: bm25Results,
    timestamp: new Date().toISOString(),
    totalQueries: groundTruthData.length
  };
}

/**
 * Format hasil evaluasi untuk ditampilkan
 */
export function formatEvaluationResults(comparison: EvaluationComparison): string {
  let output = '=== EVALUATION RESULTS ===\n\n';
  output += `Total Queries: ${comparison.totalQueries}\n`;
  output += `Timestamp: ${comparison.timestamp}\n\n`;
  
  // TF-IDF Results
  output += '--- TF-IDF Performance ---\n';
  output += `Precision: ${(comparison.tfidf.precision * 100).toFixed(2)}%\n`;
  output += `Recall: ${(comparison.tfidf.recall * 100).toFixed(2)}%\n`;
  output += `F1 Score: ${(comparison.tfidf.f1Score * 100).toFixed(2)}%\n`;
  output += `MAP: ${(comparison.tfidf.map * 100).toFixed(2)}%\n\n`;
  
  // BM25 Results
  output += '--- BM25 Performance ---\n';
  output += `Precision: ${(comparison.bm25.precision * 100).toFixed(2)}%\n`;
  output += `Recall: ${(comparison.bm25.recall * 100).toFixed(2)}%\n`;
  output += `F1 Score: ${(comparison.bm25.f1Score * 100).toFixed(2)}%\n`;
  output += `MAP: ${(comparison.bm25.map * 100).toFixed(2)}%\n\n`;
  
  // Comparison
  output += '--- Comparison ---\n';
  const precisionDiff = (comparison.bm25.precision - comparison.tfidf.precision) * 100;
  const recallDiff = (comparison.bm25.recall - comparison.tfidf.recall) * 100;
  const f1Diff = (comparison.bm25.f1Score - comparison.tfidf.f1Score) * 100;
  const mapDiff = (comparison.bm25.map - comparison.tfidf.map) * 100;
  
  output += `Precision: BM25 ${precisionDiff > 0 ? '+' : ''}${precisionDiff.toFixed(2)}% vs TF-IDF\n`;
  output += `Recall: BM25 ${recallDiff > 0 ? '+' : ''}${recallDiff.toFixed(2)}% vs TF-IDF\n`;
  output += `F1 Score: BM25 ${f1Diff > 0 ? '+' : ''}${f1Diff.toFixed(2)}% vs TF-IDF\n`;
  output += `MAP: BM25 ${mapDiff > 0 ? '+' : ''}${mapDiff.toFixed(2)}% vs TF-IDF\n`;
  
  return output;
}
