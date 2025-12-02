import { preprocessQuery } from '../preprocessing';

interface Posting {
  doc_id: string;
  position: number;
}

interface InvertedIndex {
  [term: string]: Posting[];
}

interface IndexData {
  inverted_index: InvertedIndex;
  doc_lengths: { [doc_id: string]: number };
  doc_freq: { [term: string]: number };
  total_docs: number;
  avg_doc_length: number;
}

interface Document {
  id?: string;
  _id?: string;
  url?: string;
  title?: string;
  content?: string;
  cleaned_content?: string;
  [key: string]: any;
}

export interface SearchResult {
  doc_id: string;
  score: number;
  document: Document;
}

export class BM25SearchEngine {
  private invertedIndex: InvertedIndex;
  private docLengths: { [doc_id: string]: number };
  private docFreq: { [term: string]: number };
  private totalDocs: number;
  private avgDocLength: number;
  private k1: number;
  private b: number;
  private docMap: Map<string, Document>;

  constructor(indexData: IndexData, corpus: Document[], k1: number = 1.5, b: number = 0.75) {
    this.invertedIndex = indexData.inverted_index;
    this.docLengths = indexData.doc_lengths;
    this.docFreq = indexData.doc_freq;
    this.totalDocs = indexData.total_docs;
    this.avgDocLength = indexData.avg_doc_length;
    this.k1 = k1;
    this.b = b;

    // Create doc_id to document mapping
    this.docMap = new Map();
    corpus.forEach((doc, idx) => {
      const docId = doc.id || doc._id || doc.url || `doc_${idx}`;
      this.docMap.set(docId, doc);
    });
  }

  private calculateIDF(term: string): number {
    const df = this.docFreq[term] || 0;
    return Math.log((this.totalDocs - df + 0.5) / (df + 0.5) + 1);
  }

  private getTermFrequency(term: string, docId: string): number {
    if (!this.invertedIndex[term]) return 0;

    let count = 0;
    for (const posting of this.invertedIndex[term]) {
      if (posting.doc_id === docId) {
        count += 1;
      }
    }
    return count;
  }

  private calculateBM25Score(queryTerms: string[], docId: string): number {
    let score = 0.0;
    const docLength = this.docLengths[docId] || 0;

    for (const term of new Set(queryTerms)) {
      if (this.invertedIndex[term]) {
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
    }

    return score;
  }

  search(query: string, topK: number = 10): SearchResult[] {
    // Preprocess query
    const queryTerms = preprocessQuery(query);

    if (queryTerms.length === 0) {
      return [];
    }

    // Get candidate documents
    const candidateDocs = new Set<string>();
    for (const term of queryTerms) {
      if (this.invertedIndex[term]) {
        for (const posting of this.invertedIndex[term]) {
          candidateDocs.add(posting.doc_id);
        }
      }
    }

    // Calculate BM25 scores
    const scores: SearchResult[] = [];
    for (const docId of candidateDocs) {
      const score = this.calculateBM25Score(queryTerms, docId);
      if (score > 0) {
        scores.push({
          doc_id: docId,
          score: score,
          document: this.docMap.get(docId) || {},
        });
      }
    }

    // Sort by score (descending)
    scores.sort((a, b) => b.score - a.score);

    return scores.slice(0, topK);
  }
}
