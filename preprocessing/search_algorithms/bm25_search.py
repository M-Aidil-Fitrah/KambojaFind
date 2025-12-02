import json
import math
from collections import Counter
import sys
import os

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from indexing.stemmer import IndonesianStemmer
from indexing.tokenizer import Tokenizer
from indexing.text_cleaner import TextCleaner
from indexing.stopword_remover import StopwordRemover


class BM25SearchEngine:
    """BM25 (Okapi BM25) untuk information retrieval"""
    
    def __init__(self, inverted_index_path, corpus_path, k1=1.5, b=0.75):
        """
        Initialize BM25 search engine
        
        Parameters:
        - k1: term frequency saturation parameter (default: 1.5)
        - b: length normalization parameter (default: 0.75)
        """
        # Load inverted index
        with open(inverted_index_path, 'r', encoding='utf-8') as f:
            index_data = json.load(f)
        
        self.inverted_index = index_data['inverted_index']
        self.doc_lengths = index_data['doc_lengths']
        self.doc_freq = index_data['doc_freq']
        self.total_docs = index_data['total_docs']
        self.avg_doc_length = index_data['avg_doc_length']
        
        # BM25 parameters
        self.k1 = k1
        self.b = b
        
        # Load corpus
        with open(corpus_path, 'r', encoding='utf-8') as f:
            self.corpus = json.load(f)
        
        # Create doc_id to document mapping
        self.doc_map = {}
        for doc in self.corpus:
            doc_id = doc.get('id') or doc.get('_id') or doc.get('url', f"doc_{self.corpus.index(doc)}")
            self.doc_map[doc_id] = doc
        
        # Initialize preprocessors
        self.cleaner = TextCleaner()
        self.tokenizer = Tokenizer()
        self.stopword_remover = StopwordRemover()
        self.stemmer = IndonesianStemmer()
    
    def preprocess_query(self, query):
        """Preprocess query sama seperti dokumen"""
        cleaned = self.cleaner.clean_text(query)
        tokens = self.tokenizer.tokenize(cleaned)
        tokens = self.stopword_remover.remove_stopwords(tokens)
        stemmed_tokens = self.stemmer.stem_tokens(tokens)
        return stemmed_tokens
    
    def calculate_idf(self, term):
        """
        Calculate IDF (Inverse Document Frequency) untuk BM25
        IDF = log((N - df + 0.5) / (df + 0.5) + 1)
        """
        df = self.doc_freq.get(term, 0)
        return math.log((self.total_docs - df + 0.5) / (df + 0.5) + 1)
    
    def get_term_frequency(self, term, doc_id):
        """Get term frequency dalam dokumen"""
        if term not in self.inverted_index:
            return 0
        
        count = 0
        for posting in self.inverted_index[term]:
            if posting['doc_id'] == doc_id:
                count += 1
        return count
    
    def calculate_bm25_score(self, query_terms, doc_id):
        """
        Calculate BM25 score untuk dokumen
        
        BM25 formula:
        score = Σ IDF(qi) * (f(qi, D) * (k1 + 1)) / (f(qi, D) + k1 * (1 - b + b * |D| / avgdl))
        
        where:
        - qi: query term
        - f(qi, D): frequency of qi in document D
        - |D|: length of document D
        - avgdl: average document length
        """
        score = 0.0
        doc_length = self.doc_lengths.get(doc_id, 0)
        
        for term in set(query_terms):
            if term in self.inverted_index:
                # Get term frequency dalam dokumen
                tf = self.get_term_frequency(term, doc_id)
                
                if tf > 0:
                    # Calculate IDF
                    idf = self.calculate_idf(term)
                    
                    # Length normalization
                    norm = 1 - self.b + self.b * (doc_length / self.avg_doc_length)
                    
                    # BM25 formula
                    bm25_component = (tf * (self.k1 + 1)) / (tf + self.k1 * norm)
                    
                    score += idf * bm25_component
        
        return score
    
    def search(self, query, top_k=10):
        """Search dengan BM25 ranking"""
        # Preprocess query
        query_terms = self.preprocess_query(query)
        
        if not query_terms:
            return []
        
        # Get candidate documents
        candidate_docs = set()
        for term in query_terms:
            if term in self.inverted_index:
                for posting in self.inverted_index[term]:
                    candidate_docs.add(posting['doc_id'])
        
        # Calculate BM25 scores
        scores = []
        for doc_id in candidate_docs:
            score = self.calculate_bm25_score(query_terms, doc_id)
            if score > 0:
                scores.append({
                    'doc_id': doc_id,
                    'score': score,
                    'document': self.doc_map.get(doc_id, {})
                })
        
        # Sort by score (descending)
        scores.sort(key=lambda x: x['score'], reverse=True)
        
        return scores[:top_k]


if __name__ == "__main__":
    # Test BM25 search
    index_path = '../dataset/inverted_index.json'
    corpus_path = '../dataset/stemmed_corpus.json'
    
    print("Loading BM25 search engine...")
    engine = BM25SearchEngine(index_path, corpus_path)
    
    # Test queries
    test_queries = [
        "perang di Myanmar",
        "konflik etnis Rohingya",
        "junta militer kudeta",
    ]
    
    print("\n" + "="*60)
    print("BM25 SEARCH ENGINE TEST")
    print("="*60)
    
    for query in test_queries:
        print(f"\nQuery: '{query}'")
        print("-" * 60)
        
        results = engine.search(query, top_k=5)
        
        if results:
            for i, result in enumerate(results, 1):
                print(f"\n{i}. Score: {result['score']:.4f}")
                print(f"   Title: {result['document'].get('title', 'N/A')[:80]}")
                print(f"   URL: {result['document'].get('url', 'N/A')[:80]}")
        else:
            print("No results found.")
