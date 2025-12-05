"""
Script untuk generate ground truth data secara otomatis
Menggunakan TF-IDF similarity untuk menentukan relevansi dokumen terhadap query
"""

import json
import math
from collections import Counter
from pathlib import Path

# 21 Query patokan untuk evaluasi
GROUND_TRUTH_QUERIES = [
    {
        "query": "WNI Kamboja penipuan",
        "description": "WNI yang terlibat kasus penipuan di Kamboja"
    },
    {
        "query": "penipuan online Kamboja",
        "description": "Kasus penipuan online/daring yang melibatkan WNI di Kamboja"
    },
    {
        "query": "WNI korban Kamboja",
        "description": "WNI yang menjadi korban di Kamboja"
    },
    {
        "query": "cyber crime Kamboja",
        "description": "Kejahatan siber yang melibatkan WNI di Kamboja"
    },
    {
        "query": "human trafficking Kamboja Indonesia",
        "description": "Perdagangan manusia antara Indonesia dan Kamboja"
    },
    {
        "query": "TKI Kamboja terjerat",
        "description": "Tenaga Kerja Indonesia yang terjerat masalah di Kamboja"
    },
    {
        "query": "repatriasi WNI Kamboja",
        "description": "Pemulangan WNI dari Kamboja"
    },
    {
        "query": "judi online Kamboja Indonesia",
        "description": "Kasus judi online yang melibatkan WNI di Kamboja"
    },
    {
        "query": "scam Kamboja",
        "description": "Kasus penipuan (scam) di Kamboja"
    },
    {
        "query": "perdagangan manusia Kamboja",
        "description": "Kasus perdagangan manusia di Kamboja"
    },
    {
        "query": "WNI dipulangkan Kamboja",
        "description": "WNI yang dipulangkan dari Kamboja"
    },
    {
        "query": "sindikat penipuan Kamboja",
        "description": "Sindikat penipuan yang beroperasi di Kamboja"
    },
    {
        "query": "WNI tertipu Kamboja",
        "description": "WNI yang tertipu janji kerja di Kamboja"
    },
    {
        "query": "eksploitasi TKI Kamboja",
        "description": "Eksploitasi terhadap TKI di Kamboja"
    },
    {
        "query": "mafia Kamboja Indonesia",
        "description": "Jaringan mafia yang beroperasi antara Kamboja dan Indonesia"
    },
    {
        "query": "pekerja migran Kamboja",
        "description": "Pekerja migran Indonesia di Kamboja"
    },
    {
        "query": "WNI terjebak Kamboja",
        "description": "WNI yang terjebak di Kamboja"
    },
    {
        "query": "kasus WNI Kamboja",
        "description": "Berbagai kasus yang menimpa WNI di Kamboja"
    },
    {
        "query": "deportasi WNI Kamboja",
        "description": "Deportasi WNI dari Kamboja"
    },
    {
        "query": "imigrasi Kamboja Indonesia",
        "description": "Masalah imigrasi antara Kamboja dan Indonesia"
    },
    {
        "query": "paspor palsu Kamboja",
        "description": "Kasus pemalsuan paspor terkait WNI di Kamboja"
    }
]


class GroundTruthGenerator:
    def __init__(self, corpus_path, inverted_index_path):
        """Initialize generator dengan corpus dan inverted index"""
        self.corpus_path = Path(corpus_path)
        self.inverted_index_path = Path(inverted_index_path)
        self.corpus = []
        self.inverted_index = {}
        self.idf_scores = {}
        self.total_docs = 0
        
    def load_data(self):
        """Load corpus dan inverted index"""
        print("Loading preprocessed corpus...")
        with open(self.corpus_path, 'r', encoding='utf-8') as f:
            self.corpus = json.load(f)
        self.total_docs = len(self.corpus)
        print(f"Loaded {self.total_docs} documents")
        
        print("Loading inverted index...")
        with open(self.inverted_index_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            # Inverted index dalam format {"inverted_index": {...}}
            self.inverted_index = data.get('inverted_index', {})
        print(f"Loaded inverted index with {len(self.inverted_index)} terms")
        
    def calculate_idf(self):
        """Calculate IDF scores untuk semua term"""
        print("Calculating IDF scores...")
        for term, posting_list in self.inverted_index.items():
            # posting_list adalah array of {doc_id, position}
            # Ambil unique doc_ids
            unique_docs = set(item['doc_id'] for item in posting_list)
            doc_freq = len(unique_docs)
            self.idf_scores[term] = math.log((self.total_docs + 1) / (doc_freq + 1)) + 1
        
    def get_doc_term_frequency(self, doc_id):
        """Get term frequency untuk dokumen tertentu"""
        doc = self.corpus[doc_id]
        tokens = doc.get('tokens', [])
        return Counter(tokens)
    
    def calculate_tfidf_score(self, query_terms, doc_id):
        """Calculate TF-IDF score untuk dokumen terhadap query"""
        doc_tf = self.get_doc_term_frequency(doc_id)
        score = 0.0
        
        for term in query_terms:
            if term in doc_tf:
                tf = doc_tf[term]
                idf = self.idf_scores.get(term, 0)
                score += tf * idf
                
        return score
    
    def preprocess_query(self, query):
        """Simple preprocessing untuk query (lowercase dan split)"""
        return query.lower().split()
    
    def find_relevant_docs(self, query, min_score=0.3, top_k=100):
        """
        Find relevant documents untuk query
        
        Args:
            query: Query string
            min_score: Minimum score threshold (default 0.3 untuk filter dokumen relevan)
            top_k: Maximum number of documents to return (default 100)
            
        Returns:
            List of relevant document IDs
        """
        print(f"\nProcessing query: '{query}'")
        query_terms = self.preprocess_query(query)
        
        # Calculate score untuk setiap dokumen
        doc_scores = []
        for doc_id in range(self.total_docs):
            score = self.calculate_tfidf_score(query_terms, doc_id)
            if score > min_score:
                doc_scores.append((doc_id, score))
        
        # Sort by score descending
        doc_scores.sort(key=lambda x: x[1], reverse=True)
        
        # Limit to top_k
        if top_k is not None:
            doc_scores = doc_scores[:top_k]
        
        relevant_docs = [doc_id for doc_id, score in doc_scores]
        
        print(f"Found {len(relevant_docs)} relevant documents (min_score={min_score}, top_k={top_k})")
        if relevant_docs:
            print(f"Score range: {doc_scores[0][1]:.4f} - {doc_scores[-1][1]:.4f}")
        
        return relevant_docs
    
    def generate_ground_truth(self, min_score=0.3, top_k=100):
        """
        Generate ground truth untuk semua 21 query
        
        Args:
            min_score: Minimum relevance score (default 0.3 untuk filter dokumen relevan)
            top_k: Maximum documents per query (default 100)
            
        Returns:
            List of ground truth data
        """
        ground_truth = []
        
        for query_data in GROUND_TRUTH_QUERIES:
            query = query_data['query']
            description = query_data['description']
            
            relevant_docs = self.find_relevant_docs(query, min_score, top_k)
            
            ground_truth.append({
                'query': query,
                'relevantDocs': relevant_docs,
                'description': description
            })
        
        return ground_truth
    
    def save_ground_truth(self, ground_truth, output_path):
        """Save ground truth ke file JSON"""
        output_file = Path(output_path)
        output_file.parent.mkdir(parents=True, exist_ok=True)
        
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(ground_truth, f, ensure_ascii=False, indent=2)
        
        print(f"\n✓ Ground truth saved to: {output_file}")
        print(f"  Total queries: {len(ground_truth)}")
        
        # Print statistics
        total_relevant = sum(len(gt['relevantDocs']) for gt in ground_truth)
        avg_relevant = total_relevant / len(ground_truth)
        print(f"  Total relevant docs: {total_relevant}")
        print(f"  Average relevant docs per query: {avg_relevant:.2f}")


def main():
    # Paths
    base_dir = Path(__file__).parent.parent
    corpus_path = base_dir / 'preprocessing' / 'dataset' / 'preprocessed_corpus.json'
    inverted_index_path = base_dir / 'preprocessing' / 'dataset' / 'inverted_index.json'
    output_path = base_dir / 'preprocessing' / 'dataset' / 'ground_truth.json'
    
    # Initialize generator
    generator = GroundTruthGenerator(corpus_path, inverted_index_path)
    
    # Load data
    generator.load_data()
    
    # Calculate IDF
    generator.calculate_idf()
    
    # Generate ground truth
    # min_score=0.3: Hanya dokumen dengan relevance score > 0.3 (cukup relevan)
    # top_k=100: Maksimal 100 dokumen relevan per query
    print("\n" + "="*80)
    print("GENERATING GROUND TRUTH")
    print("="*80)
    ground_truth = generator.generate_ground_truth(min_score=0.3, top_k=100)
    
    # Save hasil
    generator.save_ground_truth(ground_truth, output_path)
    
    print("\n" + "="*80)
    print("GROUND TRUTH GENERATION COMPLETE!")
    print("="*80)


if __name__ == "__main__":
    main()
