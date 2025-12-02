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


class TFIDFSearchEngine:
    """Vector Space Model dengan TF-IDF untuk information retrieval"""
    
    def __init__(self, inverted_index_path, corpus_path):
        """Initialize search engine dengan index dan corpus"""
        # Load inverted index
        with open(inverted_index_path, 'r', encoding='utf-8') as f:
            index_data = json.load(f)
        
        self.inverted_index = index_data['inverted_index']
        self.doc_lengths = index_data['doc_lengths']
        self.doc_freq = index_data['doc_freq']
        self.total_docs = index_data['total_docs']
        
        # Load corpus untuk mendapatkan dokumen asli
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
        # Clean
        cleaned = self.cleaner.clean_text(query)
        
        # Tokenize
        tokens = self.tokenizer.tokenize(cleaned)
        
        # Remove stopwords
        tokens = self.stopword_remover.remove_stopwords(tokens)
        
        # Stem
        stemmed_tokens = self.stemmer.stem_tokens(tokens)
        
        return stemmed_tokens
    
    def calculate_tf(self, term_freq, doc_length):
        """Calculate TF (Term Frequency) dengan normalization"""
        if doc_length == 0:
            return 0
        return term_freq / doc_length
    
    def calculate_idf(self, term):
        """Calculate IDF (Inverse Document Frequency)"""
        df = self.doc_freq.get(term, 0)
        if df == 0:
            return 0
        return math.log(self.total_docs / df)
    
    def calculate_tfidf_score(self, query_terms, doc_id):
        """Calculate TF-IDF score untuk dokumen"""
        score = 0.0
        doc_length = self.doc_lengths.get(doc_id, 1)
        
        # Hitung term frequency di query
        query_term_counts = Counter(query_terms)
        
        for term in set(query_terms):
            if term in self.inverted_index:
                # Hitung TF di dokumen
                term_freq_in_doc = 0
                for posting in self.inverted_index[term]:
                    if posting['doc_id'] == doc_id:
                        term_freq_in_doc += 1
                
                if term_freq_in_doc > 0:
                    tf = self.calculate_tf(term_freq_in_doc, doc_length)
                    idf = self.calculate_idf(term)
                    
                    # TF-IDF weight untuk query term
                    query_weight = query_term_counts[term] / len(query_terms)
                    
                    # Cosine similarity component
                    score += (tf * idf) * (query_weight * idf)
        
        return score
    
    def search(self, query, top_k=10):
        """Search dengan TF-IDF ranking"""
        # Preprocess query
        query_terms = self.preprocess_query(query)
        
        if not query_terms:
            return []
        
        # Get candidate documents (yang mengandung minimal 1 query term)
        candidate_docs = set()
        for term in query_terms:
            if term in self.inverted_index:
                for posting in self.inverted_index[term]:
                    candidate_docs.add(posting['doc_id'])
        
        # Calculate scores
        scores = []
        for doc_id in candidate_docs:
            score = self.calculate_tfidf_score(query_terms, doc_id)
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
    # Test TF-IDF search
    index_path = '../dataset/inverted_index.json'
    corpus_path = '../dataset/stemmed_corpus.json'
    
    print("Loading TF-IDF search engine...")
    engine = TFIDFSearchEngine(index_path, corpus_path)
    
    # Test queries
    test_queries = [
        "perang di Myanmar",
        "konflik etnis Rohingya",
        "junta militer kudeta",
    ]
    
    print("\n" + "="*60)
    print("TF-IDF SEARCH ENGINE TEST")
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
