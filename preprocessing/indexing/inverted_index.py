import json
from collections import defaultdict
import math

class InvertedIndex:
    """Membuat inverted index untuk pencarian efisien"""
    
    def __init__(self):
        self.inverted_index = defaultdict(list)  # term -> [(doc_id, positions)]
        self.doc_lengths = {}  # doc_id -> jumlah terms
        self.doc_freq = defaultdict(int)  # term -> jumlah dokumen yang mengandung term
        self.total_docs = 0
        self.avg_doc_length = 0
        
    def build_index(self, documents):
        """Membuat inverted index dari dokumen"""
        self.total_docs = len(documents)
        total_length = 0
        
        for doc in documents:
            doc_id = doc.get('id') or doc.get('_id') or doc.get('url', f"doc_{documents.index(doc)}")
            
            # Gabungkan title dan content tokens
            tokens = []
            if 'stemmed_title_tokens' in doc:
                tokens.extend(doc['stemmed_title_tokens'])
            if 'stemmed_tokens' in doc:
                tokens.extend(doc['stemmed_tokens'])
            
            # Hitung panjang dokumen
            self.doc_lengths[doc_id] = len(tokens)
            total_length += len(tokens)
            
            # Track unique terms per dokumen
            unique_terms = set()
            
            # Build inverted index dengan posisi
            for position, term in enumerate(tokens):
                self.inverted_index[term].append({
                    'doc_id': doc_id,
                    'position': position
                })
                unique_terms.add(term)
            
            # Update document frequency
            for term in unique_terms:
                self.doc_freq[term] += 1
        
        # Hitung rata-rata panjang dokumen
        self.avg_doc_length = total_length / self.total_docs if self.total_docs > 0 else 0
    
    def get_term_frequency(self, term, doc_id):
        """Menghitung term frequency untuk term tertentu di dokumen tertentu"""
        if term not in self.inverted_index:
            return 0
        
        count = 0
        for posting in self.inverted_index[term]:
            if posting['doc_id'] == doc_id:
                count += 1
        return count
    
    def get_document_frequency(self, term):
        """Menghitung document frequency untuk term tertentu"""
        return self.doc_freq.get(term, 0)
    
    def get_idf(self, term):
        """Menghitung IDF (Inverse Document Frequency)"""
        df = self.get_document_frequency(term)
        if df == 0:
            return 0
        return math.log((self.total_docs - df + 0.5) / (df + 0.5) + 1)
    
    def get_posting_list(self, term):
        """Mendapatkan posting list untuk term tertentu"""
        return self.inverted_index.get(term, [])
    
    def save_index(self, filepath):
        """Menyimpan index ke file JSON"""
        index_data = {
            'inverted_index': dict(self.inverted_index),
            'doc_lengths': self.doc_lengths,
            'doc_freq': dict(self.doc_freq),
            'total_docs': self.total_docs,
            'avg_doc_length': self.avg_doc_length
        }
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(index_data, f, ensure_ascii=False, indent=2)
    
    def load_index(self, filepath):
        """Memuat index dari file JSON"""
        with open(filepath, 'r', encoding='utf-8') as f:
            index_data = json.load(f)
        
        self.inverted_index = defaultdict(list, index_data['inverted_index'])
        self.doc_lengths = index_data['doc_lengths']
        self.doc_freq = defaultdict(int, index_data['doc_freq'])
        self.total_docs = index_data['total_docs']
        self.avg_doc_length = index_data['avg_doc_length']
    
    def get_statistics(self):
        """Mendapatkan statistik index"""
        return {
            'total_documents': self.total_docs,
            'total_unique_terms': len(self.inverted_index),
            'avg_doc_length': self.avg_doc_length,
            'total_postings': sum(len(postings) for postings in self.inverted_index.values())
        }


if __name__ == "__main__":
    # Test indexing
    print("Loading stemmed corpus...")
    with open('../dataset/stemmed_corpus.json', 'r', encoding='utf-8') as f:
        corpus = json.load(f)
    
    print("Building inverted index...")
    indexer = InvertedIndex()
    indexer.build_index(corpus)
    
    # Save index
    indexer.save_index('../dataset/inverted_index.json')
    
    # Print statistics
    stats = indexer.get_statistics()
    print("\nIndex Statistics:")
    print(f"Total documents: {stats['total_documents']}")
    print(f"Total unique terms: {stats['total_unique_terms']}")
    print(f"Average document length: {stats['avg_doc_length']:.2f}")
    print(f"Total postings: {stats['total_postings']}")
    
    # Test search
    test_term = list(indexer.inverted_index.keys())[0] if indexer.inverted_index else None
    if test_term:
        print(f"\nTest term: '{test_term}'")
        print(f"Document frequency: {indexer.get_document_frequency(test_term)}")
        print(f"IDF score: {indexer.get_idf(test_term):.4f}")
