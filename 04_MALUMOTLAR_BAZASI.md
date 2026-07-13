# Ma'lumotlar Bazasi Sxemasi

## 1. Umumiy tuzilish

Ma'lumotlar bazasi minimalistik tarzda loyihalanadi — faqat haqiqatan zarur bo'lgan jadvallar yaratiladi. Standart tanlov: **SQLite** (fayl: `pharmacy.db`), zaruratda **PostgreSQL**'ga o'tish mumkin (SQLAlchemy ORM ishlatilgani sababli kod deyarli o'zgarmaydi).

## 2. Jadvallar (Tables)

### 2.1. `users` — Foydalanuvchilar (apteka xodimlari)

| Ustun | Turi | Tavsif |
|---|---|---|
| id | INTEGER (PK) | Noyob identifikator |
| full_name | VARCHAR(255) | Xodimning to'liq ismi |
| username | VARCHAR(100), UNIQUE | Login uchun foydalanuvchi nomi |
| password_hash | VARCHAR(255) | Xeshlangan parol (bcrypt) |
| role | VARCHAR(50) | `admin` yoki `pharmacist` |
| pharmacy_id | INTEGER (FK → pharmacies.id) | Qaysi aptekaga tegishli |
| created_at | DATETIME | Ro'yxatdan o'tgan sana |

> 3-4 foydalanuvchi uchun ushbu jadval juda oddiy bo'lib qoladi — murakkab rol tizimlari (RBAC) shart emas, faqat `admin`/`pharmacist` yetarli.

### 2.2. `pharmacies` — Aptekalar

| Ustun | Turi | Tavsif |
|---|---|---|
| id | INTEGER (PK) | Noyob identifikator |
| name | VARCHAR(255) | Apteka nomi |
| address | VARCHAR(500) | Manzil |
| phone | VARCHAR(50) | Aloqa telefoni |
| created_at | DATETIME | Yaratilgan sana |

> Agar loyiha faqat bitta apteka uchun ishlatilsa, bu jadvalda bitta yozuv bo'ladi. Bir nechta apteka bo'lsa, bu jadval ularni ajratib turadi.

### 2.3. `search_queries` — Qidiruv so'rovlari (tarix)

| Ustun | Turi | Tavsif |
|---|---|---|
| id | INTEGER (PK) | Noyob identifikator |
| user_id | INTEGER (FK → users.id) | Kim qidirgan |
| raw_transcript | TEXT | Whisper natijasida olingan xom matn |
| corrected_query | TEXT | RapidFuzz orqali tuzatilgan dori nomi |
| source_used | VARCHAR(50) | `gopharm` yoki `google` |
| result_found | BOOLEAN | Natija topildimi |
| created_at | DATETIME | Qidiruv vaqti |

> Bu jadval statistikani kuzatish va kelajakda tizimni yaxshilash (masalan, qaysi so'zlar ko'p noto'g'ri tanilishini bilish) uchun foydali.

### 2.4. `medicines_cache` — Dorilar keshi (ixtiyoriy, tezlik uchun)

| Ustun | Turi | Tavsif |
|---|---|---|
| id | INTEGER (PK) | Noyob identifikator |
| name | VARCHAR(255) | Dori nomi (GoPharm'dan olingan) |
| description | TEXT | Qisqacha tavsif |
| price | DECIMAL | Narx (mavjud bo'lsa) |
| image_url | TEXT | Rasm manzili (Google qidiruvidan yoki GoPharm'dan) |
| source | VARCHAR(50) | Ma'lumot qayerdan olingani |
| last_updated | DATETIME | Oxirgi yangilangan vaqt |

> **Maqsad:** Har safar bir xil dori uchun GoPharm/Google'ga qayta murojaat qilmaslik — bu tezlikni oshiradi va tashqi so'rovlar sonini kamaytiradi. Bu oddiy DB-darajasidagi kesh bo'lib, Redis kabi qo'shimcha texnologiya talab qilmaydi.

## 3. Jadvalar orasidagi bog'lanish (Relationship) diagrammasi

```
pharmacies (1) ──── (N) users
users (1) ──── (N) search_queries
medicines_cache — mustaqil jadval (keshlash uchun)
```

## 4. Indekslar (Indexes)

Tezkor qidiruv uchun quyidagi indekslar tavsiya etiladi:

- `users.username` — UNIQUE INDEX (login tezligi uchun)
- `search_queries.user_id` — INDEX (tarixni tez chiqarish uchun)
- `medicines_cache.name` — INDEX (keshdan tez qidirish uchun)

## 5. Migratsiya strategiyasi

- Boshlang'ich bosqichda **Alembic** (SQLAlchemy uchun migratsiya vositasi) ishlatiladi — bu kichik loyihalar uchun ham standart va yengil vosita.
- Har bir sxema o'zgarishi alohida migratsiya fayli sifatida saqlanadi, bu kelajakda SQLite'dan PostgreSQL'ga o'tishni ham osonlashtiradi.

## 6. Zaxira nusxalash (Backup)

- **SQLite holatida:** oddiy fayl nusxalash yetarli (`pharmacy.db` faylini kunlik/haftalik nusxalash, masalan, cron job yoki qo'lda).
- Murakkab backup-restore infratuzilmasi (masalan, avtomatlashtirilgan snapshot tizimlari) bu masshtabda talab qilinmaydi.
