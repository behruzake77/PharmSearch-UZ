# Texnik Arxitektura — Apteka Ovozli Qidiruv Tizimi

## 1. Arxitektura falsafasi

> "Har doim eng sodda ishlaydigan yechim — eng to'g'ri yechimdir, agar u talablarga javob bersa."

3–4 foydalanuvchi uchun mo'ljallangan tizimda murakkab, ko'p qatlamli arxitektura vaqt va resurslarni behuda sarflaydi. Shuning uchun bu loyihada **monolit arxitektura** tanlandi: bitta backend xizmat, bitta frontend ilova, bitta ma'lumotlar bazasi.

## 2. Umumiy arxitektura sxemasi

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js)                    │
│  - Mikrofon orqali ovoz yozish (Web Audio API)           │
│  - Natijalarni ko'rsatish UI                              │
│  - Qidiruv tarixi UI                                      │
└───────────────────────┬───────────────────────────────────┘
                         │ HTTPS (REST API, JSON)
                         ▼
┌─────────────────────────────────────────────────────────┐
│                 BACKEND (FastAPI, bitta server)           │
│                                                             │
│  ┌───────────────┐   ┌────────────────┐  ┌─────────────┐ │
│  │ API Layer      │──▶│  AI Modul       │─▶│ Search Modul│ │
│  │ (routes)       │   │ (Whisper +      │  │ (GoPharm +  │ │
│  │                │   │  RapidFuzz)     │  │  Google)    │ │
│  └───────────────┘   └────────────────┘  └─────────────┘ │
│           │                                                │
│           ▼                                                │
│  ┌───────────────────────────────────────────────────────┐│
│  │  Data Layer (SQLAlchemy ORM)                            ││
│  └───────────────────────────────────────────────────────┘│
└───────────────────────┬───────────────────────────────────┘
                         │
                         ▼
             ┌───────────────────────┐
             │ PostgreSQL yoki SQLite │
             │ (qidiruv tarixi,       │
             │  keshlangan natijalar, │
             │  foydalanuvchi sozlamalari) │
             └───────────────────────┘
```

## 3. Komponentlar tavsifi

### 3.1. Frontend (Next.js / React)

- Foydalanuvchi interfeysi — bitta sahifali ilova (SPA uslubida).
- Vazifalari:
  - Mikrofon orqali ovoz yozib olish va backend'ga yuborish.
  - Qidiruv natijalarini kartochka (card) ko'rinishida ko'rsatish.
  - Yuklanish holati (loading), xatoliklar va bo'sh natijalarni chiroyli ko'rsatish.
  - Oddiy qidiruv tarixi ro'yxati.
- **Murakkab state-management kutubxonalar (Redux va h.k.) kerak emas** — React'ning ichki `useState`/`useContext` yetarli.

### 3.2. Backend (FastAPI)

Bitta FastAPI ilovasi, ichida quyidagi modullar (papkalar) bo'ladi:

- `api/` — HTTP endpointlar (routes)
- `ai/` — sun'iy intellekt bilan bog'liq mantiq (Whisper, RapidFuzz)
- `search/` — GoPharm va Google qidiruv integratsiyasi
- `db/` — ma'lumotlar bazasi modellar va ulanish
- `core/` — konfiguratsiya, sozlamalar, umumiy yordamchi funksiyalar

Bu **modul-modul (modular monolith)** yondashuvi deb ataladi: kod bitta ilova ichida, lekin mantiqiy jihatdan aniq bo'linadi. Bu kelajakda kerak bo'lsa, alohida servisga ajratishni ham osonlashtiradi (lekin hozircha bunga ehtiyoj yo'q).

### 3.3. AI Modul (alohida, mustaqil qism)

AI modul backend ichida, lekin qat'iy ravishda **alohida modul** sifatida yoziladi (masalan, `ai/` papkasi), shunda:
- Kelajakda Whisper modelini almashtirish (masalan, boshqa STT xizmatiga o'tish) faqat shu modulga tegadi.
- AI mantiqni test qilish REST API'dan mustaqil holda mumkin bo'ladi.

AI modul ichida ikkita asosiy funksiya:
1. **Speech-to-Text (Whisper)** — audio → matn.
2. **Fuzzy Matching (RapidFuzz)** — noaniq matn → eng yaqin dori nomi/nomlari.

Batafsil tafsilotlar `05_AI_MODUL.md` faylida.

### 3.4. Qidiruv Modul (Search Layer)

- **GoPharm** — asosiy va birlamchi manba. Barcha qidiruvlar avvalo shu yerdan boshlanadi.
- **Google qidiruv** — faqat quyidagi holatlarda ishlatiladi:
  - Dori uchun rasm topish kerak bo'lganda;
  - GoPharm'da hech qanday natija topilmaganda, qo'shimcha/yordamchi ma'lumot sifatida.

### 3.5. Ma'lumotlar bazasi

- **Standart holat:** SQLite — chunki 3–4 foydalanuvchi uchun alohida DB-server ishga tushirish shart emas, fayl asosidagi baza yetarli, backup ham oson (bitta faylni ko'chirish).
- **PostgreSQL'ga o'tish sharti:** agar loyiha kelajakda bir nechta apteka tarmog'iga kengaysa va parallel yozish (concurrent writes) ko'proq bo'lsa, PostgreSQL'ga o'tish tavsiya etiladi.
- Bu tanlov muhandis tomonidan loyihani ishga tushirish bosqichida hal qilinadi (batafsil — `04_MALUMOTLAR_BAZASI.md`).

## 4. Deployment (joylashtirish) arxitekturasi

Loyiha uchun **bitta server** yetarli:

```
┌─────────────────────────────────────┐
│     Bitta server / Replit Deployment │
│                                       │
│  ┌───────────┐   ┌────────────────┐  │
│  │ Next.js    │   │ FastAPI        │  │
│  │ (frontend) │   │ (backend + AI) │  │
│  └───────────┘   └────────────────┘  │
│           │              │            │
│           └──────┬───────┘            │
│                   ▼                   │
│           SQLite/PostgreSQL fayli     │
└─────────────────────────────────────┘
```

- Alohida load balancer, CDN, reverse proxy klasteri — **kerak emas**.
- Agar domen va SSL kerak bo'lsa, oddiy reverse proxy (masalan, Caddy yoki Replit'ning o'zining domain xizmati) yetarli.

## 5. Xavfsizlik (soddalashtirilgan darajada)

3–4 ishonchli foydalanuvchi uchun quyidagi darajadagi xavfsizlik yetarli:

- Oddiy login/parol autentifikatsiya (JWT yoki sessiya asosida) — murakkab OAuth/SSO shart emas.
- HTTPS orqali ishlash (Replit avtomatik taqdim etadi).
- API kalitlar (`.env` fayl orqali) — kodga yozilmaydi.
- Rate limiting — ixtiyoriy, chunki foydalanuvchilar soni juda kam.

## 6. Monitoring va loglash

- Murakkab monitoring tizimlari (Prometheus, Grafana) **kerak emas**.
- Oddiy fayl-asosidagi yoki konsol logging (Python `logging` moduli) yetarli.
- Xatoliklar asosiy loglarga yoziladi, kerak bo'lsa keyinchalik ko'rib chiqiladi.

## 7. Kelajakdagi kengayish yo'nalishlari (hozircha amalga oshirilmaydi)

Quyidagilar hozirgi bosqichda **kiritilmaydi**, lekin arxitektura ularga tayyor bo'lishi kerak (modul-modul tuzilish tufayli):

- Bir nechta apteka filiallari uchun markazlashtirilgan boshqaruv paneli.
- Ombor/qoldiq boshqaruvi integratsiyasi.
- Mobil ilova (React Native) qo'shilishi.
- Agar yuklama sezilarli oshsa — Redis keshlash yoki Celery orqali fon vazifalarini bajarish.
