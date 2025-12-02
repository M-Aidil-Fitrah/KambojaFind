# KambojaFind - Quick Start Guide

## 🚀 Langkah Cepat (5 Menit)

### 1. Install Dependencies Python
```bash
cd preprocessing
pip install Sastrawi Flask Flask-CORS
```

### 2. Jalankan Indexing
```bash
cd preprocessing/indexing
python run_indexing.py
```

Tunggu hingga selesai (~5-10 menit tergantung jumlah dokumen)

### 3. Start API Server
Di terminal baru:
```bash
cd preprocessing
python api_server.py
```

Biarkan berjalan di background. API akan di port 5000.

### 4. Start Next.js
Di terminal baru:
```bash
npm install
npm run dev
```

### 5. Buka Browser
```
http://localhost:3000
```

## ✅ Verifikasi

Jika berhasil, Anda akan melihat:
- Halaman pencarian dengan logo "KambojaFind"
- Kolom search di tengah
- Tab untuk comparison, TF-IDF, dan BM25

Coba search: **"Myanmar"** atau **"Rohingya"** atau **"konflik"**

## 📊 Test Algoritma

Untuk membandingkan TF-IDF vs BM25:
1. Ketik query di search box
2. Klik "Search"
3. Lihat tab "Comparison View" untuk melihat hasil side-by-side
4. Perhatikan score masing-masing algoritma

## 🔧 Troubleshooting

**Error: No module named 'Sastrawi'**
```bash
pip install Sastrawi
```

**Error: Port 5000 already in use**
Matikan process lain yang menggunakan port 5000, atau ubah port di `api_server.py`:
```python
app.run(host='0.0.0.0', port=5001, debug=True)  # ganti ke 5001
```

Jangan lupa update URL di `SearchInterface.tsx`:
```typescript
const response = await fetch('http://localhost:5001/api/search', {
```

**Error: inverted_index.json not found**
Jalankan indexing terlebih dahulu:
```bash
cd preprocessing/indexing
python run_indexing.py
```

## 📁 File Penting

Setelah indexing, file-file ini akan dibuat di `preprocessing/dataset/`:
- `cleaned_corpus.json` - Hasil cleaning
- `tokenized_corpus.json` - Hasil tokenisasi
- `filtered_tokens_corpus.json` - Hasil stopword removal
- `stemmed_corpus.json` - Hasil stemming
- `inverted_index.json` - Index untuk search

Semua file ini diperlukan untuk search engine!
