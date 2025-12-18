import preprocessedCorpus from '@/preprocessing/dataset/preprocessed_corpus.json';
import invertedIndex from '@/preprocessing/dataset/inverted_index.json';

// Type definitions
export interface ProcessedDocument {
  id: number;
  title: string;
  url: string;
  source: string;
  original_content: string;
  content: string;
  cleaned_content: string;
  processed_text: string;
  tokens: string[];
  token_count: number;
  image: string;
  published_date?: string;
}

export interface InvertedIndexData {
  inverted_index: {
    [term: string]: Array<{
      doc_id: number;
      position: number;
    }>;
  };
  doc_lengths: {
    [docId: string]: number;
  };
  doc_freq: {
    [term: string]: number;
  };
  total_docs: number;
  avg_doc_length: number;
}

/**
 * Get preprocessed corpus with tokens
 */
export function getPreprocessedCorpus(): ProcessedDocument[] {
  return preprocessedCorpus as ProcessedDocument[];
}

/**
 * Get inverted index data
 */
export function getInvertedIndex(): InvertedIndexData {
  return invertedIndex as InvertedIndexData;
}

/**
 * Get document by ID
 */
export function getDocumentById(docId: number): ProcessedDocument | null {
  const corpus = getPreprocessedCorpus();
  return corpus.find(doc => doc.id === docId) || null;
}

/**
 * Get document tokens (already preprocessed with stemming)
 */
export function getDocumentTokens(docId: number): string[] {
  const doc = getDocumentById(docId);
  return doc?.tokens || [];
}

/**
 * Get documents containing a term from inverted index
 */
export function getDocumentsWithTerm(term: string): number[] {
  const index = getInvertedIndex();
  const postings = index.inverted_index[term.toLowerCase()] || [];
  // Extract unique doc_ids from postings
  return [...new Set(postings.map(p => p.doc_id))];
}

/**
 * Get document frequency for a term
 */
export function getDocumentFrequency(term: string): number {
  const index = getInvertedIndex();
  return index.doc_freq[term.toLowerCase()] || 0;
}

/**
 * Get document length
 */
export function getDocumentLength(docId: number): number {
  const index = getInvertedIndex();
  return index.doc_lengths[docId.toString()] || 0;
}

/**
 * Get total number of documents
 */
export function getTotalDocuments(): number {
  const index = getInvertedIndex();
  return index.total_docs;
}

/**
 * Get average document length
 */
export function getAverageDocumentLength(): number {
  const index = getInvertedIndex();
  return index.avg_doc_length;
}

/**
 * Process query (simple tokenization for matching with preprocessed tokens)
 */
export function processQuery(query: string): string[] {
  // Simple preprocessing to match with preprocessed corpus
  // The corpus tokens are already stemmed and cleaned
  return query
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .filter(token => token.length > 0);
}

/**
 * Calculate IDF for a term
 */
export function calculateIDF(term: string): number {
  const totalDocs = getTotalDocuments();
  const docFreq = getDocumentFrequency(term);
  
  if (docFreq === 0) return 0;
  
  return Math.log(totalDocs / docFreq);
}

/**
 * Get term frequency in a document
 */
export function getTermFrequency(term: string, docId: number): number {
  const tokens = getDocumentTokens(docId);
  return tokens.filter(t => t === term.toLowerCase()).length;
}

/**
 * Get corpus statistics
 */
export function getCorpusStatistics() {
  const corpus = getPreprocessedCorpus();
  const index = getInvertedIndex();
  
  return {
    totalDocuments: index.total_docs,
    totalUniqueTerms: Object.keys(index.inverted_index).length,
    averageDocumentLength: index.avg_doc_length,
    vocabularySize: Object.keys(index.doc_freq).length,
  };
}
