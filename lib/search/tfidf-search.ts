import {
  processQuery,
  getPreprocessedCorpus,
  getInvertedIndex,
  getDocumentsWithTerm,
  getDocumentFrequency,
  getDocumentLength,
  getTotalDocuments,
  getDocumentTokens,
  type ProcessedDocument,
} from '../preprocessing';

export interface SearchResult {
  doc_id: string;
  score: number;
  document: ProcessedDocument;
}

export class TFIDFSearchEngine {
  private corpus: ProcessedDocument[];
  private totalDocs: number;

  constructor() {
    this.corpus = getPreprocessedCorpus();
    this.totalDocs = getTotalDocuments();
  }

  private calculateTF(termFreq: number, docLength: number): number {
    if (docLength === 0) return 0;
    return termFreq / docLength;
  }

  private calculateIDF(term: string): number {
    const df = getDocumentFrequency(term);
    if (df === 0) return 0;
    return Math.log(this.totalDocs / df);
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

  private calculateTFIDFScore(queryTerms: string[], docId: number): number {
    let score = 0.0;
    const docLength = getDocumentLength(docId);

    // Count term frequency in query
    const queryTermCounts = new Map<string, number>();
    queryTerms.forEach(term => {
      queryTermCounts.set(term, (queryTermCounts.get(term) || 0) + 1);
    });

    const uniqueQueryTerms = Array.from(new Set(queryTerms));

    for (const term of uniqueQueryTerms) {
      const termFreqInDoc = this.getTermFrequency(term, docId);

      if (termFreqInDoc > 0) {
        const tf = this.calculateTF(termFreqInDoc, docLength);
        const idf = this.calculateIDF(term);

        // TF-IDF weight for query term
        const queryTermWeight = queryTermCounts.get(term) || 1;
        score += tf * idf * queryTermWeight;
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

    // Calculate scores with title boost
    const scores: SearchResult[] = [];
    for (const docId of candidateDocs) {
      let score = this.calculateTFIDFScore(queryTerms, docId);
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
export function tfidfSearch(query: string, topK: number = 50): SearchResult[] {
  const engine = new TFIDFSearchEngine();
  return engine.search(query, topK);
}

// Async wrapper for evaluation
export async function tfidfSearchAsync(query: string, topK: number = 50): Promise<SearchResult[]> {
  return tfidfSearch(query, topK);
}
