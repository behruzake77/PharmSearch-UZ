# API Spetsifikatsiyasi

## 1. Umumiy qoidalar

- Barcha endpointlar `/api/v1/` prefiksi bilan boshlanadi.
- Ma'lumot formati: JSON.
- Autentifikatsiya: Bearer token (JWT), oddiy login/parol asosida.
- Xatoliklar standart HTTP status kodlari orqali qaytariladi (400, 401, 404, 500 va h.k.).

## 2. Autentifikatsiya endpointlari

### 2.1. `POST /api/v1/auth/login`

**Vazifa:** Foydalanuvchini tizimga kiritish.

**So'rov (Request body):**
```json
{
  "username": "string",
  "password": "string"
}
```

**Javob (200 OK):**
```json
{
  "access_token": "string",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "full_name": "string",
    "role": "pharmacist"
  }
}
```

**Xatolik (401):** Login yoki parol noto'g'ri bo'lganda.

---

### 2.2. `GET /api/v1/auth/me`

**Vazifa:** Joriy login qilgan foydalanuvchi ma'lumotlarini olish.

**Header:** `Authorization: Bearer <token>`

**Javob (200 OK):**
```json
{
  "id": 1,
  "full_name": "string",
  "role": "pharmacist",
  "pharmacy_id": 1
}
```

## 3. Ovozli qidiruv endpointlari

### 3.1. `POST /api/v1/search/voice`

**Vazifa:** Audio faylni qabul qilib, to'liq AI pipeline orqali dori nomini aniqlash va qidirish.

**So'rov:** `multipart/form-data`
- `audio_file`: audio fayl (.wav, .webm, .mp3)

**Javob (200 OK):**
```json
{
  "raw_transcript": "parasetamol 500 mg bering",
  "corrected_query": "Paracetamol",
  "confidence": 0.92,
  "results": [
    {
      "name": "Paracetamol 500mg",
      "description": "Isitma va og'riqni pasaytiruvchi vosita",
      "price": 4500,
      "image_url": "https://...",
      "source": "gopharm"
    }
  ],
  "alternative_matches": ["Paracetamol Forte", "Panadol"]
}
```

**Javob (topilmadi holati, 200 OK, bo'sh natija bilan):**
```json
{
  "raw_transcript": "...",
  "corrected_query": null,
  "confidence": 0.35,
  "results": [],
  "alternative_matches": [],
  "message": "Dori topilmadi, iltimos qayta urinib ko'ring"
}
```

**Xatolik (400):** Audio fayl noto'g'ri formatda yoki bo'sh bo'lsa.

---

### 3.2. `POST /api/v1/search/text`

**Vazifa:** Ovozsiz, to'g'ridan-to'g'ri matn orqali qidirish (masalan, foydalanuvchi qo'lda yozmoqchi bo'lsa yoki mikrofon ishlamasa).

**So'rov:**
```json
{
  "query": "parasetomol"
}
```

**Javob:** Yuqoridagi `/search/voice` bilan bir xil formatda (`raw_transcript` maydoni so'ralgan matn bilan bir xil bo'ladi).

---

### 3.3. `GET /api/v1/search/history`

**Vazifa:** Joriy foydalanuvchining oxirgi qidiruvlar tarixini olish.

**Query parametrlar:**
- `limit` (ixtiyoriy, standart: 20)

**Javob (200 OK):**
```json
{
  "history": [
    {
      "id": 15,
      "corrected_query": "Paracetamol",
      "result_found": true,
      "created_at": "2026-07-10T14:22:00Z"
    }
  ]
}
```

## 4. Dori/kesh bilan bog'liq endpointlar (ixtiyoriy, ikkinchi bosqichda)

### 4.1. `GET /api/v1/medicines/{name}`

**Vazifa:** Keshda saqlangan dori ma'lumotini to'g'ridan-to'g'ri olish (agar mavjud bo'lsa).

**Javob (200 OK):**
```json
{
  "name": "Paracetamol 500mg",
  "description": "...",
  "price": 4500,
  "image_url": "https://...",
  "last_updated": "2026-07-01T10:00:00Z"
}
```

**Xatolik (404):** Kesh ichida bunday dori topilmasa.

## 5. Xizmat holati (health check)

### 5.1. `GET /api/v1/health`

**Vazifa:** Serverning ishlab turganini tekshirish (monitoring uchun eng oddiy usul).

**Javob (200 OK):**
```json
{
  "status": "ok",
  "whisper_loaded": true,
  "db_connected": true
}
```

## 6. Xatoliklarni qaytarish standarti

Barcha xatoliklar quyidagi umumiy formatda qaytariladi:

```json
{
  "error": {
    "code": "AUDIO_INVALID",
    "message": "Audio fayl formati qo'llab-quvvatlanmaydi"
  }
}
```

| Kod | Tavsif |
|---|---|
| `AUDIO_INVALID` | Audio fayl noto'g'ri yoki bo'sh |
| `NO_MATCH_FOUND` | Hech qanday dori topilmadi |
| `UNAUTHORIZED` | Token yo'q yoki noto'g'ri |
| `EXTERNAL_SERVICE_ERROR` | GoPharm yoki Google xizmati javob bermadi |
| `INTERNAL_ERROR` | Kutilmagan server xatoligi |

## 7. Eslatma

Ushbu API spetsifikatsiyasi **minimal va amaliy** tarzda tuzilgan — 3-4 foydalanuvchi uchun to'liq yetarli bo'lgan endpointlar soni belgilangan. Keraksiz endpointlar (masalan, ko'p bosqichli filtrlash, kengaytirilgan qidiruv parametrlari) ataylab kiritilmagan; ular kelajakda talab paydo bo'lganda qo'shiladi.
