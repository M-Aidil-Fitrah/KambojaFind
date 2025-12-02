#!/usr/bin/env python3
"""
Pipeline lengkap untuk preprocessing dan indexing corpus
Menjalankan: text cleaning -> tokenization -> stopword removal -> stemming -> indexing
"""

import json
import sys
import os

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from text_cleaner import TextCleaner
from tokenizer import Tokenizer
from stopword_remover import StopwordRemover
from stemmer import IndonesianStemmer
from inverted_index import InvertedIndex


def run_indexing_pipeline(input_file, output_dir='../dataset'):
    """Menjalankan seluruh pipeline indexing"""
    
    print("="*60)
    print("INDEXING PIPELINE - KAMBOJAFIND")
    print("="*60)
    
    # 1. Load corpus
    print("\n[1/6] Loading corpus...")
    with open(input_file, 'r', encoding='utf-8') as f:
        corpus = json.load(f)
    print(f"✓ Loaded {len(corpus)} documents")
    
    # 2. Text cleaning
    print("\n[2/6] Cleaning text...")
    cleaner = TextCleaner()
    corpus = cleaner.clean_documents(corpus)
    
    cleaned_file = os.path.join(output_dir, 'cleaned_corpus.json')
    with open(cleaned_file, 'w', encoding='utf-8') as f:
        json.dump(corpus, f, ensure_ascii=False, indent=2)
    print(f"✓ Text cleaned and saved to {cleaned_file}")
    
    # 3. Tokenization
    print("\n[3/6] Tokenizing...")
    tokenizer = Tokenizer()
    corpus = tokenizer.tokenize_documents(corpus)
    
    tokenized_file = os.path.join(output_dir, 'tokenized_corpus.json')
    with open(tokenized_file, 'w', encoding='utf-8') as f:
        json.dump(corpus, f, ensure_ascii=False, indent=2)
    print(f"✓ Tokenization complete and saved to {tokenized_file}")
    
    # 4. Stopword removal
    print("\n[4/6] Removing stopwords...")
    remover = StopwordRemover()
    corpus = remover.remove_stopwords_from_documents(corpus)
    
    filtered_file = os.path.join(output_dir, 'filtered_tokens_corpus.json')
    with open(filtered_file, 'w', encoding='utf-8') as f:
        json.dump(corpus, f, ensure_ascii=False, indent=2)
    print(f"✓ Stopwords removed and saved to {filtered_file}")
    
    # 5. Stemming
    print("\n[5/6] Stemming (this may take a while)...")
    stemmer = IndonesianStemmer()
    corpus = stemmer.stem_documents(corpus)
    
    stemmed_file = os.path.join(output_dir, 'stemmed_corpus.json')
    with open(stemmed_file, 'w', encoding='utf-8') as f:
        json.dump(corpus, f, ensure_ascii=False, indent=2)
    print(f"✓ Stemming complete and saved to {stemmed_file}")
    
    # 6. Build inverted index
    print("\n[6/6] Building inverted index...")
    indexer = InvertedIndex()
    indexer.build_index(corpus)
    
    index_file = os.path.join(output_dir, 'inverted_index.json')
    indexer.save_index(index_file)
    print(f"✓ Inverted index built and saved to {index_file}")
    
    # Show statistics
    print("\n" + "="*60)
    print("INDEXING COMPLETE - STATISTICS")
    print("="*60)
    stats = indexer.get_statistics()
    print(f"Total documents indexed: {stats['total_documents']}")
    print(f"Total unique terms: {stats['total_unique_terms']}")
    print(f"Average document length: {stats['avg_doc_length']:.2f} terms")
    print(f"Total postings: {stats['total_postings']}")
    
    # Sample output
    if corpus and len(corpus) > 0:
        print("\n" + "="*60)
        print("SAMPLE DOCUMENT (First Document)")
        print("="*60)
        sample = corpus[0]
        print(f"Title: {sample.get('title', 'N/A')}")
        if 'cleaned_content' in sample:
            print(f"Cleaned content (first 200 chars): {sample['cleaned_content'][:200]}...")
        if 'stemmed_tokens' in sample:
            print(f"Stemmed tokens (first 30): {sample['stemmed_tokens'][:30]}")
        print(f"Total stemmed tokens: {len(sample.get('stemmed_tokens', []))}")
    
    print("\n" + "="*60)
    print("All files saved in:", output_dir)
    print("="*60)
    
    return corpus, indexer


if __name__ == "__main__":
    input_corpus = '../dataset/filtered_corpus.json'
    
    if not os.path.exists(input_corpus):
        print(f"Error: Input file '{input_corpus}' not found!")
        sys.exit(1)
    
    corpus, indexer = run_indexing_pipeline(input_corpus)
    print("\n✓ Pipeline completed successfully!")
