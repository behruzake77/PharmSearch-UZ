# Loyiha Umumiy Ko'rinishi — Apteka Ovozli Qidiruv Tizimi (AVQT)

## 1. Loyiha maqsadi

Ushbu loyiha — O'zbekiston aptekalari uchun mo'ljallangan, **ovoz orqali dori qidiruvini amalga oshiradigan** AI-yordamchi tizimidir. Foydalanuvchi (apteka xodimi) mikrofon orqali dori nomini talaffuz qiladi, tizim ovozni matnga aylantiradi, noto'g'ri yoki noaniq talaffuzni to'g'rilaydi va GoPharm bazasidan mos dori(lar)ni topib, natijani ekranda ko'rsatadi.

## 2. Loyihaning ko'lami (Scope)

| Parametr | Qiymat |
|---|---|
| Foydalanuvchilar soni | 3–4 kishi (bir vaqtning o'zida) |
| Foydalanish joyi | 1 yoki bir nechta apteka (bitta tashkilot ichida) |
| Yuklama (load) | Juda past — kuniga bir necha o'nlab so'rovlar |
| Byudjet | Minimal / bepul infratuzilmaga yaqin |
| Maqsad platforma | Web-ilova (desktop va planshetda ishlaydigan brauzer orqali) |

**Muhim arxitektura printsipi:** Bu tizim **enterprise yoki yuqori yuklama uchun emas**. Barcha texnik qarorlar shuni hisobga olib qabul qilinadi — soddalik, tezlik va past xarajat ustuvor mezonlardir.

## 3. Asosiy funksional imkoniyatlar

1. **Ovozli kiritish** — foydalanuvchi brauzerda mikrofon tugmasini bosib, dori nomini aytadi.
2. **Speech-to-Text** — ovoz Whisper modeli yordamida matnga aylantiriladi (o'zbek/rus/aralash talaffuzlarni hisobga olgan holda).
3. **Noaniq moslikni tuzatish (Fuzzy Matching)** — RapidFuzz kutubxonasi yordamida talaffuzda xato bo'lgan dori nomlari ham to'g'ri natijaga yo'naltiriladi.
4. **Asosiy qidiruv manbai — GoPharm** — dori haqidagi asosiy ma'lumot (narx, mavjudlik, analoglar) GoPharm tizimidan olinadi/qidiriladi.
5. **Google qidiruvi — yordamchi rol** — faqat dori rasmi topish yoki GoPharm'da natija bo'lmagan holatlarda qo'shimcha qidiruv sifatida ishlatiladi.
6. **Natijalarni ko'rsatish** — topilgan dori(lar) nomi, tavsifi, narxi (mavjud bo'lsa) va rasmi bilan foydalanuvchiga ko'rsatiladi.
7. **Qidiruv tarixi** — oxirgi qidiruvlar ro'yxati (soddalashtirilgan, faqat ko'rish uchun).

## 4. Loyihaning nofunksional talablari

- **Tezlik**: ovozdan natijagacha bo'lgan javob vaqti 3–5 soniyadan oshmasligi kerak.
- **Soddalik**: bitta backend, bitta frontend, keraksiz qatlamlarsiz.
- **Ishonchlilik**: xatolik yuz berganda tizim tushunarli xabar bilan foydalanuvchiga qaytishi kerak (crash bo'lmasligi kerak).
- **Arzonlik**: server resurslari minimal (1 kichik VPS yoki Replit Deployment darajasida yetarli).
- **Kengaytiriluvchanlik**: kelajakda yangi apteka tarmoqlari yoki yangi funksiyalar (masalan, ombor boshqaruvi) qo'shilishi mumkin — shu sababli modul-modul kod tuzilishi talab qilinadi.

## 5. Nima ISHLATILMAYDI (ataylab chiqarib tashlangan)

Loyihaning haddan tashqari murakkablashib ketmasligi uchun quyidagi texnologiyalar **ataylab ishlatilmaydi**:

- ❌ Elasticsearch — 3-4 foydalanuvchi uchun keraksiz yuklama
- ❌ Kubernetes — orkestratsiya bu masshtabda ortiqcha
- ❌ Microservice arxitektura — monolit yetarli va boshqarish osonroq
- ❌ Redis / Celery — faqat haqiqiy zaruratda (masalan, uzoq AI so'rovlarni navbatga qo'yish kerak bo'lsa) kiritiladi, boshlang'ich bosqichda yo'q
- ❌ Ko'p tilli mikroxizmatlar, message broker'lar, service mesh va shunga o'xshash enterprise vositalar

## 6. Yuqori darajadagi tizim oqimi (High-level Flow)

```
Foydalanuvchi (mikrofon) 
      │
      ▼
Frontend (Next.js/React) — ovozni yozib oladi
      │
      ▼
FastAPI Backend — audio faylni qabul qiladi
      │
      ▼
AI Modul:
   1) Whisper → matn
   2) RapidFuzz → dori nomini to'g'rilash
   3) GoPharm qidiruv → asosiy natija
   4) (zarur bo'lsa) Google qidiruv → rasm/yordamchi ma'lumot
      │
      ▼
Backend natijani JSON qilib qaytaradi
      │
      ▼
Frontend natijani foydalanuvchiga ko'rsatadi
```

## 7. Loyiha hujjatlari tuzilishi

Ushbu loyiha uchun quyidagi hujjatlar tayyorlangan (har biri alohida fayl):

1. `01_LOYIHA_UMUMIY_KORINISHI.md` — ushbu fayl
2. `02_ARXITEKTURA.md` — texnik arxitektura va komponentlar
3. `03_TEXNOLOGIYALAR_STEKI.md` — texnologiyalar va ularni tanlash sabablari
4. `04_MALUMOTLAR_BAZASI.md` — DB sxemasi
5. `05_AI_MODUL.md` — Whisper, RapidFuzz, GoPharm/Google qidiruv moduli tafsiloti
6. `06_API_SPETSIFIKATSIYASI.md` — backend API endpointlari
7. `07_REPLIT_AGENT_PROMPTLARI.md` — Replit Agent uchun bosqichma-bosqich promptlar

Keyingi hujjatda tizimning texnik arxitekturasi batafsil ko'rib chiqiladi.
