import {
  processQuery,
  getPreprocessedCorpus,
  getInvertedIndex,
  getDocumentsWithTerm,
  getDocumentFrequency,
  getDocumentLength,
  getTotalDocuments,
  getAverageDocumentLength,
  getDocumentTokens,
  type ProcessedDocument,
} from '../preprocessing';

export interface SearchResult {
  doc_id: string;
  score: number;
  document: ProcessedDocument;
}

export class BM25SearchEngine {
  private corpus: ProcessedDocument[];
  private totalDocs: number;
  private avgDocLength: number;
  private k1: number;
  private b: number;

  constructor(k1: number = 1.5, b: number = 0.75) {
    this.corpus = getPreprocessedCorpus();
    this.totalDocs = getTotalDocuments();
    this.avgDocLength = getAverageDocumentLength();
    this.k1 = k1;
    this.b = b;
  }

  private calculateIDF(term: string): number {
    const df = getDocumentFrequency(term);
    return Math.log((this.totalDocs - df + 0.5) / (df + 0.5) + 1);
  }

  private getTermFrequency(term: string, docId: number): number {
    const tokens = getDocumentTokens(docId);
    return tokens.filter(t => t === term.toLowerCase()).length;
  }

  private calculateTitleMatchBonus(query: string, title: string): number {
    const queryLower = query.toLowerCase();
    const titleLower = title.toLowerCase();
    const queryWords = queryLower.split(/\s+/).filter(w => w.length > 0);
    const titleWords = titleLower.split(/\s+/);
    
    // Check for exact phrase match in title
    if (titleLower.includes(queryLower)) {
      return 2.0; // 200% boost for exact phrase match
    }
    
    // Count matching words
    let matchCount = 0;
    for (const qWord of queryWords) {
      if (titleWords.some(tWord => tWord.includes(qWord) || qWord.includes(tWord))) {
        matchCount++;
      }
    }
    
    const matchRatio = matchCount / queryWords.length;
    
    // Return boost based on match ratio
    if (matchRatio >= 0.9) return 1.5;  // 150% boost for near-perfect match
    if (matchRatio >= 0.7) return 1.0;  // 100% boost for good match
    if (matchRatio >= 0.5) return 0.5;  // 50% boost for partial match
    if (matchRatio >= 0.3) return 0.25; // 25% boost for weak match
    
    return 0; // No boost
  }

  private calculateBM25Score(queryTerms: string[], docId: number): number {
    let score = 0.0;
    const docLength = getDocumentLength(docId);

    for (const term of new Set(queryTerms)) {
      const tf = this.getTermFrequency(term, docId);

      if (tf > 0) {
        const idf = this.calculateIDF(term);

        // Length normalization
        const norm = 1 - this.b + this.b * (docLength / this.avgDocLength);

        // BM25 formula
        const bm25Component = (tf * (this.k1 + 1)) / (tf + this.k1 * norm);

        score += idf * bm25Component;
      }
    }

    return score;
  }

  search(query: string, topK: number = 50): SearchResult[] {
    // Preprocess query using simple tokenization
    const queryTerms = processQuery(query);

    if (queryTerms.length === 0) {
      return [];
    }

    // Get candidate documents from inverted index
    const candidateDocs = new Set<number>();
    for (const term of queryTerms) {
      const docsWithTerm = getDocumentsWithTerm(term);
      docsWithTerm.forEach(docId => candidateDocs.add(docId));
    }

    // Calculate BM25 scores with title boost
    const scores: SearchResult[] = [];
    for (const docId of candidateDocs) {
      let score = this.calculateBM25Score(queryTerms, docId);
      if (score > 0) {
        const doc = this.corpus.find(d => d.id === docId);
        if (doc) {
          // Apply title boost (using original query, not preprocessed)
          const titleBoost = this.calculateTitleMatchBonus(query, doc.title);
          score *= (1 + titleBoost);
          
          scores.push({
            doc_id: String(docId),
            score: score,
            document: doc,
          });
        }
      }
    }

    // Sort by score (descending)
    scores.sort((a, b) => b.score - a.score);

    return scores.slice(0, topK);
  }
}

// Helper function for easy search
export function bm25Search(query: string, topK: number = 50, k1: number = 1.5, b: number = 0.75): SearchResult[] {
  const engine = new BM25SearchEngine(k1, b);
  return engine.search(query, topK);
}

// Async wrapper for evaluation
export async function bm25SearchAsync(query: string, topK: number = 50): Promise<SearchResult[]> {
  return bm25Search(query, topK);
}
