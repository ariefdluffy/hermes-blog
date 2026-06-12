# Hermes Blog API

## Categories

Semua endpoint article sekarang support **Category** (bukan Tag). Category model terpisah.

| Slug | Name |
|---|---|
| `riset` | Riset |
| `teknologi-ai` | Teknologi & AI |
| `tutorial` | Tutorial |
| `knowledge-base` | Knowledge Base |

---

## Public API

### `GET /api/categories`
Daftar semua kategori dengan jumlah artikel published.

```json
{
  "data": [
    { "id": "...", "slug": "riset", "name": "Riset", "description": "...", "icon": "🔬", "count": 5 }
  ]
}
```

### `GET /api/articles`
List published articles. Filter by category:

| Param | Example |
|---|---|
| `?category=riset` | Filter by category slug |
| `?tag=javascript` | Filter by tag slug |
| `?q=search` | Search title/excerpt/content |
| `?page=1&perPage=10` | Pagination |
| `?featured=true` | Top 5 by views |

Response includes `category` field:

```json
{
  "data": [{
    "id": "...",
    "title": "...",
    "category": { "id": "...", "name": "Riset", "slug": "riset" },
    "tags": [{ "id": "...", "name": "AI", "slug": "ai" }]
  }],
  "total": 10,
  "page": 1,
  "perPage": 10,
  "totalPages": 1
}
```

### `GET /api/articles/[...slug]`
Single article detail. Includes `category`.

### `GET /api/search?q=...`
Search published articles. Includes `category`.

### `GET /api/trending?days=7&limit=10`
Trending articles by views. Includes `category`.

### `GET /api/tags`
Daftar semua tags.

---

## Hermes Agent API

Authenticated with `x-hermes-api-key` header (or `Authorization: Bearer`).

### `GET /api/hermes/article`
Health check + available categories.

```json
{
  "status": "ok",
  "version": "1.0",
  "categories": [
    { "slug": "riset", "name": "Riset" },
    { "slug": "teknologi-ai", "name": "Teknologi & AI" }
  ]
}
```

### `POST /api/hermes/article`
Submit article from external agent.

**Body:**

| Field | Type | Required |
|---|---|---|
| `title` | string | yes |
| `excerpt` | string | yes |
| `content` | string (markdown) | yes |
| `category` | string | yes — slug (e.g. `riset`) or name (e.g. `Riset`). Auto-resolve & auto-create if not exists. |
| `tags` | string[] | no (default `[]`) |
| `contentType` | `"MARKDOWN"` / `"HTML"` | no (default `MARKDOWN`) |
| `seoTitle` | string | no |
| `seoDescription` | string | no |
| `coverImage` | string (url) | no |
| `source` | string | no |

**Category resolution order:**
1. Match by slugified value (`slugify(category)`)
2. Match by raw slug
3. Match by name (case-insensitive, MySQL collation)
4. Auto-create with proper slug + Title Case name

**Response** (201):
```json
{
  "id": "...",
  "slug": "...",
  "title": "...",
  "status": "DRAFT",
  "createdAt": "..."
}
```

### `GET /api/hermes/articles`
Fetch published articles (read scope required).

| Param | Example | Description |
|---|---|---|
| `?category=riset` | Filter by category slug |
| `?tag=javascript` | Filter by tag slug |
| `?q=search` | Search |
| `?days=7&limit=10` | Trending mode (ordered by views) |
| `?page=1&perPage=10` | Pagination (not in trending mode) |

Response same format as `GET /api/articles`.

---

## Admin API

All admin endpoints require authentication (JWT session).

### `GET/POST /api/admin/categories`
CRUD categories. POST body:
```json
{ "name": "Riset", "slug": "riset", "description": "...", "icon": "🔬" }
```

### `GET/PUT/DELETE /api/admin/categories/[id]`
Single category CRUD.

### `GET/POST /api/admin/articles`
Admin article CRUD. Supports `categoryId` field.

### `PUT /api/admin/articles/[id]`
Update article. Supports `categoryId` field.

### `POST /api/admin/ai/generate`
AI article generation. Category validation by slug.

---

## Database Migration

```bash
npx prisma db push
```

Seed default categories:
```bash
bun run prisma/seed.ts <password>
```
