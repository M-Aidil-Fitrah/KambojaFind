import { NextResponse } from 'next/server';
import invertedIndexData from '@/preprocessing/dataset/inverted_index.json';

export async function GET() {
  try {
    const indexData = invertedIndexData as any;

    return NextResponse.json({
      total_documents: indexData.total_docs || 0,
      total_terms: Object.keys(indexData.inverted_index || {}).length,
      avg_doc_length: indexData.avg_doc_length || 0,
      algorithms: ['TF-IDF', 'BM25'],
    });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
