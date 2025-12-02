import json
from Sastrawi.Stemmer.StemmerFactory import StemmerFactory

class IndonesianStemmer:
    """Stemming menggunakan library Sastrawi untuk bahasa Indonesia"""
    
    def __init__(self):
        factory = StemmerFactory()
        self.stemmer = factory.create_stemmer()
    
    def stem(self, word):
        """Melakukan stemming pada satu kata"""
        return self.stemmer.stem(word)
    
    def stem_tokens(self, tokens):
        """Melakukan stemming pada list of tokens"""
        return [self.stem(token) for token in tokens]
    
    def stem_documents(self, documents):
        """Melakukan stemming pada semua dokumen"""
        stemmed_docs = []
        for i, doc in enumerate(documents):
            stemmed_doc = doc.copy()
            if 'tokens_no_stopwords' in doc:
                stemmed_doc['stemmed_tokens'] = self.stem_tokens(doc['tokens_no_stopwords'])
            if 'title_tokens_no_stopwords' in doc:
                stemmed_doc['stemmed_title_tokens'] = self.stem_tokens(doc['title_tokens_no_stopwords'])
            
            stemmed_docs.append(stemmed_doc)
            
            # Progress indicator
            if (i + 1) % 50 == 0:
                print(f"Stemmed {i + 1}/{len(documents)} documents...")
        
        return stemmed_docs


if __name__ == "__main__":
    # Test stemming
    with open('../dataset/filtered_tokens_corpus.json', 'r', encoding='utf-8') as f:
        corpus = json.load(f)
    
    print("Starting stemming process...")
    stemmer = IndonesianStemmer()
    stemmed_corpus = stemmer.stem_documents(corpus)
    
    # Save hasil stemming
    with open('../dataset/stemmed_corpus.json', 'w', encoding='utf-8') as f:
        json.dump(stemmed_corpus, f, ensure_ascii=False, indent=2)
    
    print(f"\nCompleted stemming {len(stemmed_corpus)} documents")
    if stemmed_corpus[0].get('stemmed_tokens'):
        print(f"Sample original tokens: {stemmed_corpus[0]['tokens_no_stopwords'][:10]}")
        print(f"Sample stemmed tokens: {stemmed_corpus[0]['stemmed_tokens'][:10]}")
