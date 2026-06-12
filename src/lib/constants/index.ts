export const ROLES = {
  SUPERADMIN: "SUPERADMIN",
  EDITOR: "EDITOR",
  AUTHOR: "AUTHOR",
} as const;

export const ARTICLE_STATUS = {
  DRAFT: "DRAFT",
  REVIEW: "REVIEW",
  PUBLISHED: "PUBLISHED",
  ARCHIVED: "ARCHIVED",
} as const;

export const CONTENT_TYPE = {
  MARKDOWN: "MARKDOWN",
  HTML: "HTML",
} as const;

export const CATEGORIES = {
  RISET: "Riset",
  TEKNOLOGI_AI: "Teknologi & AI",
  TUTORIAL: "Tutorial",
  KNOWLEDGE_BASE: "Knowledge Base",
} as const;

export const CATEGORY_SLUGS = {
  RISET: "riset",
  TEKNOLOGI_AI: "teknologi-ai",
  TUTORIAL: "tutorial",
  KNOWLEDGE_BASE: "knowledge-base",
} as const;

export const CATEGORY_META: Record<string, { label: string; description: string; icon: string }> = {
  riset: {
    label: "Riset",
    description: "Ringkasan paper arXiv & riset AI terbaru",
    icon: "🔬",
  },
  "teknologi-ai": {
    label: "Teknologi & AI",
    description: "Berita teknologi, AI, dan inovasi digital",
    icon: "💻",
  },
  tutorial: {
    label: "Tutorial",
    description: "Panduan langkah-demi-langkah programming & tools",
    icon: "📖",
  },
  "knowledge-base": {
    label: "Knowledge Base",
    description: "Referensi, dokumentasi, dan pengetahuan umum",
    icon: "📚",
  },
} as const;

export const NEWS_SOURCES = {
  AI: ["OpenAI", "Anthropic", "Google AI", "NVIDIA", "TechCrunch", "The Verge"],
  TECHNOLOGY: ["Ars Technica", "Wired", "Hacker News", "GitHub Blog"],
} as const;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PER_PAGE: 10,
  MAX_PER_PAGE: 50,
} as const;

export const UPLOAD = {
  MAX_FILE_SIZE: 1 * 1024 * 1024, // 1MB
  ALLOWED_MIME_TYPES: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  MAX_WIDTH: 1920,
  THUMBNAIL_WIDTH: 400,
} as const;

export const APP_NAME = "Hermes Blog";
export const APP_DESCRIPTION = "Advanced AI-Powered Blog Platform";
