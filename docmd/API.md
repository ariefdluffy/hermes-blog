# Hermes Blog — API Documentation

Dokumentasi REST API untuk konsumsi konten oleh **Hermes Agent**.

## Daftar Isi

- [Base URL](#base-url)
- [Categories](#categories)
- [Autentikasi Hermes Agent](#autentikasi-hermes-agent)
- [Hermes API (Agent)](#hermes-api-agent)
  - [`GET /api/hermes/article` — Health Check](#get-apihermesarticle--health-check)
  - [`POST /api/hermes/article` — Submit Article](#post-apihermesarticle--submit-article)
  - [`GET /api/hermes/articles` — Fetch Articles](#get-apihermesarticles--fetch-articles)
  - [`GET /api/hermes/article/[slug]` — Get Article](#get-apihermesarticleslug--get-article)
  - [`PATCH /api/hermes/article/[id]` — Update Article](#patch-apihermesarticleid--update-article)
  - [`GET/PUT/PATCH /api/hermes/articles/[id]` — Articles Alias](#getputpatch-apihermesarticlesid--articles-alias)
- [Public API](#public-api)
  - [`GET /api/articles` — List Articles](#get-apiarticles--list-articles)
  - [`GET /api/articles/[...slug]` — Get Article](#get-apiarticlesslug--get-article)
  - [`GET /api/search` — Search Articles](#get-apisearch--search-articles)
  - [`GET /api/tags` — List Tags](#get-apitags--list-tags)
  - [`GET /api/categories` — List Categories](#get-apicategories--list-categories)
  - [`GET /api/trending` — Trending Articles](#get-apitrending--trending-articles)
- [Data Models](#data-models)
- [Error Codes](#error-codes)
- [Rate Limiting](#rate-limiting)
- [Environment Variables](#environment-variables)
- [Quick Start Script](#quick-start-script)

---

## Base URL

| Environment | URL                          |
|-------------|------------------------------|
| Production  | `https://lockbit.my.id`      |
| Local       | `http://localhost:5173`      |

---

## Categories

Semua endpoint sekarang menggunakan **Category model** (terpisah dari Tag).

| Slug | Name | Description |
|---|---|---|
| `riset` | Riset | Ringkasan paper arXiv & riset AI terbaru |
| `teknologi-ai` | Teknologi & AI | Berita teknologi, AI, dan inovasi digital |
| `tutorial` | Tutorial | Panduan langkah-demi-langkah programming & tools |
| `knowledge-base` | Knowledge Base | Referensi, dokumentasi, dan pengetahuan umum |

---

## Autentikasi Hermes Agent

Endpoint Hermes (`/api/hermes/*`) membutuhkan API key via header:

```
X-Hermes-API-Key: <your-api-key>
```

Atau via `Authorization: Bearer`:

```
Authorization: Bearer <your-api-key>
```

### Setup API Key

1. Generate hash di environment:

```bash
# Generate salt & key
SALT=$(openssl rand -hex 16)
KEY=$(openssl rand -hex 32)
HASH=$(echo -n "$SALT:$KEY" | sha256sum | cut -d' ' -f1)

echo "SALT: $SALT"
echo "KEY:  $KEY"
echo "HASH: $HASH"
```

2. Set di `.env`:

```env
HERMES_API_KEY_HASH="<hash>"
HERMES_API_KEY_SALT="<salt>"
HERMES_API_KEY_SCOPE="write"
```

| Scope  | Permission                         |
|--------|------------------------------------|
| `read`  | Read-only (health check + fetch)  |
| `write` | Read + submit articles             |
| `admin` | Full access (future admin ops)     |

---

## Hermes API (Agent)

---

### `GET /api/hermes/article` — Health Check

Cek status service, database, & available categories.

**Headers:** `X-Hermes-API-Key` (required, minimal scope `read`)

**Response `200`:**

```json
{
  "status": "ok",
  "version": "1.0",
  "timestamp": "2026-06-05T12:00:00.000Z",
  "uptime": 12345.67,
  "db": "connected",
  "categories": [
    { "slug": "riset", "name": "Riset" },
    { "slug": "teknologi-ai", "name": "Teknologi & AI" }
  ]
}
```

---

### `POST /api/hermes/article` — Submit Article

Mengirim artikel baru dari Hermes Agent.

**Headers:**

| Header             | Required | Description                               |
|--------------------|----------|-------------------------------------------|
| `X-Hermes-API-Key` | Yes      | API key dengan scope `write` atau `admin` |
| `Content-Type`     | Yes      | `application/json`                        |
| `X-Request-ID`     | No       | Custom request ID untuk tracing           |

**Body:**

```json
{
  "title": "Judul Artikel",
  "excerpt": "Ringkasan singkat artikel",
  "content": "# Konten artikel dalam markdown...",
  "contentType": "MARKDOWN",
  "category": "riset",
  "seoTitle": "SEO Optimized Title",
  "seoDescription": "SEO meta description artikel ini",
  "coverImage": "https://example.com/image.jpg",
  "source": "arXiv",
  "tags": ["LLM", "deep-learning", "transformer"]
}
```

**Field Details:**

| Field          | Type       | Required | Default    | Description                              |
|----------------|------------|----------|------------|------------------------------------------|
| `title`        | `string`   | ✅        | —          | Judul artikel (1-255 chars)              |
| `excerpt`      | `string`   | ✅        | —          | Ringkasan (1-1000 chars)                 |
| `content`      | `string`   | ✅        | —          | Full konten (markdown/HTML)              |
| `contentType`  | `enum`     | ❌        | `MARKDOWN` | `MARKDOWN` atau `HTML`                   |
| `category`     | `string`   | ✅        | —          | **Slug atau name** — lihat [Categories](#categories) |
| `seoTitle`     | `string`   | ❌        | —          | SEO title (max 255 chars)                |
| `seoDescription` | `string` | ❌        | —          | SEO description (max 500 chars)          |
| `coverImage`   | `string`   | ❌        | —          | URL cover image                          |
| `source`       | `string`   | ❌        | —          | Sumber konten (e.g. "arXiv", "TechCrunch") |
| `tags`         | `string[]` | ❌        | `[]`       | Array tag names                          |

**Category Resolution** (flexible — accepts any string):
1. Match by **slugified value** (`slugify(category)`)
2. Match by **raw slug**
3. Match by **name** (case-insensitive, MySQL collation)
4. **Auto-create** jika tidak ditemukan (proper slug + Title Case name)

Contoh value yang diterima:
| Input | Resolves To |
|---|---|
| `"riset"` | Kategori `riset` (by slug) |
| `"Riset"` | Kategori `riset` (by name, CI) |
| `"teknologi-ai"` | Kategori `teknologi-ai` (by slug) |
| `"Teknologi & AI"` | Kategori `teknologi-ai` (by name) |
| `"AI"` | Auto-create kategori baru `ai` |

**Response `201`:**

```json
{
  "id": "art_xyz123",
  "slug": "judul-artikel",
  "title": "Judul Artikel",
  "status": "DRAFT",
  "createdAt": "2026-06-05T12:00:00.000Z"
}
```

**Response `400` — Validation Error:**

```json
{
  "error": "Validation failed",
  "code": "VALIDATION_ERROR",
  "request_id": "uuid",
  "details": {
    "title": ["Required"]
  }
}
```

**Response `401` — Invalid/ Missing API Key:**

```json
{
  "error": "Missing API key",
  "code": "INVALID_API_KEY",
  "request_id": "uuid"
}
```

**Response `429` — Rate Limited:**

```json
{
  "error": "Too many requests",
  "code": "RATE_LIMITED",
  "request_id": "uuid"
}
```

---

### `GET /api/hermes/articles` — Fetch Articles

Fetch published articles (read scope required).

**Headers:** `X-Hermes-API-Key` (required, minimal scope `read`)

**Query Parameters:**

| Parameter  | Type      | Default | Description                                    |
|------------|-----------|---------|------------------------------------------------|
| `category` | `string`  | —       | Filter by category slug                        |
| `tag`      | `string`  | —       | Filter by tag slug                             |
| `q`        | `string`  | —       | Search di title, excerpt, content              |
| `days`     | `integer` | —       | **Trending mode** — ambil N hari terakhir by views |
| `limit`    | `integer` | `10`    | Max item (1-50, hanya di trending mode)        |
| `page`     | `integer` | `1`     | Halaman (min 1, tidak di trending mode)        |
| `perPage`  | `integer` | `10`    | Per halaman (1-50, tidak di trending mode)     |

**Mode:**
- **Normal** (tanpa `days`): Paginated, ordered by `publishedAt` desc
- **Trending** (dengan `days`): Top by views, ignore pagination

**Response `200` (normal):**

```json
{
  "data": [
    {
      "id": "art_xyz",
      "slug": "judul-artikel",
      "title": "Judul Artikel",
      "excerpt": "Ringkasan...",
      "contentType": "MARKDOWN",
      "views": 42,
      "readTime": 7,
      "status": "PUBLISHED",
      "publishedAt": "2026-06-04T08:00:00.000Z",
      "createdAt": "2026-06-05T18:56:17.690Z",
      "updatedAt": "2026-06-05T19:05:38.464Z",
      "author": { "id": "usr_001", "username": "ariefdluffy" },
      "category": { "id": "cat_001", "name": "Riset", "slug": "riset" },
      "tags": [
        { "id": "tag_001", "name": "Artificial Intelligence", "slug": "ai" }
      ]
    }
  ],
  "total": 74,
  "page": 1,
  "perPage": 10,
  "totalPages": 8
}
```

**Response `200` (trending):** Array of article objects (sama seperti item `data[]` di atas, tanpa pagination wrapper).

---

### `GET /api/hermes/article/[slug]` — Get Article by Slug or ID

Ambil 1 artikel by slug atau ID.

**Headers:** `X-Hermes-API-Key` (required, scope `read`)

**Response `200`:** Sama seperti item `data[]` di `/api/hermes/articles`.

**Response `404`:**
```json
{ "error": "Article not found", "code": "NOT_FOUND", "request_id": "uuid" }
```

---

### `PATCH /api/hermes/article/[id]` — Update Article

Update artikel by ID atau slug.

**Headers:** `X-Hermes-API-Key` (required, scope `write`)

**Body (partial):**
```json
{
  "title": "Updated Title",
  "status": "PUBLISHED",
  "category": "riset",
  "tags": ["updated", "tags"]
}
```

Semua field optional. Field yg tidak dikirim tidak berubah.

**Response `200`:** Article object lengkap.

---

### `GET/PUT/PATCH /api/hermes/articles/[id]` — Same as `/api/hermes/article/[id]`

Alias endpoint — identik dengan `/api/hermes/article/[id]` di atas.

---

## Public API

Public endpoints — no auth required.

### `GET /api/articles` — List Articles

List artikel PUBLISHED dengan pagination & filter.

**Query Parameters:**

| Parameter  | Type      | Default | Description                                    |
|------------|-----------|---------|------------------------------------------------|
| `page`     | `integer` | `1`     | Halaman (min 1)                                |
| `perPage`  | `integer` | `10`    | Per halaman (1-50)                             |
| `category` | `string`  | —       | Filter by category slug                        |
| `tag`      | `string`  | —       | Filter by tag slug                             |
| `search`   | `string`  | —       | Search di title, excerpt, content              |
| `featured` | `boolean` | —       | `true` → top 5 by views (ignore pagination)   |

**Response `200`:**

```json
{
  "data": [
    {
      "id": "art_xyz",
      "slug": "research/daily-digest/2026-06-04",
      "title": "Ringkasan Riset Harian — 4 Juni 2026",
      "excerpt": "Research digest arXiv...",
      "content": "# Full content...",
      "contentType": "MARKDOWN",
      "seoTitle": null,
      "seoDescription": null,
      "coverImage": null,
      "views": 42,
      "readTime": 7,
      "status": "PUBLISHED",
      "publishedAt": "2026-06-04T08:00:00.000Z",
      "createdAt": "2026-06-05T18:56:17.690Z",
      "updatedAt": "2026-06-05T19:05:38.464Z",
      "author": { "id": "usr_default", "username": "ariefdluffy" },
      "category": { "id": "cat_001", "name": "Riset", "slug": "riset" },
      "tags": [
        { "id": "tag_001", "name": "Artificial Intelligence", "slug": "ai" }
      ]
    }
  ],
  "total": 74,
  "page": 1,
  "perPage": 10,
  "totalPages": 8
}
```

---

### `GET /api/articles/[...slug]` — Get Article

Ambil 1 artikel berdasarkan slug (multi-segment support). Response includes `category`.

**Response `200`:** Sama seperti item `data[]` di `/api/articles`, objek tunggal.

**Response `404`:**

```json
{ "error": "Article not found" }
```

---

### `GET /api/search` — Search Articles

Full-text search di artikel PUBLISHED.

**Query Parameters:**

| Parameter | Type      | Default | Description                       |
|-----------|-----------|---------|-----------------------------------|
| `q`       | `string`  | **required** | Search query                   |
| `page`    | `integer` | `1`     | Halaman                           |
| `perPage` | `integer` | `10`    | Per halaman (1-50)                |

**Response `200`:** Sama seperti paginated response di `/api/articles` (includes `category`).

**Response `400`:**

```json
{ "error": "Search query is required" }
```

---

### `GET /api/tags` — List Tags

Semua tag dengan jumlah artikel PUBLISHED per tag.

**Response `200`:**

```json
[
  { "id": "tag_001", "name": "Artificial Intelligence", "slug": "ai", "articleCount": 50 }
]
```

---

### `GET /api/categories` — List Categories

Category list (model terpisah dari Tag) dengan jumlah artikel per kategori.

**Response `200`:**

```json
{
  "data": [
    { "id": "cat_001", "slug": "riset", "name": "Riset", "description": "Ringkasan paper arXiv & riset AI terbaru", "icon": "🔬", "count": 15 },
    { "id": "cat_002", "slug": "teknologi-ai", "name": "Teknologi & AI", "description": "Berita teknologi, AI, dan inovasi digital", "icon": "💻", "count": 20 }
  ]
}
```

---

### `GET /api/trending` — Trending Articles

Artikel dengan views terbanyak dalam X hari terakhir.

**Query Parameters:**

| Parameter | Type      | Default | Description                               |
|-----------|-----------|---------|-------------------------------------------|
| `days`    | `integer` | `7`     | Jumlah hari ke belakang (min 1)           |
| `limit`   | `integer` | `10`    | Max item (1-50)                           |

**Response `200`:** Array of article objects (includes `category`).

---

## Data Models

### ArticleResponse

```typescript
interface ArticleResponse {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  contentType: "MARKDOWN" | "HTML";
  seoTitle: string | null;
  seoDescription: string | null;
  coverImage: string | null;
  views: number;
  readTime: number | null;
  status: "PUBLISHED" | "DRAFT" | "REVIEW" | "ARCHIVED";
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  author: { id: string; username: string };
  category: { id: string; name: string; slug: string } | null;
  tags: { id: string; name: string; slug: string }[];
}
```

### PaginatedResponse

```typescript
interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}
```

---

## Error Codes

**Hermes API (`/api/hermes/*`):**

| Code                    | HTTP Status | Description                          |
|-------------------------|-------------|--------------------------------------|
| `INVALID_API_KEY`       | `401`       | Missing or invalid API key           |
| `INSUFFICIENT_SCOPE`    | `403`       | API key scope insufficient           |
| `RATE_LIMITED`          | `429`       | Rate limit exceeded (10 req/min)     |
| `VALIDATION_ERROR`      | `400`       | Request body validation failed       |
| `AGENT_NOT_CONFIGURED`  | `503`       | Hermes auth env vars not set         |
| `INTERNAL_ERROR`        | `500`       | Database or server error             |

**Public API:**

| HTTP Status | Description                          |
|-------------|--------------------------------------|
| `400`       | Invalid query params                 |
| `404`       | Article not found / resource missing |
| `500`       | Internal server error                |

---

## Rate Limiting

**Hermes API** menerapkan sliding window rate limiter:

| Metric          | Limit                |
|-----------------|----------------------|
| Window          | 60 detik             |
| Max requests    | 10 per window        |
| Per-key tracking| Berdasarkan API key  |

Rate limit headers di response:

```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 7
X-RateLimit-Reset: 1717574400
```

**Public API** tidak ada rate limiting (belum diimplementasikan).

---

## Environment Variables

```env
# Database
DATABASE_URL="mysql://root:password@localhost:3306/hermes_blog"

# Hermes Agent Authentication
HERMES_API_KEY_HASH="sha256-hex-of-api-key"
HERMES_API_KEY_SALT="random-salt-string"
HERMES_API_KEY_SCOPE="write"

# App
PUBLIC_APP_URL="https://lockbit.my.id"
```

Generate key:

```bash
SALT=$(openssl rand -hex 16)
KEY=$(openssl rand -hex 32)
HASH=$(echo -n "$SALT:$KEY" | sha256sum | cut -d' ' -f1)
echo "API Key: $KEY"
echo "Add to .env:"
echo "HERMES_API_KEY_HASH=\"$HASH\""
echo "HERMES_API_KEY_SALT=\"$SALT\""
echo "HERMES_API_KEY_SCOPE=\"write\""
```

---

## Quick Start Script

```bash
# Health check + see available categories
curl -s -H "X-Hermes-API-Key: $HERMES_KEY" https://lockbit.my.id/api/hermes/article | jq .

# Submit article with new category slug
curl -s -X POST https://lockbit.my.id/api/hermes/article \
  -H "X-Hermes-API-Key: $HERMES_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Article from Hermes",
    "excerpt": "Brief excerpt",
    "content": "# Full markdown content",
    "category": "riset",
    "tags": ["test", "hermes"]
  }' | jq .

# Fetch articles by category
curl -s -H "X-Hermes-API-Key: $HERMES_KEY" \
  "https://lockbit.my.id/api/hermes/articles?category=riset&perPage=5" | jq .

# Trending
curl -s -H "X-Hermes-API-Key: $HERMES_KEY" \
  "https://lockbit.my.id/api/hermes/articles?days=7&limit=10" | jq .

# Public: list articles
curl -s "https://lockbit.my.id/api/articles?page=1&perPage=5" | jq .

# Public: filter by category
curl -s "https://lockbit.my.id/api/articles?category=riset" | jq .

# Public: categories
curl -s "https://lockbit.my.id/api/categories" | jq .

# Public: trending
curl -s "https://lockbit.my.id/api/trending?days=30&limit=5" | jq .
```

---

*Dokumentasi ini untuk Hermes Agent — auto-generated content pipeline.*
