import json
import sys
import os
from collections import defaultdict

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from search_algorithms.tfidf_search import TFIDFSearchEngine
from search_algorithms.bm25_search import BM25SearchEngine


class SearchEvaluator:
    """Evaluasi performa algoritma pencarian"""
    
    def __init__(self, tfidf_engine, bm25_engine):
        self.tfidf_engine = tfidf_engine
        self.bm25_engine = bm25_engine
    
    def calculate_precision(self, retrieved_docs, relevant_docs):
        """
        Precision = (Retrieved AND Relevant) / Retrieved
        """
        if len(retrieved_docs) == 0:
            return 0.0
        
        relevant_retrieved = len(set(retrieved_docs) & set(relevant_docs))
        return relevant_retrieved / len(retrieved_docs)
    
    def calculate_recall(self, retrieved_docs, relevant_docs):
        """
        Recall = (Retrieved AND Relevant) / Relevant
        """
        if len(relevant_docs) == 0:
            return 0.0
        
        relevant_retrieved = len(set(retrieved_docs) & set(relevant_docs))
        return relevant_retrieved / len(relevant_docs)
    
    def calculate_f1_score(self, precision, recall):
        """
        F1 Score = 2 * (Precision * Recall) / (Precision + Recall)
        """
        if precision + recall == 0:
            return 0.0
        
        return 2 * (precision * recall) / (precision + recall)
    
    def calculate_average_precision(self, retrieved_docs, relevant_docs):
        """
        Average Precision (AP) untuk satu query
        AP = (1/R) * Σ (Precision@k * rel(k))
        """
        if len(relevant_docs) == 0:
            return 0.0
        
        relevant_set = set(relevant_docs)
        precision_sum = 0.0
        relevant_count = 0
        
        for k, doc_id in enumerate(retrieved_docs, 1):
            if doc_id in relevant_set:
                relevant_count += 1
                precision_at_k = relevant_count / k
                precision_sum += precision_at_k
        
        return precision_sum / len(relevant_docs) if len(relevant_docs) > 0 else 0.0
    
    def calculate_map(self, query_results, ground_truth):
        """
        Mean Average Precision (MAP) across all queries
        MAP = (1/Q) * Σ AP(q)
        """
        if len(query_results) == 0:
            return 0.0
        
        ap_sum = 0.0
        for query, retrieved_docs in query_results.items():
            relevant_docs = ground_truth.get(query, [])
            ap = self.calculate_average_precision(retrieved_docs, relevant_docs)
            ap_sum += ap
        
        return ap_sum / len(query_results)
    
    def evaluate_single_query(self, query, relevant_docs, top_k=10):
        """Evaluasi untuk satu query dengan kedua algoritma"""
        # TF-IDF results
        tfidf_results = self.tfidf_engine.search(query, top_k=top_k)
        tfidf_doc_ids = [r['doc_id'] for r in tfidf_results]
        
        # BM25 results
        bm25_results = self.bm25_engine.search(query, top_k=top_k)
        bm25_doc_ids = [r['doc_id'] for r in bm25_results]
        
        # Calculate metrics for TF-IDF
        tfidf_precision = self.calculate_precision(tfidf_doc_ids, relevant_docs)
        tfidf_recall = self.calculate_recall(tfidf_doc_ids, relevant_docs)
        tfidf_f1 = self.calculate_f1_score(tfidf_precision, tfidf_recall)
        tfidf_ap = self.calculate_average_precision(tfidf_doc_ids, relevant_docs)
        
        # Calculate metrics for BM25
        bm25_precision = self.calculate_precision(bm25_doc_ids, relevant_docs)
        bm25_recall = self.calculate_recall(bm25_doc_ids, relevant_docs)
        bm25_f1 = self.calculate_f1_score(bm25_precision, bm25_recall)
        bm25_ap = self.calculate_average_precision(bm25_doc_ids, relevant_docs)
        
        return {
            'query': query,
            'tfidf': {
                'precision': tfidf_precision,
                'recall': tfidf_recall,
                'f1_score': tfidf_f1,
                'average_precision': tfidf_ap,
                'results': tfidf_results
            },
            'bm25': {
                'precision': bm25_precision,
                'recall': bm25_recall,
                'f1_score': bm25_f1,
                'average_precision': bm25_ap,
                'results': bm25_results
            }
        }
    
    def evaluate_multiple_queries(self, test_queries, top_k=10):
        """
        Evaluasi untuk multiple queries
        
        test_queries format: {
            "query1": ["doc_id1", "doc_id2", ...],  # relevant docs
            "query2": ["doc_id3", "doc_id4", ...],
            ...
        }
        """
        results = []
        
        tfidf_all_results = {}
        bm25_all_results = {}
        
        for query, relevant_docs in test_queries.items():
            evaluation = self.evaluate_single_query(query, relevant_docs, top_k)
            results.append(evaluation)
            
            # Collect for MAP calculation
            tfidf_all_results[query] = [r['doc_id'] for r in evaluation['tfidf']['results']]
            bm25_all_results[query] = [r['doc_id'] for r in evaluation['bm25']['results']]
        
        # Calculate MAP
        tfidf_map = self.calculate_map(tfidf_all_results, test_queries)
        bm25_map = self.calculate_map(bm25_all_results, test_queries)
        
        # Calculate average metrics
        avg_metrics = {
            'tfidf': {
                'avg_precision': sum(r['tfidf']['precision'] for r in results) / len(results),
                'avg_recall': sum(r['tfidf']['recall'] for r in results) / len(results),
                'avg_f1_score': sum(r['tfidf']['f1_score'] for r in results) / len(results),
                'map': tfidf_map
            },
            'bm25': {
                'avg_precision': sum(r['bm25']['precision'] for r in results) / len(results),
                'avg_recall': sum(r['bm25']['recall'] for r in results) / len(results),
                'avg_f1_score': sum(r['bm25']['f1_score'] for r in results) / len(results),
                'map': bm25_map
            }
        }
        
        return {
            'individual_results': results,
            'average_metrics': avg_metrics
        }
    
    def print_comparison_report(self, evaluation_results):
        """Print formatted comparison report"""
        avg_metrics = evaluation_results['average_metrics']
        
        print("\n" + "="*80)
        print("SEARCH ALGORITHM COMPARISON REPORT")
        print("="*80)
        
        print("\n" + "-"*80)
        print("AVERAGE METRICS ACROSS ALL QUERIES")
        print("-"*80)
        
        print(f"\n{'Metric':<25} {'TF-IDF':>15} {'BM25':>15} {'Winner':>15}")
        print("-"*80)
        
        # Precision
        tfidf_prec = avg_metrics['tfidf']['avg_precision']
        bm25_prec = avg_metrics['bm25']['avg_precision']
        winner_prec = "TF-IDF" if tfidf_prec > bm25_prec else "BM25" if bm25_prec > tfidf_prec else "Tie"
        print(f"{'Precision':<25} {tfidf_prec:>15.4f} {bm25_prec:>15.4f} {winner_prec:>15}")
        
        # Recall
        tfidf_rec = avg_metrics['tfidf']['avg_recall']
        bm25_rec = avg_metrics['bm25']['avg_recall']
        winner_rec = "TF-IDF" if tfidf_rec > bm25_rec else "BM25" if bm25_rec > tfidf_rec else "Tie"
        print(f"{'Recall':<25} {tfidf_rec:>15.4f} {bm25_rec:>15.4f} {winner_rec:>15}")
        
        # F1 Score
        tfidf_f1 = avg_metrics['tfidf']['avg_f1_score']
        bm25_f1 = avg_metrics['bm25']['avg_f1_score']
        winner_f1 = "TF-IDF" if tfidf_f1 > bm25_f1 else "BM25" if bm25_f1 > tfidf_f1 else "Tie"
        print(f"{'F1 Score':<25} {tfidf_f1:>15.4f} {bm25_f1:>15.4f} {winner_f1:>15}")
        
        # MAP
        tfidf_map = avg_metrics['tfidf']['map']
        bm25_map = avg_metrics['bm25']['map']
        winner_map = "TF-IDF" if tfidf_map > bm25_map else "BM25" if bm25_map > tfidf_map else "Tie"
        print(f"{'MAP':<25} {tfidf_map:>15.4f} {bm25_map:>15.4f} {winner_map:>15}")
        
        print("\n" + "="*80)
        print("INDIVIDUAL QUERY RESULTS")
        print("="*80)
        
        for i, result in enumerate(evaluation_results['individual_results'], 1):
            print(f"\nQuery {i}: '{result['query']}'")
            print("-"*80)
            print(f"{'Metric':<25} {'TF-IDF':>15} {'BM25':>15}")
            print("-"*80)
            print(f"{'Precision':<25} {result['tfidf']['precision']:>15.4f} {result['bm25']['precision']:>15.4f}")
            print(f"{'Recall':<25} {result['tfidf']['recall']:>15.4f} {result['bm25']['recall']:>15.4f}")
            print(f"{'F1 Score':<25} {result['tfidf']['f1_score']:>15.4f} {result['bm25']['f1_score']:>15.4f}")
            print(f"{'Average Precision':<25} {result['tfidf']['average_precision']:>15.4f} {result['bm25']['average_precision']:>15.4f}")


if __name__ == "__main__":
    # Test evaluation
    index_path = '../dataset/inverted_index.json'
    corpus_path = '../dataset/stemmed_corpus.json'
    
    print("Loading search engines...")
    tfidf_engine = TFIDFSearchEngine(index_path, corpus_path)
    bm25_engine = BM25SearchEngine(index_path, corpus_path)
    
    evaluator = SearchEvaluator(tfidf_engine, bm25_engine)
    
    # Example test queries dengan ground truth
    # NOTE: Ini contoh, Anda perlu menyesuaikan dengan doc_id yang sebenarnya
    test_queries = {
        "perang di Myanmar": [],  # Isi dengan doc_id yang relevan
        "konflik etnis Rohingya": [],
        "junta militer kudeta": [],
    }
    
    print("\nNote: Please update test_queries with actual relevant doc_ids for proper evaluation.")
    print("Example format:")
    print("test_queries = {")
    print("    'query1': ['doc_id_1', 'doc_id_2', ...],")
    print("    'query2': ['doc_id_3', 'doc_id_4', ...],")
    print("}")
