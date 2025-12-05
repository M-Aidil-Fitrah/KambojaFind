# KambojaFind

KambojaFind adalah sistem pencarian berita berbasis Information Retrieval yang menggunakan algoritma **TF-IDF** dan **BM25** untuk mencari dan mengurutkan dokumen berita terkait kasus WNI di Kamboja. Sistem ini dilengkapi dengan evaluasi performa menggunakan metrik Precision, Recall, F1-Score, dan MAP (Mean Average Precision).

## Anggota Kelompok

| No. | Nama | NPM |
|-----|------|-----|
| 1   | [Muhammad Aidil Fitrah] | [2308107010035] |
| 2   | [Muhammad Sidqi Alfareza] | [2308107010040] |

## Fitur Utama

### 1. **Dual Search Algorithm**
- **TF-IDF (Term Frequency-Inverse Document Frequency)**: Algoritma klasik untuk menghitung relevansi dokumen berdasarkan frekuensi term
- **BM25 (Best Matching 25)**: Algoritma probabilistic ranking yang lebih advanced dengan parameter tuning (k1=1.5, b=0.75)

### 2. **Text Preprocessing Pipeline**
- **Tokenization**: Memecah teks menjadi token individual
- **Stopword Removal**: Menghapus kata-kata umum yang tidak informatif
- **Stemming**: Mengubah kata ke bentuk dasarnya menggunakan Sastrawi stemmer
- **Text Cleaning**: Normalisasi teks (lowercase, remove special characters)

### 3. **Dynamic Query Evaluation**
- Evaluasi real-time menggunakan ground truth yang di-generate dengan Python
- 21 benchmark queries untuk evaluasi komprehensif
- Ground truth dengan 100 dokumen relevan per query (threshold similarity score > 0.3)
- Metrics: **Precision**, **Recall**, **F1-Score**, **MAP**

### 4. **Interactive UI/UX**
- **Dark-themed Interface** dengan DarkVeil background effect
- **Side-by-side Comparison**: Tampilan hasil TF-IDF vs BM25 secara bersamaan
- **Search Suggestions**: Auto-suggest saat mengetik query
- **Evaluation Modal**: Pop-up untuk melihat metrics performa algoritma
- **Article Detail Page**: View lengkap artikel dengan score dan ranking

### 5. **Performance Visualization**
- Progress bar untuk setiap metrik evaluasi
- Color-coded results (Blue untuk TF-IDF, Purple untuk BM25)
- Score comparison table

## Dataset

- **Total Dokumen**: 420 artikel berita
- **Topik**: Kasus WNI (Warga Negara Indonesia) di Kamboja
- **Format**: JSON dengan preprocessing (stemmed, cleaned, tokenized)
- **Ground Truth**: 21 queries × ~100 dokumen relevan = 2,100 relevance judgments

## Teknologi Stack

### Frontend
- **Next.js 16.0.6** (React 19.2.0) - Framework full-stack
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling
- **Lucide React** - Icon library
- **Motion** - Animations

### Backend
- **Next.js API Routes** - RESTful endpoints
- **Node.js** - Runtime environment

### Data Processing
- **Python 3.x** - Ground truth generation
- **Sastrawi** - Indonesian stemming library

### Search Engine
- **TF-IDF Implementation** - Inverted index dengan cosine similarity
- **BM25 Implementation** - Probabilistic ranking dengan tuning parameters

## Struktur Project

```
kambojafind/
├── app/
│   ├── api/
│   │   ├── article/[id]/route.ts      # API detail artikel
│   │   ├── evaluate-query/route.ts    # API evaluasi query
│   │   ├── search/route.ts            # API pencarian
│   │   ├── stats/route.ts             # API statistik
│   │   └── suggestions/route.ts       # API search suggestions
│   ├── article/[id]/page.tsx          # Halaman detail artikel
│   ├── components/                    # Reusable components
│   ├── search/page.tsx                # Halaman hasil pencarian
│   └── page.tsx                       # Homepage
├── lib/
│   ├── evaluation/
│   │   ├── evaluator.ts               # Evaluation logic
│   │   └── ground-truth.ts            # Ground truth data loader
│   ├── preprocessing/
│   │   ├── stemmer.ts                 # Sastrawi stemmer wrapper
│   │   ├── stopword-remover.ts        # Stopword removal
│   │   ├── text-cleaner.ts            # Text normalization
│   │   └── tokenizer.ts               # Tokenization
│   └── search/
│       ├── tfidf-search.ts            # TF-IDF implementation
│       └── bm25-search.ts             # BM25 implementation
├── preprocessing/
│   └── dataset/
│       ├── preprocessed_corpus.json   # Preprocessed documents
│       ├── inverted_index.json        # Inverted index
│       ├── ground_truth.json          # Evaluation ground truth
│       └── filtered_corpus.json       # Original corpus
├── scripts/
│   └── generate_ground_truth.py       # Python script untuk ground truth
└── public/
    └── images/                        # Article images

```

## Cara Menjalankan

### Prerequisites
- Node.js 20.x atau lebih tinggi
- npm atau yarn
- Python 3.x (untuk regenerate ground truth)

### Installation

1. **Clone repository**
```bash
git clone https://github.com/M-Aidil-Fitrah/KambojaFind.git
cd kambojafind
```

2. **Install dependencies**
```bash
npm install
```

3. **Run development server**
```bash
npm run dev
```

4. **Buka browser**
```
http://localhost:3000
```

### Generate Ground Truth (Optional)

Jika ingin regenerate ground truth dengan parameter berbeda:

```bash
# Install Python dependencies
pip install -r requirements.txt  # (jika ada)

# Run script
python scripts/generate_ground_truth.py
```

Parameter yang bisa diubah di script:
- `min_score`: Threshold similarity minimum (default: 0.3)
- `top_k`: Maksimal dokumen per query (default: 100)

## Cara Penggunaan

### 1. Search
- Ketik query di search box homepage atau search page
- Sistem akan menampilkan hasil dari TF-IDF dan BM25 secara side-by-side
- Klik artikel untuk melihat detail lengkap

### 2. View Evaluation
- Di search results page, klik tombol **"View Evaluation Metrics"**
- Modal akan menampilkan:
  - Precision, Recall, F1-Score, MAP untuk TF-IDF
  - Precision, Recall, F1-Score, MAP untuk BM25
  - Matched ground truth query
  - Query similarity score

### 3. Article Detail
- Klik artikel dari hasil pencarian
- Lihat konten lengkap artikel
- Klik tombol **"Score"** untuk melihat:
  - TF-IDF dan BM25 relevance score
  - Rank position di hasil pencarian
  - Evaluation metrics (sama seperti di search page)

### 4. Compare Algorithms
- Bandingkan hasil ranking TF-IDF vs BM25
- Perhatikan perbedaan score dan urutan dokumen
- Analisis metrics mana yang lebih baik untuk query tertentu

## Metrics Evaluation

### Precision
$$\text{Precision} = \frac{TP}{TP + FP}$$
- Mengukur akurasi hasil yang dikembalikan
- Berapa persen dari hasil search yang benar-benar relevan

### Recall
$$\text{Recall} = \frac{TP}{TP + FN}$$
- Mengukur kelengkapan hasil
- Berapa persen dokumen relevan yang berhasil ditemukan

### F1-Score
$$\text{F1} = 2 \times \frac{\text{Precision} \times \text{Recall}}{\text{Precision} + \text{Recall}}$$
- Harmonic mean dari Precision dan Recall
- Balance antara akurasi dan kelengkapan

### MAP (Mean Average Precision)
$$\text{AP} = \frac{1}{R} \sum_{k=1}^{N} P(k) \times \text{rel}(k)$$
- Mengukur kualitas ranking
- Precision rata-rata di setiap posisi dokumen relevan


## Configuration

### Search Parameters
```typescript
// TF-IDF default
top_k = 50  // Jumlah dokumen yang dikembalikan

// BM25 parameters
k1 = 1.5    // Term frequency saturation
b = 0.75    // Length normalization
```

### Ground Truth Parameters
```python
# scripts/generate_ground_truth.py
min_score = 0.3   # Minimum TF-IDF similarity score
top_k = 100       # Max relevant docs per query
```

## API Endpoints

- `POST /api/search` - Search dengan TF-IDF dan/atau BM25
- `GET /api/article/[id]` - Get artikel by ID
- `POST /api/evaluate-query` - Evaluasi query dengan ground truth
- `GET /api/suggestions?q=[query]` - Get search suggestions
- `GET /api/stats` - Get dataset statistics
