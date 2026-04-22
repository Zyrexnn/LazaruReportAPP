# 🔑 Cara Mendapatkan API Key GRATIS (5 Menit!)

## ⚠️ PENTING: Aplikasi Menampilkan Mock Data

Jika Anda melihat news yang sama terus (mock data), itu karena **BELUM ADA API KEY**.

## 🎯 Solusi: Dapatkan API Key Gratis

### Option 1: NewsData.io (PALING MUDAH - 200 requests/day)

1. **Buka**: https://newsdata.io/register
2. **Daftar** dengan email
3. **Verifikasi** email Anda
4. **Copy** API key dari dashboard
5. **Paste** ke file `.env`:
   ```
   NEWSDATA_API_KEY=your_actual_key_here
   ```
6. **Restart** server: Ctrl+C lalu `cmd /c "npm start"`

### Option 2: GNews (100 requests/day)

1. **Buka**: https://gnews.io/register
2. **Daftar** dengan email
3. **Copy** API key
4. **Paste** ke `.env`:
   ```
   GNEWS_API_KEY=your_actual_key_here
   ```
5. **Restart** server

### Option 3: NewsAPI.org (100 requests/day)

1. **Buka**: https://newsapi.org/register
2. **Daftar** dengan email
3. **Copy** API key
4. **Paste** ke `.env`:
   ```
   NEWSAPI_API_KEY=your_actual_key_here
   ```
5. **Restart** server

## 📝 Langkah Detail (NewsData.io)

### Step 1: Daftar
- Buka https://newsdata.io/register
- Isi form:
  - Email: email@anda.com
  - Password: (buat password)
  - Name: Nama Anda
- Klik "Sign Up"

### Step 2: Verifikasi Email
- Cek inbox email Anda
- Klik link verifikasi
- Login ke dashboard

### Step 3: Copy API Key
- Di dashboard, lihat "API Key"
- Klik "Copy" atau select dan copy

### Step 4: Paste ke .env
- Buka file `.env` di root project
- Cari baris: `NEWSDATA_API_KEY=YOUR_NEWSDATA_API_KEY`
- Ganti dengan: `NEWSDATA_API_KEY=npd_xxxxxxxxxxxxx` (key Anda)
- Save file

### Step 5: Restart Server
- Di terminal, tekan Ctrl+C
- Run: `cmd /c "npm start"`
- Tekan `w` untuk web

### Step 6: Check Console
Lihat di console browser (F12):
```
[NewsAPI] Checking API keys...
[NewsAPI] NewsData: CONFIGURED ✅
[NewsAPI] Trying provider: newsdata
[NewsAPI] Success with newsdata: 10 items
[NewsAPI] Final result: 10 articles from 1 providers
```

## ✅ Cara Tahu Sudah Berhasil

### Sebelum (Mock Data):
```
[NewsAPI] ⚠️ NO API KEYS CONFIGURED - Using mock data
[NewsAPI] To get real news, add API keys to .env file
```

News yang muncul:
- "Modernizing the Dossier..."
- "The Rise of Obsidian Design..."
- (Artikel yang sama terus)

### Sesudah (Real Data):
```
[NewsAPI] NewsData: CONFIGURED ✅
[NewsAPI] Success with newsdata: 10 items
[NewsAPI] Final result: 10 articles
```

News yang muncul:
- Artikel real-time dari berbagai sumber
- Artikel berbeda setiap refresh
- Bisa klik untuk buka URL asli

## 🎊 Bonus: Multiple API Keys

Untuk coverage lebih baik, tambahkan beberapa API keys:

```env
# News APIs
NEWSDATA_API_KEY=npd_xxxxx
GNEWS_API_KEY=xxxxx
NEWSAPI_API_KEY=xxxxx

# Market API (optional, untuk stocks)
FINNHUB_API_KEY=xxxxx
```

Aplikasi akan otomatis:
- Try semua API secara parallel
- Fallback jika satu API error
- Merge hasil dari semua API
- Deduplicate artikel yang sama

## 🐛 Troubleshooting

### "Still showing mock data"
1. Check file `.env` - pastikan API key benar
2. Restart server (Ctrl+C lalu start lagi)
3. Clear browser cache (Ctrl+Shift+R)
4. Check console untuk error

### "API key invalid"
1. Copy ulang API key dari dashboard
2. Pastikan tidak ada spasi di awal/akhir
3. Pastikan format: `NEWSDATA_API_KEY=npd_xxxxx`

### "Rate limit exceeded"
- Free tier punya limit harian
- Tunggu 24 jam atau tambah API key lain
- Atau upgrade ke paid plan

## 💡 Tips

1. **Daftar 2-3 API** untuk backup
2. **Check console** untuk lihat status API
3. **Restart server** setelah edit `.env`
4. **Free tier cukup** untuk development

## 🚀 Setelah Setup

Aplikasi akan:
- ✅ Fetch real news dari API
- ✅ Update setiap 60 detik
- ✅ Buka URL asli saat diklik
- ✅ Show artikel dari berbagai sumber
- ✅ Fallback ke API lain jika error

**Total waktu: 5 menit!** 🎉
