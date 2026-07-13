# Replit Agent Promptlari — Bosqichma-bosqich Ishga Tushirish Rejasi

Ushbu hujjatda loyihani Replit Agent yordamida qadamma-qadam qurish uchun tayyor promptlar keltirilgan. Har bir bosqichni **alohida-alohida**, ketma-ket Replit Agent'ga bering. Har bir bosqichdan keyin natijani tekshiring, so'ngra keyingisiga o'ting.

---

## BOSQICH 1 — Loyiha skeleti va asosiy struktura

```
Sen Senior Full-Stack Developer sifatida ishlayapsan. Men uchun kichik hajmdagi 
loyiha yarat: O'zbekiston aptekalari uchun ovozli dori qidiruv tizimi. 
Bu loyiha faqat 3-4 foydalanuvchi tomonidan bir vaqtda ishlatiladi, shuning uchun 
ENG SODDA va MONOLIT arxitektura kerak. Microservice, Kubernetes, Elasticsearch, 
Redis, Celery ISHLATMA.

Quyidagi texnologik stekni ishlat:
- Backend: FastAPI (Python)
- Frontend: Next.js (React)
- Ma'lumotlar bazasi: SQLite (SQLAlchemy ORM orqali)

Loyiha papka strukturasini quyidagicha yarat:

backend/
  ├── main.py
  ├── api/
  ├── ai/
  ├── search/
  ├── db/
  └── core/
frontend/
  ├── (Next.js standart strukturasi)

Hozircha faqat bo'sh struktura, asosiy konfiguratsiya fayllari (requirements.txt, 
package.json), FastAPI'ning "Hello World" endpointi va Next.js'ning boshlang'ich 
sahifasini yarat. Hali AI yoki qidiruv logikasini yozma — bu keyingi bosqichda bo'ladi.
```

---

## BOSQICH 2 — Ma'lumotlar bazasi modellari

```
Backend ichidagi db/ papkasida SQLAlchemy modellarini yarat. Quyidagi jadvallar kerak:

1. users (id, full_name, username, password_hash, role, pharmacy_id, created_at)
2. pharmacies (id, name, address, phone, created_at)
3. search_queries (id, user_id, raw_transcript, corrected_query, source_used, 
   result_found, created_at)
4. medicines_cache (id, name, description, price, image_url, source, last_updated)

Alembic orqali migratsiya tizimini sozla. SQLite fayli sifatida "pharmacy.db" 
ishlatilsin. Har bir model uchun tegishli Pydantic sxemalarini ham (request/response 
uchun) alohida yarat. Kod sodda va tushunarli bo'lsin, ortiqcha abstraksiya qo'shma.
```

---

## BOSQICH 3 — Autentifikatsiya moduli

```
Backend'da oddiy autentifikatsiya tizimini yarat:

1. POST /api/v1/auth/login — username/parol orqali JWT token qaytaradi
2. GET /api/v1/auth/me — joriy foydalanuvchi ma'lumotini qaytaradi

Parolni bcrypt orqali xeshla. JWT token yaratish uchun python-jose yoki PyJWT 
kutubxonasidan foydalan. Murakkab rol-tizimlari (RBAC) kerak emas — faqat 
"admin" va "pharmacist" rollarini farqlash yetarli.

Test uchun bitta admin foydalanuvchi va bitta apteka yozuvini avtomatik yaratadigan 
seed skript ham yoz (masalan, database birinchi marta yaratilganda ishga tushadigan).
```

---

## BOSQICH 4 — AI Modul: Speech-to-Text (Whisper)

```
Backend ichida ai/ papkasida speech_to_text.py faylini yarat. Bu fayl OpenAI 
Whisper modelini (lokal, "base" versiyasi) ishlatib, audio faylni matnga 
aylantiradigan funksiyani o'z ichiga olsin.

Talablar:
- Funksiya audio faylni (.wav yoki .webm formatida) qabul qilishi kerak
- Whisper modelini ilova ishga tushganda bir marta yuklab, xotirada saqlab qo'yish 
  kerak (har safar qayta yuklamaslik uchun)
- Natija sifatida xom matnni (string) qaytarishi kerak
- Xatolik yuz berganda tushunarli xatolik xabari bilan qaytishi kerak

Bu modulni qolgan backend logikasidan MUSTAQIL qilib yoz — u faqat audio kirish 
va matn chiqishi bilan ishlaydi, boshqa hech narsani bilmasligi kerak.
```

---

## BOSQICH 5 — AI Modul: Matn normalizatsiya va RapidFuzz

```
Backend ai/ papkasida ikkita fayl yarat:

1. text_normalizer.py — Whisper natijasidagi matnni tozalash funksiyasi 
   (kichik harflarga o'tkazish, ortiqcha bo'shliqlarni olib tashlash, 
   dozirovka raqamlarini ajratib olish).

2. fuzzy_matcher.py — RapidFuzz kutubxonasidan foydalanib, tozalangan matnni 
   oldindan tayyorlangan dori nomlari ro'yxati (lug'at) bilan solishtiradigan 
   va eng yaqin 1-3 nomzodni ishonchlilik foizi bilan qaytaradigan funksiya.

Dori nomlari lug'ati hozircha oddiy JSON fayl sifatida saqlansin 
(medicine_dictionary.json) — keyinchalik bu GoPharm bazasidan dinamik 
yuklanadigan bo'ladi.

Ishonchlilik chegarasi (masalan, 70%) dan past bo'lgan natijalar uchun 
"topilmadi" holatini qaytaruvchi mantiqni ham qo'sh.
```

---

## BOSQICH 6 — Qidiruv Moduli: GoPharm va Google integratsiyasi

```
Backend'da search/ papkasida ikkita fayl yarat:

1. gopharm_search.py — GoPharm saytidan/tizimidan dori nomi bo'yicha qidiruv 
   qiluvchi funksiya. Bu ASOSIY qidiruv manbai. (Agar rasmiy API mavjud bo'lmasa, 
   ruxsat etilgan chegarada oddiy web-scraping yoki mavjud integratsiya usulini 
   taklif qil, lekin avval GoPharm'da ochiq API bor-yo'qligini tekshirish kerakligini 
   eslatib o't.)

2. google_search.py — Google Custom Search API orqali FAQAT quyidagi holatlar 
   uchun qidiruv qiladigan funksiya:
   - Dori rasmi topish
   - GoPharm hech qanday natija bermagan holatda yordamchi/zaxira qidiruv

Ikkala modul ham mustaqil funksiyalar sifatida yozilsin, natijalar bir xil 
formatga (masalan, umumiy "SearchResult" sxemasiga) keltirilsin, shunda ularni 
almashtirish yoki birlashtirish oson bo'ladi.
```

---

## BOSQICH 7 — Asosiy qidiruv endpointini birlashtirish

```
Backend api/ papkasida search.py routerini yarat va quyidagi endpointlarni 
qo'sh:

1. POST /api/v1/search/voice — audio faylni qabul qiladi, quyidagi ketma-ketlikda 
   ishlaydi:
   a) speech_to_text.py orqali matnga aylantiradi
   b) text_normalizer.py orqali tozalaydi
   c) fuzzy_matcher.py orqali dori nomini aniqlaydi
   d) gopharm_search.py orqali qidiradi
   e) agar natija topilmasa yoki rasm kerak bo'lsa, google_search.py ga murojaat qiladi
   f) natijani search_queries jadvaliga saqlaydi (tarix uchun)
   g) yakuniy natijani JSON formatida qaytaradi

2. POST /api/v1/search/text — xuddi shu logika, lekin audio o'rniga to'g'ridan-to'g'ri 
   matn qabul qiladi (Whisper bosqichi o'tkazib yuboriladi)

3. GET /api/v1/search/history — joriy foydalanuvchining oxirgi qidiruvlarini qaytaradi

Barcha javoblar 06_API_SPETSIFIKATSIYASI.md hujjatida ko'rsatilgan JSON 
formatlariga mos kelishi kerak. Xatoliklarni to'g'ri boshqarish (try/except) 
va tushunarli xato xabarlarini qaytarishni unutma.
```

---

## BOSQICH 8 — Frontend: Asosiy interfeys

```
Next.js frontend'da quyidagi sahifa va komponentlarni yarat:

1. Login sahifasi (/login) — username/parol kiritish formasi
2. Asosiy qidiruv sahifasi (/) — quyidagilarni o'z ichiga oladi:
   - Katta mikrofon tugmasi (bosilganda ovoz yozishni boshlaydi, Web Audio API 
     yordamida)
   - Yozib olingan audio faylni backend'ga (/api/v1/search/voice) yuborish
   - Yuklanish holatini (spinner/loading) ko'rsatish
   - Natijalarni chiroyli kartochka (card) ko'rinishida ko'rsatish 
     (dori nomi, tavsif, narx, rasm)
   - Agar bir nechta mos nomzod bo'lsa, foydalanuvchiga tanlash imkoniyatini berish
3. Qidiruv tarixi sahifasi (/history) — oxirgi qidiruvlar ro'yxati

Dizayn sodda, tez yuklanadigan va planshet/kompyuter ekranida yaxshi ko'rinadigan 
bo'lsin. Murakkab UI kutubxonalar (masalan, og'ir component-kit'lar) shart emas — 
Tailwind CSS bilan sodda va tushunarli dizayn yetarli.
```

---

## BOSQICH 9 — Autentifikatsiyani frontendga ulash

```
Frontend'da autentifikatsiya oqimini to'liq ulab qo'y:

1. Login formasi orqali backend'ning /api/v1/auth/login endpointiga so'rov yuborish
2. JWT tokenni xavfsiz saqlash (masalan, httpOnly cookie yoki oddiy holatda 
   localStorage — loyiha kichik bo'lgani uchun soddaroq variant ham qabul qilinadi)
3. Barcha keyingi API so'rovlariga Authorization header qo'shish
4. Agar token muddati o'tgan yoki noto'g'ri bo'lsa, foydalanuvchini avtomatik 
   login sahifasiga qaytarish
5. Oddiy "Chiqish" (logout) tugmasi qo'shish

Murakkab autentifikatsiya kutubxonalar (NextAuth kabi to'liq freymvorklar) shart 
emas — oddiy fetch/axios asosidagi yechim yetarli.
```

---

## BOSQICH 10 — Test qilish va sozlash

```
Loyihani to'liq test qil:

1. Backend uchun asosiy endpointlarga oddiy pytest testlarini yoz (kamida: 
   login, /search/text, /search/voice happy-path testlari)
2. .env.example faylini yarat — barcha kerakli maxfiy o'zgaruvchilarni 
   (Google API kaliti, JWT secret, va h.k.) ko'rsatib

3. GET /api/v1/health endpointini tekshir — u serverning ishlab turganini, 
   Whisper modeli yuklanganini va DB ulanishini ko'rsatishi kerak

4. Butun tizimni boshidan oxirigacha qo'lda test qil: login → mikrofon orqali 
   dori nomi aytish → natija ko'rish → tarixni tekshirish

Har qanday aniqlangan xatoliklarni tuzat. Loyihani ortiqcha murakkablashtirmasdan, 
faqat mavjud funksionallikni barqarorlashtirishga e'tibor qarat.
```

---

## BOSQICH 11 — Deployment (joylashtirish)

```
Loyihani Replit Deployment orqali ishga tushirishga tayyorla:

1. Backend va frontend'ni bitta Repl ichida birgalikda ishlaydigan qilib sozla 
   (yoki ikkita alohida servis sifatida, agar Replit shuni talab qilsa)
2. Production uchun kerakli environment variable'larni sozla
3. SQLite fayli uchun persistent storage to'g'ri ishlashini tekshir 
   (Replit qayta ishga tushganda ma'lumotlar yo'qolmasligi kerak)
4. Oddiy health-check orqali deploy muvaffaqiyatli bo'lganini tasdiqla

Murakkab CI/CD pipeline yoki Docker konteynerlashtirish SHART EMAS — Replit'ning 
o'zining deployment mexanizmi yetarli.
```

---

## Umumiy eslatma Replit Agent uchun

Har bir bosqichni boshlashdan oldin, quyidagi qoidalarni har doim eslab turing:

- Bu loyiha atigi 3-4 foydalanuvchi uchun mo'ljallangan — enterprise yechimlar KERAK EMAS.
- Elasticsearch, Kubernetes, Microservices, keraksiz Redis/Celery ishlatilmaydi.
- Kod imkon qadar sodda, o'qilishi oson va modul-modul bo'lishi kerak.
- Har bir modul (AI, qidiruv, DB) bir-biridan mustaqil va aniq chegaralangan bo'lishi kerak.
