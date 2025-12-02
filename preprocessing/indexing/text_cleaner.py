import re
import json

class TextCleaner:
    """Pembersihan teks dari karakter tidak perlu"""
    
    def __init__(self):
        self.url_pattern = re.compile(r'https?://\S+|www\.\S+')
        self.email_pattern = re.compile(r'\S+@\S+')
        self.html_pattern = re.compile(r'<.*?>')
        self.number_pattern = re.compile(r'\d+')
        
    def clean_text(self, text):
        """Membersihkan teks dari URL, email, HTML tags, angka, dan karakter khusus"""
        if not isinstance(text, str):
            return ""
        
        # Lowercase
        text = text.lower()
        
        # Hapus URL
        text = self.url_pattern.sub('', text)
        
        # Hapus email
        text = self.email_pattern.sub('', text)
        
        # Hapus HTML tags
        text = self.html_pattern.sub('', text)
        
        # Hapus angka
        text = self.number_pattern.sub('', text)
        
        # Hapus karakter non-alfabet (kecuali spasi)
        text = re.sub(r'[^a-z\s]', ' ', text)
        
        # Hapus extra whitespace
        text = re.sub(r'\s+', ' ', text).strip()
        
        return text
    
    def clean_documents(self, documents):
        """Membersihkan semua dokumen"""
        cleaned_docs = []
        for doc in documents:
            cleaned_doc = doc.copy()
            if 'content' in doc:
                cleaned_doc['cleaned_content'] = self.clean_text(doc['content'])
            if 'title' in doc:
                cleaned_doc['cleaned_title'] = self.clean_text(doc['title'])
            cleaned_docs.append(cleaned_doc)
        return cleaned_docs


if __name__ == "__main__":
    # Test cleaning
    with open('../dataset/filtered_corpus.json', 'r', encoding='utf-8') as f:
        corpus = json.load(f)
    
    cleaner = TextCleaner()
    cleaned_corpus = cleaner.clean_documents(corpus)
    
    # Save hasil cleaning
    with open('../dataset/cleaned_corpus.json', 'w', encoding='utf-8') as f:
        json.dump(cleaned_corpus, f, ensure_ascii=False, indent=2)
    
    print(f"Cleaned {len(cleaned_corpus)} documents")
    print(f"Sample cleaned text: {cleaned_corpus[0]['cleaned_content'][:200]}...")
