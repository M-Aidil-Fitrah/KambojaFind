import { NextResponse } from 'next/server';
import { tfidfSearchAsync } from '@/lib/search/tfidf-search';
import { bm25SearchAsync } from '@/lib/search/bm25-search';
import fs from 'fs/promises';
import path from 'path';

interface GroundTruthQuery {
  query: string;
  relevantDocs: number[];
  description: string;
}

interface QueryEvaluationResult {
  query: string;
  matchedGroundTruth: string;
  similarity: number;
  precision: number;
  recall: number;
  f1Score: number;
  averagePrecision: number;
  retrievedDocs: number[];
  relevantDocs: number[];
  relevantRetrieved: number[];
}

interface EvaluationResult {
  tfidf: QueryEvaluationResult;
  bm25: QueryEvaluationResult;
  timestamp: string;
}

// Load ground truth data
// Cache disabled untuk development - selalu load fresh data
let groundTruthCache: GroundTruthQuery[] | null = null;

async function loadGroundTruth(): Promise<GroundTruthQuery[]> {
  // Always reload to get fresh data (disable cache for now)
  const groundTruthPath = path.join(process.cwd(), 'preprocessing', 'dataset', 'ground_truth.json');
  const data = await fs.readFile(groundTruthPath, 'utf-8');
  groundTruthCache = JSON.parse(data);
  console.log(`Loaded ground truth: ${groundTruthCache!.length} queries`);
  console.log(`First query has ${groundTruthCache![0].relevantDocs.length} relevant docs`);
  return groundTruthCache!;
}

/**
 * Hitung similarity antara dua query menggunakan Jaccard similarity
 * Similarity = |A ∩ B| / |A ∪ B|
 */
function calculateQuerySimilarity(query1: string, query2: string): number {
  const tokens1 = new Set(query1.toLowerCase().split(/\s+/));
  const tokens2 = new Set(query2.toLowerCase().split(/\s+/));

  const intersection = new Set([...tokens1].filter(x => tokens2.has(x)));
  const union = new Set([...tokens1, ...tokens2]);

  return intersection.size / union.size;
}

/**
 * Cari ground truth query yang paling mirip dengan user query
 */
function findMostSimilarGroundTruth(
  userQuery: string,
  groundTruthData: GroundTruthQuery[]
): { groundTruth: GroundTruthQuery; similarity: number } {
  let bestMatch = groundTruthData[0];
  let bestSimilarity = 0;

  for (const gt of groundTruthData) {
    const similarity = calculateQuerySimilarity(userQuery, gt.query);
    if (similarity > bestSimilarity) {
      bestSimilarity = similarity;
      bestMatch = gt;
    }
  }

  return { groundTruth: bestMatch, similarity: bestSimilarity };
}

/**
 * Menghitung Precision: TP / (TP + FP)
 */
function calculatePrecision(retrieved: number[], relevant: number[]): number {
  if (retrieved.length === 0) return 0;
  const relevantRetrieved = retrieved.filter(doc => relevant.includes(doc));
  return relevantRetrieved.length / retrieved.length;
}

/**
 * Menghitung Recall: TP / (TP + FN)
 */
function calculateRecall(retrieved: number[], relevant: number[]): number {
  if (relevant.length === 0) return 0;
  const relevantRetrieved = retrieved.filter(doc => relevant.includes(doc));
  return relevantRetrieved.length / relevant.length;
}

/**
 * Menghitung F1 Score
 */
function calculateF1Score(precision: number, recall: number): number {
  if (precision + recall === 0) return 0;
  return (2 * precision * recall) / (precision + recall);
}

/**
 * Menghitung Average Precision
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
 * Evaluasi query dengan algoritma tertentu
 */
async function evaluateQueryWithAlgorithm(
  userQuery: string,
  groundTruth: GroundTruthQuery,
  similarity: number,
  searchFunction: (query: string, topK: number) => Promise<any[]>,
  topK: number = 50
): Promise<QueryEvaluationResult> {
  try {
    // Ambil hasil pencarian
    const searchResults = await searchFunction(userQuery, topK);

    // Extract doc_id from search results
    const retrievedDocs = searchResults.map(result => {
      const docIdStr = result.doc_id || result.id || '';
      const docIdNum = parseInt(docIdStr.toString().replace(/\D/g, ''), 10);
      return isNaN(docIdNum) ? 0 : docIdNum;
    }).filter(id => id >= 0); // Include id 0

    const relevantDocs = groundTruth.relevantDocs;

    // Hitung dokumen relevan yang berhasil diambil
    const relevantRetrieved = retrievedDocs.filter(doc => relevantDocs.includes(doc));

    // Hitung metrics
    const precision = calculatePrecision(retrievedDocs, relevantDocs);
    const recall = calculateRecall(retrievedDocs, relevantDocs);
    const f1Score = calculateF1Score(precision, recall);
    const averagePrecision = calculateAveragePrecision(retrievedDocs, relevantDocs);

    console.log(`Retrieved docs sample (first 10):`, retrievedDocs.slice(0, 10));
    console.log(`Relevant docs sample (first 10):`, relevantDocs.slice(0, 10));
    console.log(`Relevant retrieved:`, relevantRetrieved.length, 'out of', relevantDocs.length);

    return {
      query: userQuery,
      matchedGroundTruth: groundTruth.query,
      similarity,
      precision,
      recall,
      f1Score,
      averagePrecision,
      retrievedDocs,
      relevantDocs,
      relevantRetrieved
    };
  } catch (error) {
    console.error(`Error evaluating query "${userQuery}":`, error);
    return {
      query: userQuery,
      matchedGroundTruth: groundTruth.query,
      similarity,
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

export async function POST(request: Request) {
  try {
    const { query, topK = 50 } = await request.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required and must be a string' },
        { status: 400 }
      );
    }

    // Load ground truth data
    const groundTruthData = await loadGroundTruth();

    // Cari ground truth query yang paling mirip
    const { groundTruth, similarity } = findMostSimilarGroundTruth(query, groundTruthData);

    console.log(`Evaluating query: "${query}"`);
    console.log(`Matched with ground truth: "${groundTruth.query}" (similarity: ${similarity.toFixed(2)})`);

    // Evaluasi dengan kedua algoritma
    const tfidfResult = await evaluateQueryWithAlgorithm(
      query,
      groundTruth,
      similarity,
      tfidfSearchAsync,
      topK
    );

    const bm25Result = await evaluateQueryWithAlgorithm(
      query,
      groundTruth,
      similarity,
      bm25SearchAsync,
      topK
    );

    console.log('TF-IDF Results:', {
      precision: tfidfResult.precision.toFixed(4),
      recall: tfidfResult.recall.toFixed(4),
      f1Score: tfidfResult.f1Score.toFixed(4),
      avgPrecision: tfidfResult.averagePrecision.toFixed(4),
      retrievedCount: tfidfResult.retrievedDocs.length,
      relevantRetrievedCount: tfidfResult.relevantRetrieved.length
    });

    console.log('BM25 Results:', {
      precision: bm25Result.precision.toFixed(4),
      recall: bm25Result.recall.toFixed(4),
      f1Score: bm25Result.f1Score.toFixed(4),
      avgPrecision: bm25Result.averagePrecision.toFixed(4),
      retrievedCount: bm25Result.retrievedDocs.length,
      relevantRetrievedCount: bm25Result.relevantRetrieved.length
    });

    const result: EvaluationResult = {
      tfidf: tfidfResult,
      bm25: bm25Result,
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in evaluate-query API:', error);
    return NextResponse.json(
      { error: 'Failed to evaluate query' },
      { status: 500 }
    );
  }
}
