# AI Modul — Batafsil Tavsif

## 1. Modulning umumiy vazifasi

AI modul backend ichida joylashgan, lekin mustaqil va aniq chegaralangan qism sifatida yoziladi (`ai/` papkasi). Uning vazifasi — foydalanuvchi ovozini qabul qilib, aniq va to'g'ri dori nomiga aylantirish.

**Modul ichidagi bosqichlar:**

```
Audio fayl (foydalanuvchi ovozi)
        │
        ▼
 [1] Speech-to-Text (Whisper)
        │
        ▼
  Xom matn (masalan: "parasetamol" yoki "para setamol")
        │
        ▼
 [2] Matnni tozalash (normalizatsiya)
        │
        ▼
 [3] Fuzzy Matching (RapidFuzz)
        │
        ▼
  Eng yaqin mos dori nomi/nomlari (ehtimollik bilan)
        │
        ▼
  Qidiruv moduliga uzatiladi (GoPharm/Google)
```

## 2. Bosqich 1: Speech-to-Text (Whisper)

### 2.1. Vazifa

Foydalanuvchidan kelgan audio faylni (odatda `.wav` yoki `.webm` formatida, brauzer orqali yozib olingan) matnga aylantirish.

### 2.2. Model tanlovi

| Model | Hajmi | Tezlik | Aniqlik | Tavsiya |
|---|---|---|---|---|
| Whisper `tiny` | ~75MB | Juda tez | Past | Faqat test uchun |
| Whisper `base` | ~145MB | Tez | O'rtacha | **CPU serverlar uchun tavsiya etiladi** |
| Whisper `small` | ~500MB | O'rtacha | Yaxshi | Agar server resurslari ruxsat bersa |
| OpenAI Whisper API | — | Tez (tashqi) | Yuqori | Agar lokal server kuchsiz bo'lsa |

**Tavsiya:** Loyiha boshida `base` modeli lokal ishga tushiriladi (CPU'da ham maqbul tezlikda ishlaydi, 3-4 foydalanuvchi uchun to'liq yetarli). Agar aniqlik yetarli bo'lmasa, OpenAI Whisper API'ga o'tish variant sifatida qoladi.

### 2.3. Til sozlamalari

- Dori nomlari ko'pincha lotin/rus/o'zbek tillarida aralash talaffuz qilinishi mumkin.
- Whisper modeliga til avtomatik aniqlash (auto-detect) yoki qo'lda belgilangan (`uz`, `ru`) rejimda ishlashi mumkinligi ko'rib chiqiladi — amalda test qilib, qaysi rejim yaxshiroq natija berishi aniqlanadi.

## 3. Bosqich 2: Matnni normalizatsiya qilish

Whisper natijasi ba'zan quyidagicha bo'lishi mumkin:
- Katta-kichik harflar aralash
- Ortiqcha bo'shliqlar
- Raqamlar so'z bilan aralashgan holat (masalan, "parasetamol 500")

Bu bosqichda oddiy matn tozalash amalga oshiriladi:
- Kichik harflarga o'tkazish
- Ortiqcha belgilarni olib tashlash
- Dozirovka (masalan, "500 mg") alohida ajratib olinishi (agar kerak bo'lsa, keyingi bosqichlarda ishlatish uchun)

## 4. Bosqich 3: Fuzzy Matching (RapidFuzz)

### 4.1. Vazifa

Foydalanuvchi talaffuzida xato bo'lgan yoki Whisper noto'g'ri tanigan so'zni, mavjud dorilar lug'atidagi **eng yaqin nomga** moslashtirish.

### 4.2. Ishlash printsipi

1. Tizimda oldindan tayyorlangan **dori nomlari lug'ati** bo'ladi (GoPharm bazasidan yoki keshdan olingan nomlar ro'yxati).
2. RapidFuzz'ning `process.extract()` yoki shunga o'xshash funksiyasi orqali, Whisper natijasi ushbu lug'at bilan solishtiriladi.
3. Eng yuqori o'xshashlik foiziga ega bo'lgan 1-3 ta nomzod (candidate) tanlanadi.
4. Agar o'xshashlik darajasi belgilangan chegaradan (masalan, 70%) yuqori bo'lsa — natija to'g'ridan-to'g'ri qidiruvga yuboriladi.
5. Agar bir nechta yaqin nomzod bo'lsa (masalan, 2 ta dori nomi juda o'xshash) — foydalanuvchiga tanlash imkoniyati taqdim etiladi ("Nazarda tutgan dorimingiz shumi?").

### 4.3. Nega RapidFuzz

- Juda tez ishlaydi (C++ yadrosi tufayli), minimal resurslarda ham minglab nomlarni bir necha millisekundda solishtira oladi.
- Bir nechta algoritm (Levenshtein, token sort ratio va h.k.) qo'llab-quvvatlaydi — turli xil talaffuz xatolarini yaxshi qamrab oladi.

## 5. Modul strukturasi (fayllar, kod yozilmaydi — faqat tuzilma tavsifi)

```
ai/
 ├── speech_to_text.py     → Whisper bilan ishlash funksiyalari
 ├── text_normalizer.py    → Matnni tozalash funksiyalari
 ├── fuzzy_matcher.py      → RapidFuzz bilan ishlash funksiyalari
 └── medicine_dictionary.py → Dori nomlari lug'atini yuklash/yangilash
```

## 6. Xatoliklarni boshqarish (Error Handling)

| Holat | Tizim reaksiyasi |
|---|---|
| Audio fayl bo'sh yoki buzilgan | Foydalanuvchiga "Ovoz aniqlanmadi, qayta urinib ko'ring" xabari |
| Whisper hech narsa tanimadi | "Iltimos, aniqroq talaffuz qiling" xabari |
| RapidFuzz mos nom topmadi (past o'xshashlik) | "Bunday nomli dori topilmadi" xabari + Google qidiruviga yo'naltirish taklifi |
| GoPharm javob bermadi (timeout) | Avtomatik ravishda Google qidiruviga zaxira (fallback) sifatida o'tish |

## 7. Kelajakdagi yaxshilanishlar (hozircha kiritilmaydi)

- Foydalanuvchiga xos talaffuz xususiyatlarini o'rganish (personalizatsiya).
- Dori nomlari lug'atini avtomatik yangilab turish (masalan, kunlik GoPharm bazasidan sinxronlash).
- Agar so'rovlar soni sezilarli oshsa, Whisper so'rovlarini navbatga qo'yish uchun fon vazifalar tizimi (Celery) qo'shilishi mumkin.
