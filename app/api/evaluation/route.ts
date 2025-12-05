import { NextResponse } from 'next/server';
import { evaluateSearchEngines, formatEvaluationResults } from '@/lib/evaluation/evaluator';

/**
 * API Route untuk mendapatkan hasil evaluasi search engine
 * GET /api/evaluation
 * 
 * Query Parameters:
 * - topK: jumlah dokumen top yang diambil untuk evaluasi (default: 20)
 * - format: 'json' atau 'text' (default: 'json')
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const topK = parseInt(searchParams.get('topK') || '20');
    const format = searchParams.get('format') || 'json';
    
    console.log(`Running evaluation with topK=${topK}...`);
    
    // Jalankan evaluasi
    const results = await evaluateSearchEngines(topK);
    
    if (format === 'text') {
      const formattedResults = formatEvaluationResults(results);
      return new NextResponse(formattedResults, {
        headers: {
          'Content-Type': 'text/plain',
        },
      });
    }
    
    // Return JSON format
    return NextResponse.json({
      success: true,
      data: results,
      message: 'Evaluation completed successfully'
    });
    
  } catch (error) {
    console.error('Error during evaluation:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to run evaluation',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
