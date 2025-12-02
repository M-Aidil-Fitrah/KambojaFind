from pymongo import MongoClient
import json
import os

# MongoDB Connection - langsung dari string
MONGODB_URI = "mongodb+srv://kambojafind_db_user:kambojafindpassword@kambojafind-database.mtbggqr.mongodb.net/?retryWrites=true&w=majority&appName=kambojafind-database"

client = None  # Initialize client di luar try block

try:
    print("Mencoba koneksi ke MongoDB Atlas...")
    print("(Ini mungkin memakan waktu beberapa detik...)")
    
    # Set timeout lebih tinggi
    client = MongoClient(
        MONGODB_URI,
        serverSelectionTimeoutMS=30000,  # 30 detik
        connectTimeoutMS=30000,
        socketTimeoutMS=30000
    )
    
    # Test connection
    client.admin.command('ping')
    print("✓ Berhasil terhubung ke MongoDB Atlas!")
    
    db = client['kambojafind_db']  # Nama database
    collection = db['articles']  # Nama collection
    
    # Baca dan filter data
    print("Membaca file preprocessed_corpus.json...")
    with open('preprocessed_corpus.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    print(f"Total dokumen dalam file: {len(data)}")
    
    # Filter dan insert
    filtered_data = []
    for item in data:
        filtered_item = {
            'id': item.get('id'),
            'title': item.get('title'),
            'url': item.get('url'),
            'source': item.get('source'),
            'original_content': item.get('original_content'),
            'token_count': item.get('token_count'),
            'image': item.get('image')
        }
        
        # Hanya tambahkan jika minimal ada title atau original_content
        if filtered_item.get('title') or filtered_item.get('original_content'):
            filtered_data.append(filtered_item)
    
    print(f"Dokumen yang akan diimpor: {len(filtered_data)}")
    
    # Hapus data lama (optional)
    print("Menghapus data lama...")
    collection.delete_many({})
    
    # Insert data baru
    if filtered_data:
        print("Mengimpor data ke MongoDB...")
        result = collection.insert_many(filtered_data)
        print(f"✓ Berhasil mengimpor {len(result.inserted_ids)} dokumen")
    else:
        print("⚠ Tidak ada data yang diimpor")
    
    # Buat index untuk pencarian lebih cepat
    print("Membuat index...")
    try:
        collection.create_index('id', unique=True)
        collection.create_index('source')
        collection.create_index([('title', 'text'), ('original_content', 'text')], default_language='none')
        print("✓ Index berhasil dibuat")
    except Exception as e:
        print(f"⚠ Warning saat membuat index: {e}")
    
    print("\n✅ Selesai! Data berhasil diimpor ke MongoDB Atlas")
    print(f"Database: kambojafind_db")
    print(f"Collection: articles")
    print(f"Total dokumen: {collection.count_documents({})}")
    
except Exception as e:
    print(f"\n❌ Error: {e}")
    print("\n🔍 Troubleshooting:")
    print("1. Pastikan koneksi internet stabil")
    print("2. Di MongoDB Atlas → Network Access → Allow 0.0.0.0/0")
    print("3. Pastikan password benar (tanpa karakter khusus atau sudah di-encode)")
    print("4. Coba matikan VPN jika sedang aktif")
    print("5. Coba gunakan hotspot HP jika WiFi kampus/kantor memblokir MongoDB")
    
finally:
    if client:
        client.close()
        print("\nKoneksi ditutup.")