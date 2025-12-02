#!/bin/bash
# Setup script untuk KambojaFind

echo "=================================="
echo "KambojaFind Setup"
echo "=================================="

# Install Python dependencies
echo ""
echo "[1/4] Installing Python dependencies..."
cd preprocessing
pip install -r requirements.txt

# Run indexing pipeline
echo ""
echo "[2/4] Running indexing pipeline (this may take a while)..."
cd indexing
python run_indexing.py
cd ..

# Test search engines
echo ""
echo "[3/4] Testing search engines..."
python -c "
from search_algorithms.tfidf_search import TFIDFSearchEngine
from search_algorithms.bm25_search import BM25SearchEngine

print('Loading TF-IDF engine...')
tfidf = TFIDFSearchEngine('dataset/inverted_index.json', 'dataset/stemmed_corpus.json')
print('✓ TF-IDF engine loaded')

print('Loading BM25 engine...')
bm25 = BM25SearchEngine('dataset/inverted_index.json', 'dataset/stemmed_corpus.json')
print('✓ BM25 engine loaded')

print('\nTest search...')
results = tfidf.search('Myanmar', top_k=3)
print(f'✓ Found {len(results)} results')
"

echo ""
echo "[4/4] Setup complete!"
echo ""
echo "Next steps:"
echo "1. Start API server: cd preprocessing && python api_server.py"
echo "2. Start Next.js: npm install && npm run dev"
echo "3. Open http://localhost:3000"
echo ""
