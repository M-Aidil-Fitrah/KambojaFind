import { NextRequest, NextResponse } from 'next/server';
import corpusData from '@/preprocessing/dataset/filtered_corpus.json';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';

    if (!query || query.length < 2) {
      return NextResponse.json({ suggestions: [] });
    }

    const queryLower = query.toLowerCase();
    
    // Get unique titles and important keywords from corpus
    const suggestions = new Set<string>();
    
    // Add matching article titles
    corpusData.forEach((doc: any) => {
      if (doc.title) {
        const titleLower = doc.title.toLowerCase();
        if (titleLower.includes(queryLower)) {
          suggestions.add(doc.title);
        }
      }
    });

    // Extract important keywords that match
    const keywords = new Set<string>();
    corpusData.forEach((doc: any) => {
      if (doc.title) {
        const words = doc.title.toLowerCase().split(/\s+/);
        words.forEach(word => {
          // Only add words that are longer than 3 characters and start with query
          if (word.length > 3 && word.startsWith(queryLower)) {
            keywords.add(word.charAt(0).toUpperCase() + word.slice(1));
          }
        });
      }
    });

    // Combine and limit results
    const combinedSuggestions = [
      ...Array.from(suggestions).slice(0, 5),
      ...Array.from(keywords).slice(0, 3)
    ].slice(0, 8);

    return NextResponse.json({
      query,
      suggestions: combinedSuggestions,
    });
  } catch (error) {
    console.error('Suggestions error:', error);
    return NextResponse.json(
      { error: 'Internal server error', suggestions: [] },
      { status: 500 }
    );
  }
}
