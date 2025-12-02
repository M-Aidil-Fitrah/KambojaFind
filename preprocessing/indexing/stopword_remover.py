import json

class StopwordRemover:
    """Penghapusan stopwords (kata-kata umum yang tidak informatif)"""
    
    def __init__(self):
        # Daftar stopwords bahasa Indonesia (common words)
        self.stopwords = set([
            'yang', 'untuk', 'pada', 'ke', 'para', 'namun', 'menurut', 'antara', 'dia', 'dua',
            'ia', 'seperti', 'jika', 'jadi', 'maka', 'ketika', 'sebagai', 'ini', 'itu', 'tersebut',
            'dalam', 'dari', 'dan', 'di', 'dengan', 'adalah', 'akan', 'atau', 'ada', 'dapat',
            'telah', 'sudah', 'oleh', 'bisa', 'hal', 'kami', 'mereka', 'kita', 'saya', 'anda',
            'juga', 'saat', 'lebih', 'sangat', 'harus', 'belum', 'tidak', 'bukan', 'masih',
            'setiap', 'karena', 'hingga', 'hanya', 'agar', 'pun', 'pula', 'serta', 'maupun',
            'sedangkan', 'padahal', 'walaupun', 'meskipun', 'ataupun', 'bahwa', 'oleh', 'secara',
            'nya', 'nih', 'lho', 'loh', 'dong', 'sih', 'deh', 'kok', 'yah', 'dg', 'dgn', 'utk',
            'pd', 'kpd', 'krn', 'tsb', 'dll', 'dsb', 'dst', 'yg', 'sb', 'sbg', 'spt', 'jk',
            'kl', 'jd', 'mk', 'kt', 'an', 'nya', 'ku', 'mu', 'kah', 'lah', 'tah', 'pun',
            'per', 'bagi', 'beliau', 'berikut', 'berupa', 'bilion', 'bisakah', 'boleh', 'bolehkah',
            'bung', 'cara', 'caranya', 'cukup', 'cukupkah', 'dahulu', 'demi', 'dimana', 'dimanapun',
            'dimulai', 'disebutkan', 'ditegaskan', 'ditunjuk', 'ditunjuki', 'ditunjukkan', 'ditunjukkannya',
            'dong', 'empat', 'enggak', 'enggaknya', 'entah', 'guna', 'gunakan', 'hal', 'hampir',
            'hanyalah', 'harus', 'haruslah', 'harusnya', 'hendak', 'hendaklah', 'hendaknya',
            'hingga', 'http', 'ibaratnya', 'ikut', 'ingat', 'ingat-ingat', 'ingin', 'inginkan',
            'ini', 'inikah', 'itu', 'itukah', 'itulah', 'jangan', 'jangankan', 'janganlah',
            'jumlah', 'jumlahnya', 'justru', 'kadang', 'kadangkala', 'kalau', 'kalaulah', 'kalaupun',
            'kamulah', 'kan', 'kapan', 'kapankah', 'kapanpun', 'karena', 'karenanya', 'kasus',
            'kata', 'katakan', 'katakanlah', 'katanya', 'ke', 'keadaan', 'kebetulan', 'kecil',
            'kedua', 'keduanya', 'kelak', 'kelima', 'kemarin', 'kemudian', 'kemungkinan', 'kemungkinannya',
            'kenapa', 'kepada', 'kepadanya', 'kesampaian', 'keseluruhan', 'keseluruhannya', 'keterlaluan',
            'ketika', 'khususnya', 'kini', 'kinilah', 'kira', 'kira-kira', 'kiranya', 'kitalah',
            'kok', 'lagi', 'lagian', 'lain', 'lainnya', 'lalu', 'lama', 'lamanya', 'lanjut',
            'lanjutnya', 'lebih', 'lewat', 'lima', 'luar', 'maka', 'makanya', 'makin', 'malah',
            'malahan', 'mampu', 'mampukah', 'mana', 'manakala', 'manalagi', 'masa', 'masalah',
            'masalahnya', 'masih', 'masing', 'masing-masing', 'mau', 'maupun', 'melainkan', 'melakukan',
            'melalui', 'melihat', 'melihatnya', 'memang', 'memastikan', 'memberi', 'memberikan',
            'meminta', 'memintakan', 'memisalkan', 'memperbuat', 'mempergunakan', 'memperkirakan',
            'memperlihatkan', 'mempersiapkan', 'mempersoalkan', 'mempertanyakan', 'mempunyai',
            'memungkinkan', 'menaiki', 'menambahkan', 'menandaskan', 'menanti', 'menanti-nanti',
            'menantikan', 'menanya', 'menanyai', 'menanyakan', 'mendapat', 'mendapatkan', 'mendatang',
            'mendatangi', 'mendatangkan', 'menegaskan', 'mengakhiri', 'mengapa', 'mengatakan',
            'mengatakannya', 'mengenai', 'mengerjakan', 'mengetahui', 'menggunakan', 'menghendaki',
            'mengibaratkan', 'mengibaratkannya', 'mengingat', 'mengingatkan', 'menginginkan',
            'mengira', 'mengucapkan', 'mengucapkannya', 'mengungkapkan', 'menjadi', 'menjawab',
            'menjelaskan', 'menuju', 'menunjuk', 'menunjuki', 'menunjukkan', 'menunjuknya',
            'menurut', 'menuturkan', 'menyampaikan', 'menyangkut', 'menyatakan', 'menyebutkan',
            'menyeluruh', 'menyiapkan', 'merasa', 'mereka', 'merekalah', 'merupakan', 'meski',
            'meskipun', 'meyakini', 'meyakinkan', 'minta', 'mirip', 'misal', 'misalkan', 'misalnya',
            'mula', 'mulai', 'mulailah', 'mulanya', 'mungkin', 'mungkinkah', 'nah', 'naik', 'nanti',
            'nantinya', 'nyaris', 'nyata-nyata', 'oleh', 'olehnya', 'pada', 'padahal', 'padanya',
            'pak', 'paling', 'panjang', 'pantas', 'para', 'pasti', 'pastilah', 'penting', 'pentingnya',
            'percuma', 'pergunakan', 'perlukah', 'perlu', 'pernah', 'persoalan', 'pertama', 'pertama-tama',
            'pertanyaan', 'pertanyakan', 'pihak', 'pihaknya', 'pukul', 'pula', 'pun', 'punya', 'rasa',
            'rasanya', 'rata', 'rupanya', 'saat', 'saatnya', 'saja', 'sajalah', 'saling', 'sama',
            'sama-sama', 'sambil', 'sampai', 'sampai-sampai', 'sampaikan', 'sana', 'sangat',
            'sangatlah', 'saya', 'se', 'sebab', 'sebabnya', 'sebagai', 'sebagaimana', 'sebagainya',
            'sebagian', 'sebaik', 'sebaik-baiknya', 'sebaiknya', 'sebaliknya', 'sebanyak', 'sebegini',
            'sebegitu', 'sebelum', 'sebelumnya', 'sebenarnya', 'seberapa', 'sebesar', 'sebetulnya',
            'sebisanya', 'sebuah', 'sebut', 'sebutlah', 'sebutnya', 'secara', 'secukupnya', 'sedang',
            'sedangkan', 'sedemikian', 'sedikit', 'sedikitnya', 'seenaknya', 'segala', 'segalanya',
            'segera', 'seharusnya', 'sehingga', 'seingat', 'sejak', 'sejauh', 'sejenak', 'sejumlah',
            'sekadar', 'sekadarnya', 'sekali', 'sekali-kali', 'sekalian', 'sekaligus', 'sekalipun',
            'sekarang', 'sekarang', 'sekecil', 'seketika', 'sekiranya', 'sekitar', 'sekitarnya',
            'sekurang-kurangnya', 'sekurangnya', 'sela', 'selain', 'selaku', 'selalu', 'selama',
            'selama-lamanya', 'selamanya', 'selanjutnya', 'seluruh', 'seluruhnya', 'semacam', 'semakin',
            'semampu', 'semampunya', 'semasa', 'semasih', 'semata', 'semata-mata', 'semaunya', 'sementara',
            'semua', 'semuanya', 'semula', 'sendiri', 'sendirian', 'sendirinya', 'seolah', 'seolah-olah',
            'seorang', 'sepanjang', 'sepantasnya', 'sepantasnyalah', 'seperlunya', 'seperti', 'sepertinya',
            'sepihak', 'sering', 'seringnya', 'serta', 'serupa', 'sesaat', 'sesama', 'sesampai', 'sesegera',
            'sesekali', 'seseorang', 'sesuatu', 'sesuatunya', 'sesudah', 'sesudahnya', 'setelah', 'setelahnya',
            'setempat', 'setengah', 'seterusnya', 'setiap', 'setiba', 'setibanya', 'setidak-tidaknya',
            'setidaknya', 'setinggi', 'seusai', 'sewaktu', 'siap', 'siapa', 'siapakah', 'siapapun', 'sini',
            'sinilah', 'soal', 'soalnya', 'suatu', 'sudah', 'sudahkah', 'sudahlah', 'supaya', 'tadi',
            'tadinya', 'tahu', 'tahun', 'tak', 'tambah', 'tambahnya', 'tampak', 'tampaknya', 'tandas',
            'tandasnya', 'tanpa', 'tanya', 'tanyakan', 'tanyanya', 'tapi', 'tegas', 'tegasnya', 'telah',
            'tempat', 'tengah', 'tentang', 'tentulah', 'tentunya', 'tepat', 'terakhir', 'terasa', 'terbanyak',
            'terdahulu', 'terdapat', 'terdiri', 'terhadap', 'terhadapnya', 'teringat', 'teringat-ingat',
            'terjadi', 'terjadilah', 'terjadinya', 'terkira', 'terlalu', 'terlebih', 'terlihat', 'termasuk',
            'ternyata', 'tersampaikan', 'tersebut', 'tersebutlah', 'tertentu', 'tertuju', 'terus', 'terutama',
            'tetap', 'tetapi', 'tiap', 'tiba', 'tiba-tiba', 'tidak', 'tidakkah', 'tidaklah', 'tiga', 'tinggi',
            'toh', 'tunjuk', 'turut', 'tutur', 'tuturnya', 'ucap', 'ucapnya', 'ujar', 'ujarnya', 'umum',
            'umumnya', 'ungkap', 'ungkapnya', 'untuk', 'usah', 'usai', 'waduh', 'wah', 'wahai', 'waktu',
            'waktunya', 'walau', 'walaupun', 'wong', 'yaitu', 'yakni', 'yakin', 'yang', 'adapun',
        ])
    
    def remove_stopwords(self, tokens):
        """Menghapus stopwords dari list tokens"""
        return [token for token in tokens if token not in self.stopwords]
    
    def remove_stopwords_from_documents(self, documents):
        """Menghapus stopwords dari semua dokumen"""
        processed_docs = []
        for doc in documents:
            processed_doc = doc.copy()
            if 'tokens' in doc:
                processed_doc['tokens_no_stopwords'] = self.remove_stopwords(doc['tokens'])
            if 'title_tokens' in doc:
                processed_doc['title_tokens_no_stopwords'] = self.remove_stopwords(doc['title_tokens'])
            processed_docs.append(processed_doc)
        return processed_docs


if __name__ == "__main__":
    # Test stopword removal
    with open('../dataset/tokenized_corpus.json', 'r', encoding='utf-8') as f:
        corpus = json.load(f)
    
    remover = StopwordRemover()
    filtered_corpus = remover.remove_stopwords_from_documents(corpus)
    
    # Save hasil filtering
    with open('../dataset/filtered_tokens_corpus.json', 'w', encoding='utf-8') as f:
        json.dump(filtered_corpus, f, ensure_ascii=False, indent=2)
    
    print(f"Filtered {len(filtered_corpus)} documents")
    if filtered_corpus[0].get('tokens'):
        print(f"Tokens before: {len(filtered_corpus[0]['tokens'])}")
        print(f"Tokens after: {len(filtered_corpus[0]['tokens_no_stopwords'])}")
        print(f"Sample filtered tokens: {filtered_corpus[0]['tokens_no_stopwords'][:20]}")
