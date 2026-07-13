# Texnologiyalar Steki va Tanlash Sabablari

## 1. Umumiy jadval

| Qatlam | Texnologiya | Sabab |
|---|---|---|
| Frontend | Next.js (React asosida) | Server-side rendering ixtiyoriy, tez ishga tushirish, keng community |
| Backend | FastAPI (Python) | Yengil, tez, avtomatik API hujjatlar (Swagger), AI kutubxonalar bilan mos (Python ekotizimi) |
| Ma'lumotlar bazasi | SQLite (standart) / PostgreSQL (zaruratda) | Minimal resurs, oson backup, kerak bo'lsa PostgreSQL'ga oson migratsiya |
| Speech-to-Text | OpenAI Whisper (lokal yoki API) | Yuqori aniqlik, ko'p tillilik, o'zbek/rus aralash nutqni yaxshi taniydi |
| Fuzzy matching | RapidFuzz (Python) | Juda tez, C++ asosida yozilgan, minimal resurs sarflaydi |
| Asosiy qidiruv | GoPharm (parsing/API integratsiya) | Loyihaning asosiy va ishonchli manbai |
| Yordamchi qidiruv | Google (Custom Search API yoki scraping) | Faqat rasm va zaxira ma'lumot uchun |
| Deployment | Replit Deployments (yoki kichik VPS) | Bepul/arzon, oson boshqarish, DevOps talab qilmaydi |

## 2. Nega bu texnologiyalar tanlandi

### 2.1. FastAPI (Django yoki Flask o'rniga)

- **Django** — to'liq "batteries-included" freymvork bo'lib, admin panel, ORM, autentifikatsiya kabi ko'plab narsalarni o'z ichiga oladi. Bu loyiha uchun ortiqcha og'irlik.
- **Flask** — juda sodda, lekin FastAPI zamonaviy imkoniyatlarni (avtomatik validatsiya - Pydantic, avtomatik Swagger hujjatlar, async support) qo'shimcha kutubxonasiz taqdim etadi.
- **Xulosa:** FastAPI — soddalik va zamonaviylik o'rtasidagi eng yaxshi muvozanat, ayniqsa AI/ML integratsiyalari uchun Python ekotizimida qulay.

### 2.2. Next.js (oddiy React o'rniga)

- Next.js loyihani tezda ishga tushirish uchun tayyor struktura beradi (routing, build tizimi).
- Agar kerak bo'lmasa, SSR (server-side rendering) ishlatilmasligi ham mumkin — static/SPA rejimda ham ishlaydi.
- Alternativ sifatida oddiy Vite + React ham ishlatilishi mumkin, ammo Next.js Replit muhitida standart va yaxshi qo'llab-quvvatlanadi.

### 2.3. SQLite vs PostgreSQL

| Mezon | SQLite | PostgreSQL |
|---|---|---|
| O'rnatish murakkabligi | Yo'q (fayl asosida) | Alohida server kerak |
| 3-4 foydalanuvchi uchun yetarlimi | Ha, to'liq yetarli | Ha, lekin ortiqcha |
| Concurrent yozish | Cheklangan, lekin bu masshtabda muammo emas | Yaxshi |
| Backup | Bitta faylni nusxalash | pg_dump kerak |
| Tavsiya | **Boshlang'ich va standart tanlov** | Faqat kelajakda ko'p filial/parallel yuklama bo'lsa |

**Qaror:** Loyiha SQLite bilan boshlanadi. Agar kelajakda talab oshsa, SQLAlchemy ORM ishlatilgani sababli PostgreSQL'ga o'tish kod darajasida minimal o'zgarish bilan amalga oshiriladi.

### 2.4. Whisper (boshqa STT xizmatlar o'rniga)

- Whisper ochiq kodli (open-source) va lokal ishga tushirish imkonini beradi — bu **doimiy API xarajatlaridan qochish** demakdir.
- Agar server resurslari (GPU) yetarli bo'lmasa, Whisper'ning kichik modeli (`base` yoki `small`) CPU'da ham maqbul tezlikda ishlaydi — bu 3-4 foydalanuvchi uchun to'liq yetarli.
- Muqobil variant: OpenAI Whisper API (pullik, lekin serverga yuklama tushmaydi) — agar server resurslari kuchsiz bo'lsa, shu variant tavsiya etiladi.

### 2.5. RapidFuzz (FuzzyWuzzy o'rniga)

- RapidFuzz — FuzzyWuzzy'ning tezlashtirilgan, litsenziyaviy muammosiz alternativi.
- C++ asosida yozilgan, shuning uchun katta lug'atlarda ham (masalan, minglab dori nomlari) juda tez ishlaydi.
- Minimal server resurslarida ham yaxshi ishlaydi — bu loyihaning asosiy tamoyiliga mos.

### 2.6. GoPharm va Google integratsiyasi

- **GoPharm** — asosiy manba sifatida, chunki bu O'zbekiston aptekalari uchun eng mos va mahalliylashtirilgan ma'lumot bazasi.
- **Google** — faqat ikkinchi darajali yordamchi vosita: rasm qidirish yoki GoPharm natija bermagan holatlar uchun zaxira variant.
- Bu ikkalasi ham alohida modul ichida joylashtiriladi (`search/gopharm.py`, `search/google_search.py`), shunda kelajakda boshqa manba qo'shish yoki almashtirish oson bo'ladi.

## 3. Ishlatilmaydigan texnologiyalar va sabablari

| Texnologiya | Nega ishlatilmaydi |
|---|---|
| Elasticsearch | Juda kam ma'lumot hajmi va foydalanuvchi soni uchun ortiqcha resurs va murakkablik keltiradi |
| Kubernetes | Orkestratsiya faqat ko'p instansiya/klaster kerak bo'lganda foydali; bu yerda bitta instansiya yetarli |
| Microservices | Xizmatlar orasidagi tarmoq chaqiruvlari, monitoring va deployment murakkabligini oshiradi — foyda keltirmaydi |
| Redis | Keshlash faqat yuklama katta bo'lganda foyda beradi; bu yerda oddiy in-memory yoki DB darajasidagi keshlash yetarli |
| Celery | Fon vazifalar navbati faqat uzoq davom etadigan operatsiyalar ko'p bo'lganda kerak; hozircha Whisper so'rovi to'g'ridan-to'g'ri qayta ishlanishi mumkin |
| GraphQL | REST API bu masshtabda barcha ehtiyojlarni qoplaydi, GraphQL qo'shimcha murakkablik qo'shadi |

## 4. Kelajakda qo'shilishi mumkin bo'lgan texnologiyalar (shart bilan)

| Texnologiya | Qachon qo'shiladi |
|---|---|
| Redis | Agar bir xil so'rovlar juda ko'p takrorlansa va keshlash orqali tezlikni oshirish zarurati tug'ilsa |
| Celery / background tasks | Agar Whisper so'rovlari serverni bloklab qo'yadigan darajada uzoq davom etsa (masalan, 10+ soniya) |
| Docker | Deploy jarayonini standartlashtirish uchun (ixtiyoriy, Replit'da shart emas) |
| CI/CD (GitHub Actions) | Agar jamoa kattalashsa yoki tez-tez relizlar chiqarilsa |
