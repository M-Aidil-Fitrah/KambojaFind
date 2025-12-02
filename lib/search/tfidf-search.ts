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

export class TFIDFSearchEngine {
  private invertedIndex: InvertedIndex;
  private docLengths: { [doc_id: string]: number };
  private docFreq: { [term: string]: number };
  private totalDocs: number;
  private docMap: Map<string, Document>;

  constructor(indexData: IndexData, corpus: Document[]) {
    this.invertedIndex = indexData.inverted_index;
    this.docLengths = indexData.doc_lengths;
    this.docFreq = indexData.doc_freq;
    this.totalDocs = indexData.total_docs;

    // Create doc_id to document mapping
    this.docMap = new Map();
    corpus.forEach((doc, idx) => {
      const docId = doc.id || doc._id || doc.url || `doc_${idx}`;
      this.docMap.set(docId, doc);
    });
  }

  private calculateTF(termFreq: number, docLength: number): number {
    if (docLength === 0) return 0;
    return termFreq / docLength;
  }

  private calculateIDF(term: string): number {
    const df = this.docFreq[term] || 0;
    if (df === 0) return 0;
    return Math.log(this.totalDocs / df);
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

  private calculateTFIDFScore(queryTerms: string[], docId: string): number {
    let score = 0.0;
    const docLength = this.docLengths[docId] || 1;

    // Count term frequency in query
    const queryTermCounts = new Map<string, number>();
    queryTerms.forEach(term => {
      queryTermCounts.set(term, (queryTermCounts.get(term) || 0) + 1);
    });

    const uniqueQueryTerms = Array.from(new Set(queryTerms));

    for (const term of uniqueQueryTerms) {
      if (this.invertedIndex[term]) {
        const termFreqInDoc = this.getTermFrequency(term, docId);

        if (termFreqInDoc > 0) {
          const tf = this.calculateTF(termFreqInDoc, docLength);
          const idf = this.calculateIDF(term);

          // TF-IDF weight for query term
          const queryWeight = (queryTermCounts.get(term) || 0) / queryTerms.length;

          // Cosine similarity component
          score += (tf * idf) * (queryWeight * idf);
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

    // Calculate scores
    const scores: SearchResult[] = [];
    for (const docId of candidateDocs) {
      const score = this.calculateTFIDFScore(queryTerms, docId);
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
