import json
import re

class Tokenizer:
    """Tokenisasi teks menjadi kata-kata individual"""
    
    def tokenize(self, text):
        """Memecah teks menjadi token (kata-kata)"""
        if not isinstance(text, str):
            return []
        
        # Split by whitespace dan filter empty strings
        tokens = text.split()
        
        # Filter token yang terlalu pendek (< 2 karakter)
        tokens = [token for token in tokens if len(token) >= 2]
        
        return tokens
    
    def tokenize_documents(self, documents):
        """Tokenisasi semua dokumen"""
        tokenized_docs = []
        for doc in documents:
            tokenized_doc = doc.copy()
            if 'cleaned_content' in doc:
                tokenized_doc['tokens'] = self.tokenize(doc['cleaned_content'])
            if 'cleaned_title' in doc:
                tokenized_doc['title_tokens'] = self.tokenize(doc['cleaned_title'])
            tokenized_docs.append(tokenized_doc)
        return tokenized_docs


if __name__ == "__main__":
    # Test tokenization
    with open('../dataset/cleaned_corpus.json', 'r', encoding='utf-8') as f:
        corpus = json.load(f)
    
    tokenizer = Tokenizer()
    tokenized_corpus = tokenizer.tokenize_documents(corpus)
    
    # Save hasil tokenization
    with open('../dataset/tokenized_corpus.json', 'w', encoding='utf-8') as f:
        json.dump(tokenized_corpus, f, ensure_ascii=False, indent=2)
    
    print(f"Tokenized {len(tokenized_corpus)} documents")
    if tokenized_corpus[0].get('tokens'):
        print(f"Sample tokens (first 20): {tokenized_corpus[0]['tokens'][:20]}")
        print(f"Total tokens in first doc: {len(tokenized_corpus[0]['tokens'])}")
