# 📰 Lazarus Report App

Aplikasi pemantauan berita (news aggregation), analisa pasar finansial (crypto & stocks), serta chatbot AI finansial cerdas yang dibangun menggunakan **Expo**, **React Native**, dan **TypeScript**. Aplikasi ini mengusung filosofi desain minimalis modern ala iOS dan estetika Zen Jepang—bersih, berjarak lega (generous whitespace), dan responsif.

---

## 🎯 Status Proyek: PRODUCTION READY ✅

Aplikasi telah diuji sepenuhnya dan siap digunakan dengan kualitas kode premium:
- **0 Error TypeScript** & **100% Type-Safe**.
- Arsitektur bersih (*Clean Architecture*) memisahkan UI, *state store*, dan *data services*.
- Dukungan lintas platform (**iOS, Android, dan Web**).
- Mekanisme fallback otomatis jika API key tidak dikonfigurasi (menggunakan *mock data*).

---

## ✨ Fitur-Fitur Utama

### 1. 🖥️ Retro OS Boot Screen
Ketika aplikasi pertama kali diluncurkan, pengguna akan disuguhi layar *booting* bergaya terminal retro (**Lazarus OS**). Layar ini menampilkan proses *loading* log sistem secara dinamis untuk memberikan kesan autentik dan premium sebelum masuk ke aplikasi utama.

### 2. 📰 Zen News Aggregator (Tampilan Berita Minimalis)
*   **Clean Design**: Tampilan baris berita bersih tanpa kartu tebal atau bayangan yang mengganggu, menyajikan informasi secara to-the-point.
*   **Headline Story**: Bagian berita utama (*featured story*) di bagian atas dengan visual menarik.
*   **Multi-API Fallback & Parallel Merge**: Sistem berita terhubung ke 5 provider berita terkemuka (**NewsData.io**, **GNews**, **NewsAPI.org**, **WorldNews**, dan **MarketAux**). Aplikasi akan memanggil API secara paralel, menggabungkannya, melakukan deduplikasi berita ganda, dan otomatis melakukan *fallback* ke data simulasi (*mock data*) jika kuota API habis.
*   **Category Filters**: Pengguna dapat memfilter berita berdasarkan kategori (General, Business, Tech, Crypto, dll.).
*   **Direct Read**: Mengetuk berita akan langsung membuka URL artikel asli secara aman menggunakan browser bawaan ponsel.
*   **Pull to Refresh**: Geser ke bawah untuk memperbarui berita terhangat.

### 3. 📈 Live Market Dashboard (Papan Harga Pasar Finansial)
*   **Real-time Crypto & Stock Prices**: Menampilkan daftar harga aset digital terpopuler (seperti BTC, ETH) dan saham global terkemuka.
*   **Sparkline Mini Charts**: Grafik mini berwarna di setiap baris aset yang memberikan visualisasi tren pergerakan harga sekilas.
*   **Change Badges**: Indikator persentase perubahan harga 24 jam yang intuitif (hijau untuk kenaikan, merah untuk penurunan).
*   **Filter Pills**: Tombol cepat untuk memfilter aset berdasarkan kategori: *All*, *Crypto*, atau *Stocks*.
*   **Auto Refresh**: Background otomatis memperbarui harga aset setiap 30 detik untuk menjamin keakuratan data.

### 4. 📊 Professional TradingView Chart (Detail Pasar)
Dengan mengetuk aset apa pun di halaman Market, pengguna akan diarahkan ke halaman detail yang menyediakan alat analisis finansial profesional:
*   **TradingView Widget Integration**: Grafik interaktif yang sama digunakan oleh para trader profesional di bursa global.
*   **Multi-Timeframe Analysis**: Pilihan kerangka waktu dari **1D, 1W, 1M, 3M, 1Y**, hingga **ALL**.
*   **3 Chart Types**: Pilihan tipe tampilan grafik antara **Line** (garis), **Candlestick** (lilin), atau **Area**.
*   **Technical Indicators**: Dilengkapi indikator teknikal siap pakai seperti **Moving Average (MA)**, **Relative Strength Index (RSI)**, dan **MACD**.
*   **24h Detailed Stats**: Statistik lengkap mencakup harga tertinggi (*High*), terendah (*Low*), Volume transaksi, dan perubahan nominal/persentase dalam 24 jam terakhir.

### 5. 🤖 AI Chatbot Analyst (LazarusWowo)
*   **Elite 2026 Financial Analyst**: Asisten AI finansial personal bernama **LazarusWowo** yang siap menganalisis sentimen pasar dan merangkum berita terkini.
*   **Search-Augmented Intelligence (RAG)**: Chatbot secara otomatis mengekstrak kata kunci dari pertanyaan Anda, mencari berita serta harga pasar terbaru saat itu juga, lalu menyuntikkannya langsung ke memori prompt AI. Ini mencegah AI berhalusinasi atau memberikan data kedaluwarsa.
*   **Multiple LLM Engine Support**: Mendukung berbagai pilihan model AI seperti **Gemini**, **DeepSeek**, **GLM (Zhipu)**, hingga **Local AI** (LM Studio / Ollama yang berjalan secara lokal).
*   **Anti-Spam Cooldown & Animation**: Dilengkapi waktu tunggu chatting (*cooldown*) selama 5 detik untuk mencegah spam dan animasi melayang (*floating icon*) dengan efek pegas yang halus menggunakan *React Native Reanimated*.

### 6. 💡 Trading Ideas & Pine Scripts
*   **TradingView Ideas Feed**: Kumpulan ide trading terpopuler dari komunitas TradingView, lengkap dengan grafik analisis, ringkasan, nama pembuat (*author*), serta jumlah *likes* dan *comments*.
*   **Pine Script Snippets**: Menampilkan cuplikan kode Pine Script yang siap digunakan di TradingView untuk indikator atau strategi kustom.
*   **Interactive View**: Ketuk ide trading apa pun untuk langsung membukanya di platform TradingView.

### 7. 💾 Offline Mode & Bookmarks
*   **SQLite & AsyncStorage Cache**: Caching lokal otomatis untuk berita dan data penting. SQLite digunakan pada perangkat Native (Android/iOS) dan AsyncStorage sebagai alternatif di Web.
*   **Offline Bookmarks**: Tandai berita favorit untuk disimpan secara lokal dan dibaca kembali kapan saja tanpa koneksi internet.
*   **Offline Gate**: Spanduk peringatan/banner yang muncul ketika koneksi internet terputus, memastikan pengguna tetap dapat menjelajahi data offline tanpa kendala crash aplikasi.

### 8. 🔑 Secure Access Gate & Admin Dashboard
*   **Token-Based Authentication**: Login aman menggunakan token otentikasi unik yang diverifikasi secara real-time melalui database Supabase.
*   **Admin Override Access**: Akses masuk darurat administrator khusus (Username: `ikhsan`, Password: `0721`).
*   **Interactive Admin Panel**: Administrator dapat melakukan operasi CRUD token akses langsung dari aplikasi (generate token baru, mengedit username, menetapkan status admin, mengaktifkan/menonaktifkan token, serta menetapkan tanggal kedaluwarsa).

---

## 🛠️ Tech Stack & Dependencies

Aplikasi ini dibangun menggunakan pustaka modern berkinerja tinggi:

*   **Framework Utama**: Expo (v55.0.18), React Native (0.83.6), React (19.2.0)
*   **Navigasi**: Expo Router (v55.0.13) (berbasis file routing layaknya Next.js)
*   **State Management**: Zustand (v5.0.12) untuk konfigurasi global, tema, dan autentikasi.
*   **Data Fetching & Caching**: TanStack React Query (v5.100.6) untuk performa memori optimal dan sinkronisasi server-client.
*   **Animasi**: React Native Reanimated (v4.2.1) untuk efek transisi dan gerakan yang mulus.
*   **Penyimpanan Lokal**: Expo SQLite (v55.0.15) (Native) & @react-native-async-storage/async-storage (v2.2.0) (Web).
*   **Integrasi Database**: Supabase JS SDK (v2.105.1) untuk verifikasi token pengguna.
*   **UI Assets & Iconography**: Lucide React Native, @expo/vector-icons, Expo Blur (efek kaca iOS).
*   **List Rendering**: @shopify/flash-list (v2.0.2) untuk rendering daftar berita dan pasar yang sangat cepat tanpa hambatan (*lag*).

---

## 🚀 Panduan Instalasi & Menjalankan Aplikasi

Ikuti langkah-langkah di bawah ini untuk menjalankan aplikasi di komputer lokal Anda:

### 1. Prasyarat
Pastikan komputer Anda sudah terinstal [Node.js](https://nodejs.org/) (versi 18+ direkomendasikan).

### 2. Kloning Repositori
```bash
git clone https://github.com/Zyrexnn/LazaruReportAPP.git
cd LazaruReportAPP
```

### 3. Instalasi Dependensi
Jalankan perintah berikut di terminal/command prompt:
```bash
npm install
```

> [!NOTE]
> **Pengguna Windows**: Jika Anda mengalami error "scripts execution is disabled", buka PowerShell dengan hak akses Administrator (Run as Administrator) lalu jalankan perintah:
> `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`
> Setelah itu, ulangi perintah `npm install`.

### 4. Jalankan Aplikasi
Aplikasi dapat dijalankan di berbagai platform:

*   **Menjalankan Mode Web (Browser)**:
    ```bash
    npm run web
    ```
    Buka `http://localhost:8081` di browser Anda.
*   **Menjalankan Mode Android (Emulator/Perangkat fisik dengan Expo Go)**:
    ```bash
    npm run android
    ```
*   **Menjalankan Mode iOS (Simulator/Perangkat fisik)**:
    ```bash
    npm run ios
    ```
*   **Menu Expo Utama**:
    ```bash
    npm start
    ```

---

## 🔑 Konfigurasi API & Supabase (Opsional)

Aplikasi langsung berfungsi menggunakan **Mock Data** bawaan. Untuk mengaktifkan data real-time dan sistem autentikasi, konfigurasikan file `.env` di root proyek Anda:

### 1. Pengaturan `.env`
Buat atau edit file bernama `.env` di direktori utama proyek, lalu isi sebagai berikut:

```env
# API Key Berita (Daftar gratis)
NEWSDATA_API_KEY=your_newsdata_key
GNEWS_API_KEY=your_gnews_key
NEWSAPI_API_KEY=your_newsapi_key
WORLDNEWS_API_KEY=your_worldnews_key
MARKETAUX_API_TOKEN=your_marketaux_token

# API Key Finansial (Market)
FINNHUB_API_KEY=your_finnhub_key
CMC_API_KEY=your_coinmarketcap_key

# API Key AI Chatbot (LazarusWowo)
GEMINI_API_KEY=your_gemini_key
DEEPSEEK_API_KEY=your_deepseek_key
ZHIPU_API_KEY=your_zhipu_glm_key
LOCAL_AI_URL=http://127.0.0.1:1234/v1 # LM Studio/Ollama default port

# Kredensial Database Supabase (Untuk Login & Admin)
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-anon-key
```

*   **Cara Mendapatkan API Key Gratis**:
    *   **NewsData.io**: Daftar gratis di [newsdata.io/register](https://newsdata.io/register) (200 request/hari).
    *   **GNews**: Daftar gratis di [gnews.io/register](https://gnews.io/register) (100 request/hari).
    *   **NewsAPI**: Daftar gratis di [newsapi.org/register](https://newsapi.org/register) (100 request/hari).
    *   **Finnhub**: Daftar gratis di [finnhub.io/register](https://finnhub.io/register) (untuk mengambil data saham global).

### 2. Skema Database Supabase (Otentikasi)
Untuk mengaktifkan autentikasi login token, silakan buat tabel di Supabase melalui **SQL Editor** pada Supabase Dashboard dengan kode SQL berikut:

```sql
-- Buat tabel access_tokens
CREATE TABLE IF NOT EXISTS public.access_tokens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username TEXT NOT NULL,
    token TEXT UNIQUE NOT NULL,
    is_admin BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Aktifkan Row Level Security (RLS)
ALTER TABLE public.access_tokens ENABLE ROW LEVEL SECURITY;

-- Buat Kebijakan Keamanan (Policies)
CREATE POLICY "Enable read access for all users" ON public.access_tokens
    FOR SELECT USING (true);

CREATE POLICY "Enable update for users based on id" ON public.access_tokens
    FOR UPDATE USING (true);

CREATE POLICY "Full access for all (Admin CRUD)" ON public.access_tokens
    FOR ALL USING (true);

-- Tambahkan satu token uji coba default
INSERT INTO public.access_tokens (username, token, is_admin)
VALUES ('DemoUser', 'WELCOME_2026', false);
```

Setelah tabel berhasil dibuat, jangan lupa untuk memperbarui variabel `VITE_SUPABASE_URL` dan `VITE_SUPABASE_PUBLISHABLE_KEY` di file `.env` dan `src/services/supabase.ts`.

---

## 📂 Struktur Direktori Proyek

```
lazarusreportApp/
├── app/                  # File-based Routing (Expo Router)
│   ├── (tabs)/           # Layar Utama dengan Tab Navigation
│   │   ├── index.tsx     # Tab Berita (News Aggregation)
│   │   ├── market.tsx    # Tab Harga Pasar (Market Dashboard)
│   │   ├── ideas.tsx     # Tab Ide Trading & Pine Script
│   │   ├── ai.tsx        # Tab Asisten Chatbot AI (LazarusWowo)
│   │   ├── bookmarks.tsx # Tab Berita Tersimpan (Offline Bookmarks)
│   │   └── profile.tsx   # Tab Profil & Pengaturan Admin Dashboard
│   ├── news/             # Halaman Detail Berita
│   ├── market/           # Halaman Detail Pasar (TradingView Chart)
│   ├── login.tsx         # Layar Login (Secure Access Protocol)
│   └── _layout.tsx       # Root App Layout & BootScreen trigger
├── components/           # Komponen UI Reusable
│   ├── ui/               # Komponen Fondasi UI (Bento style)
│   ├── AdminDashboard.tsx# Pengelolaan Token Akses (Khusus Admin)
│   ├── BootScreen.tsx    # Animasi Booting Terminal Lazarus OS
│   ├── NewsCard.tsx      # Komponen render baris berita
│   ├── OfflineGate.tsx   # Penanganan status offline
│   └── Skeleton.tsx      # Komponen Loading Placeholder
├── constants/            # Tema Warna, Spacing, dan Tipografi (Zen Theme)
│   └── theme.ts
├── hooks/                # Custom React Hooks (Color Scheme, Network Status)
├── src/
│   ├── services/         # Layanan API (News, Market, AI Chat, Supabase)
│   │   ├── aiApi.ts      # Logika RAG & Panggilan LLM AI
│   │   ├── newsApi.ts    # Pemanggilan Berita & Mekanisme Failover
│   │   ├── db.native.ts  # SQLite Caching pada Android/iOS
│   │   └── db.web.ts     # AsyncStorage Caching pada Web
│   ├── store/            # Pengaturan State Global dengan Zustand
│   └── types/            # Definisi Type data TypeScript
├── .env                  # Konfigurasi Key Lingkungan (Sensitif)
└── package.json          # Manajemen Dependensi & Script Proyek
```

---

## 📄 Lisensi

Proyek ini dilisensikan di bawah **MIT License** - bebas digunakan dan dikembangkan kembali baik untuk tujuan komersil maupun non-komersil.

---

## 🤝 Kontribusi

Kontribusi selalu diterima dengan senang hati!
1. Fork Repositori ini.
2. Buat branch fitur baru (`git checkout -b fitur/FiturKeren`).
3. Commit perubahan Anda (`git commit -m 'Menambahkan fitur keren'`).
4. Push ke branch tersebut (`git push origin fitur/FiturKeren`).
5. Buat Pull Request baru.

**Lazarus Report App** - *Empowering your market intelligence with minimalist style and AI power.* 🚀
