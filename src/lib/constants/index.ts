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
  AI: "Artificial Intelligence",
  US_STOCKS: "US Stock Market",
  ID_STOCKS: "Indonesian Stock Market",
  TECHNOLOGY: "Technology News",
} as const;

export const NEWS_SOURCES = {
  AI: ["OpenAI", "Anthropic", "Google AI", "NVIDIA", "TechCrunch", "The Verge"],
  US_STOCKS: ["CNBC", "Bloomberg", "Yahoo Finance", "MarketWatch"],
  ID_STOCKS: ["IDX", "Kontan", "Bisnis Indonesia", "CNBC Indonesia"],
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
