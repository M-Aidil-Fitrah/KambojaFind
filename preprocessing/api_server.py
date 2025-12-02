from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import os

# Add preprocessing directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from search_algorithms.tfidf_search import TFIDFSearchEngine
from search_algorithms.bm25_search import BM25SearchEngine

app = Flask(__name__)
CORS(app)  # Enable CORS for Next.js

# Initialize search engines
print("Initializing search engines...")
INDEX_PATH = 'dataset/inverted_index.json'
CORPUS_PATH = 'dataset/stemmed_corpus.json'

tfidf_engine = TFIDFSearchEngine(INDEX_PATH, CORPUS_PATH)
bm25_engine = BM25SearchEngine(INDEX_PATH, CORPUS_PATH)
print("Search engines ready!")


@app.route('/api/search', methods=['POST'])
def search():
    """
    Search endpoint
    Request body: {"query": "search query", "algorithm": "tfidf|bm25|both", "top_k": 10}
    """
    data = request.get_json()
    query = data.get('query', '')
    algorithm = data.get('algorithm', 'both')
    top_k = data.get('top_k', 10)
    
    if not query:
        return jsonify({'error': 'Query is required'}), 400
    
    results = {}
    
    if algorithm in ['tfidf', 'both']:
        tfidf_results = tfidf_engine.search(query, top_k=top_k)
        results['tfidf'] = tfidf_results
    
    if algorithm in ['bm25', 'both']:
        bm25_results = bm25_engine.search(query, top_k=top_k)
        results['bm25'] = bm25_results
    
    return jsonify({
        'query': query,
        'results': results,
        'total_results': {
            'tfidf': len(results.get('tfidf', [])),
            'bm25': len(results.get('bm25', []))
        }
    })


@app.route('/api/stats', methods=['GET'])
def stats():
    """Get index statistics"""
    return jsonify({
        'total_documents': tfidf_engine.total_docs,
        'total_terms': len(tfidf_engine.inverted_index),
        'algorithms': ['TF-IDF', 'BM25']
    })


@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({'status': 'healthy'})


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
