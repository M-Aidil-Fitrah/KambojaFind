import { NextRequest, NextResponse } from 'next/server';
import { TFIDFSearchEngine } from '@/lib/search/tfidf-search';
import { BM25SearchEngine } from '@/lib/search/bm25-search';
import invertedIndexData from '@/preprocessing/dataset/inverted_index.json';
import corpusData from '@/preprocessing/dataset/stemmed_corpus.json';

// Initialize search engines (cached)
let tfidfEngine: TFIDFSearchEngine | null = null;
let bm25Engine: BM25SearchEngine | null = null;

function getEngines() {
  if (!tfidfEngine || !bm25Engine) {
    tfidfEngine = new TFIDFSearchEngine(invertedIndexData as any, corpusData as any);
    bm25Engine = new BM25SearchEngine(invertedIndexData as any, corpusData as any);
  }
  return { tfidfEngine, bm25Engine };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, algorithm = 'both', top_k = 10 } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    const { tfidfEngine, bm25Engine } = getEngines();
    const results: any = {};

    if (algorithm === 'tfidf' || algorithm === 'both') {
      results.tfidf = tfidfEngine.search(query, top_k);
    }

    if (algorithm === 'bm25' || algorithm === 'both') {
      results.bm25 = bm25Engine.search(query, top_k);
    }

    return NextResponse.json({
      query,
      results,
      total_results: {
        tfidf: results.tfidf?.length || 0,
        bm25: results.bm25?.length || 0,
      },
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
