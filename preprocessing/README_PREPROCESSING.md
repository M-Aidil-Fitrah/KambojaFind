# KambojaFind - Information Retrieval System

Sistem pencarian informasi menggunakan TF-IDF dan BM25 untuk corpus bahasa Indonesia.

## 📁 Struktur Project

```
kambojafind/
├── preprocessing/
│   ├── indexing/
│   │   ├── text_cleaner.py          # Text cleaning
│   │   ├── tokenizer.py             # Tokenization
│   │   ├── stopword_remover.py      # Stopword removal
│   │   ├── stemmer.py               # Stemming (Sastrawi)
│   │   ├── inverted_index.py        # Inverted index builder
│   │   └── run_indexing.py          # Pipeline lengkap
│   ├── search_algorithms/
│   │   ├── tfidf_search.py          # TF-IDF Vector Space Model
│   │   └── bm25_search.py           # BM25 (Okapi BM25)
│   ├── evaluation/
│   │   └── evaluator.py             # Precision, Recall, F1, MAP
│   ├── dataset/
│   │   └── filtered_corpus.json     # Corpus asli (300+ docs)
│   ├── api_server.py                # Flask API server
│   └── requirements.txt             # Python dependencies
├── app/
│   ├── components/
│   │   └── SearchInterface.tsx      # UI pencarian
│   └── page.tsx                     # Main page
└── package.json
```

## 🚀 Cara Menjalankan

### 1. Install Dependencies Python

```bash
cd preprocessing
pip install -r requirements.txt
```

### 2. Jalankan Indexing Pipeline

```bash
cd preprocessing/indexing
python run_indexing.py
```

Proses ini akan:
- Membersihkan teks (cleaning)
- Tokenisasi
- Menghapus stopwords
- Stemming dengan Sastrawi
- Membuat inverted index

**Output files di `preprocessing/dataset/`:**
- `cleaned_corpus.json`
- `tokenized_corpus.json`
- `filtered_tokens_corpus.json`
- `stemmed_corpus.json`
- `inverted_index.json`

### 3. Jalankan API Server (Flask)

```bash
cd preprocessing
python api_server.py
```

API akan berjalan di `http://localhost:5000`

**Endpoints:**
- `POST /api/search` - Pencarian dengan TF-IDF dan/atau BM25
- `GET /api/stats` - Statistik index
- `GET /health` - Health check

### 4. Jalankan Next.js Frontend

Di terminal baru:

```bash
npm install
npm run dev
```

Aplikasi akan berjalan di `http://localhost:3000`

## 🔍 Fitur Pencarian

### TF-IDF (Vector Space Model)
- Menggunakan Term Frequency dan Inverse Document Frequency
- Cosine similarity untuk ranking
- Normalisasi berdasarkan panjang dokumen

### BM25 (Okapi BM25)
- Probabilistic ranking function
- Parameter: k1=1.5 (term frequency saturation), b=0.75 (length normalization)
- Lebih robust terhadap variasi panjang dokumen

## 📊 Evaluasi

Jalankan evaluasi dengan ground truth queries:

```python
from preprocessing.evaluation.evaluator import SearchEvaluator
from preprocessing.search_algorithms.tfidf_search import TFIDFSearchEngine
from preprocessing.search_algorithms.bm25_search import BM25SearchEngine

# Load engines
tfidf_engine = TFIDFSearchEngine('dataset/inverted_index.json', 'dataset/stemmed_corpus.json')
bm25_engine = BM25SearchEngine('dataset/inverted_index.json', 'dataset/stemmed_corpus.json')

evaluator = SearchEvaluator(tfidf_engine, bm25_engine)

# Define test queries dengan relevant docs
test_queries = {
    "perang di Myanmar": ["doc_id_1", "doc_id_2", ...],
    "konflik Rohingya": ["doc_id_3", "doc_id_4", ...],
}

# Run evaluation
results = evaluator.evaluate_multiple_queries(test_queries)
evaluator.print_comparison_report(results)
```

**Metrik yang dihitung:**
- **Precision**: Proporsi hasil relevan dari hasil yang dikembalikan
- **Recall**: Proporsi hasil relevan yang berhasil ditemukan
- **F1 Score**: Harmonic mean dari Precision dan Recall
- **MAP (Mean Average Precision)**: Rata-rata precision di berbagai recall levels

## 📝 Contoh Penggunaan API

### Search Request

```bash
curl -X POST http://localhost:5000/api/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "konflik etnis Rohingya",
    "algorithm": "both",
    "top_k": 10
  }'
```

### Response

```json
{
  "query": "konflik etnis Rohingya",
  "results": {
    "tfidf": [
      {
        "doc_id": "...",
        "score": 2.3456,
        "document": {
          "title": "...",
          "url": "...",
          "content": "..."
        }
      }
    ],
    "bm25": [...]
  },
  "total_results": {
    "tfidf": 10,
    "bm25": 10
  }
}
```

## 🎯 Tahapan yang Telah Diselesaikan

✅ **Tahap 1**: Pengumpulan Korpus (300+ dokumen)
✅ **Tahap 2**: Pengindeksan
  - Text cleaning
  - Tokenisasi
  - Stopword removal
  - Stemming (Sastrawi)
  - Inverted index

✅ **Tahap 3**: Implementasi Algoritma Pencarian
  - TF-IDF Vector Space Model
  - BM25 (Okapi BM25)

✅ **Tahap 4**: Evaluasi
  - Precision, Recall, F1 Score
  - Mean Average Precision (MAP)
  - Comparison report

✅ **Tahap 5**: UI Pencarian
  - Next.js frontend
  - Comparison view (side-by-side)
  - Responsive design
  - Real-time search

## 🛠 Teknologi

**Backend:**
- Python 3.x
- Flask (API server)
- Sastrawi (Indonesian stemmer)

**Frontend:**
- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Lucide icons

## 📌 Catatan Penting

1. **Pastikan API server berjalan** di port 5000 sebelum menggunakan frontend
2. **Indexing hanya perlu dilakukan sekali** kecuali corpus berubah
3. **Preprocessing memakan waktu** tergantung jumlah dokumen (stemming paling lama)
4. **Ground truth** untuk evaluasi perlu disiapkan manual sesuai domain corpus

## 🔧 Troubleshooting

**Error: Module not found**
```bash
pip install -r requirements.txt
```

**Error: Port already in use**
```bash
# Ubah port di api_server.py atau kill process yang menggunakan port tersebut
```

**Error: Index file not found**
```bash
# Jalankan indexing terlebih dahulu
cd preprocessing/indexing
python run_indexing.py
```
